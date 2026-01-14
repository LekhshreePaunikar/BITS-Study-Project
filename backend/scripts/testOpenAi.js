// backend/scripts/testOpenAI.js

require("dotenv").config({ path: "./.env.local" });
const { OpenAI } = require("openai");
const { query } = require("../config/database");

(async () => {
  try {
    console.log("API Key Loaded:", process.env.OPENAI_API_KEY ? "Yes" : "No");

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const userResult = await query(
      `SELECT name, education, experience, preferred_roles, skills, programming_languages
       FROM "User"
       WHERE user_id = 2`
    );

    if (userResult.rows.length === 0) {
      console.error("No user found with ID = 2");
      process.exit(1);
    }

    const user = userResult.rows[0];

    const preferredRoles = Array.isArray(user.preferred_roles)
      ? user.preferred_roles.join(", ")
      : user.preferred_roles || "None";

    const skills = Array.isArray(user.skills)
      ? user.skills.join(", ")
      : user.skills || "None";

    const languages = Array.isArray(user.programming_languages)
      ? user.programming_languages.join(", ")
      : user.programming_languages || "None";

    const prompt = `
You are an expert technical interviewer.

Candidate:
- Name: ${user.name}
- Experience: ${user.experience}
- Skills: ${skills}

Generate 3 medium-level interview questions.
Return JSON only:
{
  "questions": ["q1", "q2", "q3"]
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", 
          content: "Return ONLY valid JSON. Do not use markdown, backticks, or explanations." },
        { role: "user", 
          content: prompt },
      ],
      temperature: 0.7,
    });

    console.log("\nOpenAI Response:");
    console.log(completion.choices[0].message.content);
    process.exit(0);

  } catch (err) {
    console.error("OpenAI Test Failed:", err);
    process.exit(1);
  }
})();
