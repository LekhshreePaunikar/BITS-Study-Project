// backend/scripts/dynamicQuestionGeneration.js

const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { query } = require("../config/database");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const QUESTION_COUNT = 6;

async function generateResumeBasedQuestions({ userId, sessionId }) {
  /** Validate resume existence */
  const resumePath = path.join(
    __dirname,
    "..",
    "static",
    "resumes",
    `user-${userId}-resume.pdf`
  );

  if (!fs.existsSync(resumePath)) {
    throw new Error("RESUME_NOT_FOUND");
  }

  /** Extract resume text */
  const pdfBuffer = fs.readFileSync(resumePath);
  const resumeData = await pdfParse(pdfBuffer);
  const resumeText = resumeData.text.slice(0, 8000); // safety cap

  /** Fetch user + session context */
  const userRes = await query(
    `
    SELECT name, skills, experience, education, preferred_roles
    FROM "User"
    WHERE user_id = $1
    `,
    [userId]
  );

  const sessionRes = await query(
    `
    SELECT focus_area, selected_difficulty, keywords
    FROM "Session"
    WHERE session_id = $1 AND user_id = $2
    `,
    [sessionId, userId]
  );

  if (!userRes.rows.length || !sessionRes.rows.length) {
    throw new Error("INVALID_SESSION_OR_USER");
  }

  const user = userRes.rows[0];
  const session = sessionRes.rows[0];

  /** Build AI prompt */
  const candidateName = user.name || "the candidate";

  const prompt = `
You are a senior interviewer at a fast-growing technology company.

You are interviewing ${candidateName} for a real job role.
Your questions should feel like a real interview conversation, not exam questions.

Your task:
Generate exactly ${QUESTION_COUNT} interview questions that are:

STYLE & TONE:
- Friendly, professional, and realistic
- Conversational, like a human interviewer speaking
- Slightly elaborated (3–4 sentences per question)
- Sound like real workplace situations

PERSONALIZATION:
- Refer to ${candidateName} by name where appropriate
- Base questions strongly on their resume, experience, and skills
- Connect questions to what they have already worked on

COMPANY CONTEXT:
- Frame questions as if the company:
  - Works on real production systems
  - Uses modern tools, cloud platforms, and real constraints
  - Faces scale, performance, and collaboration challenges

QUESTION STYLE (examples of intent, NOT to copy literally):
- “In our team, we often work with AWS and distributed services…”
- “Suppose you joined us and needed to ramp up quickly on a new system…”
- “We recently faced a situation where… how would you approach this?”
- “Based on your experience with X, how would you handle Y?”

DIFFICULTY:
- Match the difficulty level: ${session.selected_difficulty}
- Ask follow-up style questions that test thinking, not memorization

LEARNING & ADAPTABILITY:
- Include at least 1 question about learning something new quickly
- Include at least 1 scenario where requirements are unclear or changing

SOURCE MATERIAL:

Resume:
${resumeText}

Skills: ${user.skills?.join(", ") || "N/A"}
Experience: ${user.experience || "N/A"}
Education: ${user.education || "N/A"}
Preferred Roles: ${user.preferred_roles || "N/A"}

Interview Focus Area: ${session.focus_area}
Keywords: ${session.keywords?.join(", ") || "None"}

STRICT OUTPUT RULES (VERY IMPORTANT):
- Output ONLY a valid JSON array of strings
- Each array item must be ONE complete question
- NO markdown
- NO explanations
- NO numbering
- Output must start with [ and end with ]
`;


  /** Call OpenAI */
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
  });

  let raw = completion.choices[0].message.content.trim();

  // Remove ```json ``` or ``` fences if present
  raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

  let questions;
  try {
    questions = JSON.parse(raw);
  } catch (err) {
    console.error("LLM raw output:", completion.choices[0].message.content);
    throw new Error("INVALID_LLM_JSON");
  }


  /** Insert into DB (transaction-safe) */
  await query("BEGIN");

  try {
    for (const text of questions) {
      // BaseQuestion
      const baseRes = await query(
        `
        INSERT INTO "BaseQuestion"
          (is_predefined, difficulty, created_by)
        VALUES
          (false, $1, $2)
        RETURNING question_id
        `,
        [session.selected_difficulty, userId]
      );

      const baseQuestionId = baseRes.rows[0].question_id;

      // DynamicQuestion
      await query(
        `
        INSERT INTO "DynamicQuestion"
          (base_question_id, model_id, user_id, session_id, generated_question_content)
        VALUES
          ($1, 1, $2, $3, $4)
        `,
        [baseQuestionId, userId, sessionId, text]
      );
    }

    await query("COMMIT");
  } catch (err) {
    await query("ROLLBACK");
    throw err;
  }

  return { success: true, count: questions.length };
}

module.exports = {
  generateResumeBasedQuestions,
};
