// root/backend/routes/interviewSetup.js

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const checkLogin = require('../middleware/checkLogin');

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