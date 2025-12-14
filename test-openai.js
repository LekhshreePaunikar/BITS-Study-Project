/* test-openai.js
 * - Reads sample_resume/sample_resume.pdf
 * - Extracts candidate info (name, education, skills, experience)
 * - Generates 6 human-like interview questions
 * - Stores them in BaseQuestion + DynamicQuestion
 */

require("dotenv").config({ path: "./.env.local" });

const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { OpenAI } = require("openai");
const { query } = require("./backend/config/database");

(async () => {
  try {
    console.log(
      "OpenAI API Key:",
      process.env.OPENAI_API_KEY ? "Loaded" : "Missing"
    );

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    /* Read & Parse Resume PDF */
    const resumePath = path.join(
      __dirname,
      "sample_resume",
      "sample_resume.pdf"
    );

    if (!fs.existsSync(resumePath)) {
      console.error("Resume PDF not found at:", resumePath);
      return;
    }

    const resumeBuffer = fs.readFileSync(resumePath);
    const parsedPdf = await pdfParse(resumeBuffer);

    const resumeText = parsedPdf.text.replace(/\s+/g, " ").trim();
    console.log("Resume parsed successfully");

    /* Extract Resume Signals using OpenAI */
    const extractionPrompt = `
You are an expert resume parser.

From the resume text below, extract:
- first_name
- education (short summary)
- experience (short summary)
- skills (array of keywords)

Return ONLY valid JSON in this format:

{
  "first_name": "",
  "education": "",
  "experience": "",
  "skills": []
}

Resume text:
"""
${resumeText}
"""
`;

    const extractionRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: "You extract structured resume data." },
        { role: "user", content: extractionPrompt },
      ],
    });

    const extracted = JSON.parse(
      extractionRes.choices[0].message.content.trim()
    );

    const firstName = extracted.first_name || "there";
    const education = extracted.education || "N/A";
    const experience = extracted.experience || "N/A";
    const skills = Array.isArray(extracted.skills)
      ? extracted.skills.join(", ")
      : "";

    console.log("Candidate Name:", firstName);
    console.log("Education:", education);
    console.log("Skills:", skills);

    /* 3. Fetch User (created_by = 2) */
    const userRes = await query(
      `SELECT user_id FROM "User" WHERE user_id = 2`
    );

    if (userRes.rows.length === 0) {
      console.error("User ID 2 not found");
      return;
    }

    /* 4. Fetch First Evaluation Model */
    const modelRes = await query(`
      SELECT model_id, model_name
      FROM "EvaluationModel"
      ORDER BY model_id ASC
      LIMIT 1
    `);

    if (modelRes.rows.length === 0) {
      console.error("No EvaluationModel found");
      return;
    }

    const model = modelRes.rows[0];
    console.log("Evaluation Model:", model.model_name);

    /* 5. Generate Human-Like Interview Questions */
    const questionPrompt = `
You are a senior technical interviewer having a real conversation.

Candidate:
- First name: ${firstName}
- Education: ${education}
- Experience: ${experience}
- Skills: ${skills}

Generate EXACTLY 6 interview questions:
- 2 easy
- 2 medium
- 2 hard

Rules:
- Every question MUST directly address the candidate by first name
- Sound natural and conversational
- Ask as a real human interviewer would
- Use resume context naturally
- No explanations

Return ONLY valid JSON:

{
  "easy": ["..."],
  "medium": ["..."],
  "hard": ["..."]
}
`;

    const questionRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: "You generate realistic interview questions." },
        { role: "user", content: questionPrompt },
      ],
    });

    const questions = JSON.parse(
      questionRes.choices[0].message.content.trim()
    );

    console.log("\nGenerated Questions:");
    console.log(JSON.stringify(questions, null, 2));

    /* 6. Store Questions in DB */
    console.log("\nSaving questions to DB...\n");

    for (const [difficulty, list] of Object.entries(questions)) {
      for (const q of list) {
        const baseRes = await query(
          `
          INSERT INTO "BaseQuestion"
            (is_predefined, difficulty_level, created_by)
          VALUES
            (false, $1, 2)
          RETURNING question_id
          `,
          [difficulty]
        );

        const baseQuestionId = baseRes.rows[0].question_id;

        await query(
          `
          INSERT INTO "DynamicQuestion"
            (base_question_id, model_id, generated_question_content, resume_id)
          VALUES
            ($1, $2, $3, NULL)
          `,
          [baseQuestionId, model.model_id, q]
        );

        console.log(
          `[${difficulty.toUpperCase()}] Saved to QID ${baseQuestionId}`
        );
      }
    }

    console.log("\nDONE: Resume-aware questions generated & stored.");
  } catch (err) {
    console.error("ERROR:", err);
  }
})();
