// backend/routes/interviewSetup.js

require("dotenv").config({ path: "./.env.local" });
const { OpenAI } = require("openai");

const express = require('express');
const router = express.Router();
const { query } = require("../config/database");


// This script tests the OpenAI API and generates interview questions
// for the user whose ID is 2. Questions are personalized based on 
// the user's profile in the database and grouped by difficulty.


// const { query } = require('../config/database');
// const { authenticateToken } = require('../middleware/auth');
// const checkLogin = require('../middleware/checkLogin');

// //**
// * POST /api/interview/start
// * Creates a row in public."Session" using frontend config values
// * Returns session_id
// */
router.post('/start', async (req, res) => {
 try {
   // ✅ Coming from authenticateToken middleware already applied in server.js
   const userId =  req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: user not found in token",
      });
    }

    const {
      interview_mode,
      question_source,
      selected_difficulty,
      focus_area,
      prep_time_minutes,
      keywords,
    } = req.body;

    if (!interview_mode) {
      return res.status(400).json({
        success: false,
        error: "interview_mode is required",
      });
    }

    const startTime = new Date().toISOString();
    const prepTime =
      Number.isFinite(Number(prep_time_minutes))
        ? Number(prep_time_minutes)
        : null;

    const keywordsArr = Array.isArray(keywords) ? keywords : null;

  //  Insert session into rows
   const result = await query(
     `
     INSERT INTO "Session" (
       user_id,
       interview_mode,
       question_source,
       selected_difficulty,
       focus_area,
       prep_time_minutes,
       keywords,
       start_time,
       end_time
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,null)
     RETURNING session_id, start_time;
     `,
     [
       userId,
       interview_mode,
       question_source || null,
       selected_difficulty || null,
       focus_area || null,
       prepTime,
       keywordsArr,
       startTime,
     ]
   );
   
   console.log("Session stored start_time:", result.rows[0].start_time);
   return res.status(201).json({
     success: true,
     session_id: result.rows[0].session_id,
     start_time: result.rows[0].start_time,
     message: 'Session created successfully'
   });

 } catch (err) {
   console.error('❌ Start Session Error:', err);
   return res.status(500).json({ success: false, error: err.message });
 }
});


(async () => {
  try {
    // Confirm that the API key is loading correctly
    console.log("API Key Loaded:", process.env.OPENAI_API_KEY ? "Yes" : "No");

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Step 1: Fetch user profile from the database
    const userResult = await query(
      `SELECT name, education, experience, preferred_roles, skills, programming_languages
       FROM "User" WHERE user_id = 2`
    );

    if (userResult.rows.length === 0) {
      console.error("No user found with ID = 2");
      return;
    }

    const user = userResult.rows[0];

    // Convert stored values into readable strings
    const preferredRoles = Array.isArray(user.preferred_roles)
      ? user.preferred_roles.join(", ")
      : user.preferred_roles || "None";

    const skills = Array.isArray(user.skills)
      ? user.skills.join(", ")
      : user.skills || "None";

    const languages = Array.isArray(user.programming_languages)
      ? user.programming_languages.join(", ")
      : user.programming_languages || "None";

    // Step 2: Build the prompt to send to OpenAI
    const customPrompt = `
You are an expert technical interviewer. Generate exactly 6 interview questions tailored to the candidate below.

Candidate Profile:
- Name: ${user.name}
- Education: ${user.education || "Not provided"}
- Experience: ${user.experience || "Not provided"}
- Preferred Roles: ${preferredRoles}
- Skills: ${skills}
- Programming Languages: ${languages}

Generate exactly:
- 2 easy questions
- 2 medium difficulty questions
- 2 hard difficulty questions

The questions must be specific to the candidate's skills and background.

Output must be valid JSON only, in this exact structure:

{
  "easy": ["question1", "question2"],
  "medium": ["question1", "question2"],
  "hard": ["question1", "question2"]
}

Do not include explanations, notes, comments, markdown, or any text outside the JSON response.
`;

    // Step 3: Call the OpenAI API
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "Your responses must be in clean, valid JSON only." },
        { role: "user", content: customPrompt }
      ],
      temperature: 0.7
    });

    const rawResponse = completion.choices[0].message.content.trim();

    console.log("\nRaw OpenAI Response:\n", rawResponse);

    // Step 4: Attempt to parse the JSON returned by the model
    let parsed;
    try {
      parsed = JSON.parse(rawResponse);
    } catch (error) {
      console.error("The model returned text that is not valid JSON.");
      return;
    }

    // Step 5: Print the final structured questions
    console.log("\nGenerated Questions:");
    console.log(JSON.stringify(parsed, null, 2));

  } catch (err) {
    console.error("❌ Start Session Error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
})();


/**
 * POST /api/interview/end
 * Ends an interview session
 */
router.post("/end", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { session_id } = req.body;

    if (!userId || !session_id) {
      return res.status(400).json({
        success: false,
        error: "userId and session_id are required",
      });
    }

    const endTime = new Date().toISOString();

    const result = await query(
      `
      UPDATE "Session"
      SET end_time = $1
      WHERE session_id = $2 AND user_id = $3
      RETURNING session_id, start_time, end_time;
      `,
      [endTime, session_id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Session not found or not owned by user",
      });
    }

    return res.json({
      success: true,
      session_id: result.rows[0].session_id,
      start_time: result.rows[0].start_time,
      end_time: result.rows[0].end_time,
      message: "Session ended successfully",
    });
  } catch (err) {
    console.error("❌ End Session Error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});


module.exports = router;
