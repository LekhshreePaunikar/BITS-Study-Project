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

    /* 1. Read & Parse Resume PDF */
    const resumePath = path.join(
      __dirname,
      "sample_resume",
      "sample_resume.pdf"
    );

    if (!fs.existsSync(resumePath)) {
      console.error("Resume PDF not found:", resumePath);
      return;
    }

    const resumeBuffer = fs.readFileSync(resumePath);
    const parsedPdf = await pdfParse(resumeBuffer);
    const resumeText = parsedPdf.text.replace(/\s+/g, " ").trim();

    console.log("Resume parsed successfully");

    /* 2. Extract Resume Signals */
    const extractionPrompt = `
      Extract structured data from the resume below.
      
      Return ONLY valid JSON:
      {
        "first_name": "",
        "education": "",
        "experience": "",
        "skills": []
      }
      
      Resume:
      """
      ${resumeText}
      """
      `;

    const extractionRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: "You extract resume data." },
        { role: "user", content: extractionPrompt },
      ],
    });

    const extracted = JSON.parse(
      extractionRes.choices[0].message.content.trim()
    );

    const firstName = extracted.first_name || "Candidate";
    const education = extracted.education || "N/A";
    const experience = extracted.experience || "N/A";
    const skills = Array.isArray(extracted.skills)
      ? extracted.skills.join(", ")
      : "";

    console.log("Candidate:", firstName);

    /* 3. Validate User */
    const userRes = await query(
      `SELECT user_id FROM "User" WHERE user_id = 2`
    );

    if (userRes.rows.length === 0) {
      console.error("User ID 2 not found");
      return;
    }

    /* 4. Get Evaluation Model */
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

    /* 5. Generate Interview Questions */
    const questionPrompt = `
      Generate EXACTLY 6 interview questions for ${firstName}.

      Rules:
      - 2 easy, 2 medium, 2 hard
      - Conversational
      - Resume-aware
      - Address candidate by name
      - Return ONLY JSON

      {
        "easy": [],
        "medium": [],
        "hard": []
      }
      `;

    const questionRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: "You generate interview questions." },
        { role: "user", content: questionPrompt },
      ],
    });

    const questions = JSON.parse(
      questionRes.choices[0].message.content.trim()
    );

    console.log("Generated Questions:", questions);

    /* 6. Save to DB */
    for (const [difficulty, list] of Object.entries(questions)) {
      for (const q of list) {
        const baseRes = await query(
          `
          INSERT INTO "BaseQuestion"
            (is_predefined, difficulty, created_by)
          VALUES
            (false, $1, 2)
          RETURNING question_id
          `,
          [difficulty]
        );

        await query(
          `
          INSERT INTO "DynamicQuestion"
            (base_question_id, model_id, generated_question_content, resume_id)
          VALUES
            ($1, $2, $3, NULL)
          `,
          [baseRes.rows[0].question_id, model.model_id, q]
        );
      }
    }

    console.log("Test run completed successfully");
  } catch (err) {
    console.error("Test script error:", err);
  }
})();