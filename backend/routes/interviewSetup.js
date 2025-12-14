require("dotenv").config({ path: "./.env.local" });
const { OpenAI } = require("openai");
const { query } = require("./backend/config/database");

// This script tests the OpenAI API and generates interview questions
// for the user whose ID is 2. Questions are personalized based on 
// the user's profile in the database and grouped by difficulty.

<<<<<<< HEAD
// //**
// * POST /api/interview/start
// * Creates a row in public."Session" using frontend config values
// * Returns session_id
// */
router.post('/start', async (req, res) => {
 try {
   // ✅ Coming from authenticateToken middleware already applied in server.js
   const userId =  req.user.id;


   console.log('Start Session → userId =', userId);
   console.log('Incoming JSON body:', req.body);

   if (!userId) {
     return res.status(401).json({ success: false, error: 'Missing userId in token' });
   }

   const {
     interview_mode,
     question_source,
     selected_difficulty,
     focus_area,
     prep_time_minutes,
     keywords
   } = req.body;

   // Minimal field checks (as you requested basic error handling)
   if (!interview_mode || typeof interview_mode !== 'string') {
     return res.status(400).json({ success: false, error: 'interview_mode is required' });
   }

   const result = await query(
     `
     INSERT INTO "Session" (
       user_id,
       interview_mode,
       question_source,
       selected_difficulty,
       focus_area,
       prep_time_minutes,
       keywords
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING session_id;
     `,
     [
       userId,
       interview_mode,
       question_source || null,
       selected_difficulty || null,
       focus_area || null,
       Number.isFinite(Number(prep_time_minutes)) ? Number(prep_time_minutes) : null,
       Array.isArray(keywords) ? keywords : null
     ]
   );

   return res.status(201).json({
     success: true,
     session_id: result.rows[0].session_id,
     message: 'Session created successfully'
   });

 } catch (err) {
   console.error('❌ Start Session Error:', err);
   return res.status(500).json({ success: false, error: err.message });
 }
});

module.exports = router;
=======
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
      model: "gpt-4o-mini",
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
    console.error("API Error:", err.message);
  }
})();
>>>>>>> 725b16e (Updated the InterviewSetup script)
