// root/backend/routes/interviewSetup.js

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const checkLogin = require('../middleware/checkLogin');

/* ============================================================
   1. CREATE INTERVIEW CONFIG  (Frontend → POST /interview/config)
   ============================================================ */
   router.post('/config', authenticateToken, checkLogin, async (req, res) => {
    try {
      const userId = req.user.user_id;  // Correct DB user ID
      console.log("Create Config → userId =", userId);
  
      const {
        mode,
        questionSource,
        level,
        focusArea,
        specificTopics,
        preparationTime,
        startTime
      } = req.body;
  
      // Save config to DB (create table if needed)
      const result = await query(
        `INSERT INTO interview_config (
          user_id, mode, question_source, level,
          focus_area, specific_topics, preparation_time, start_time
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING id`,
        [
          userId,
          mode,
          questionSource,
          level,
          focusArea,
          specificTopics,
          preparationTime,
          startTime
        ]
      );
  
      return res.status(201).json({
        message: "Config saved successfully",
        id: result.rows[0].id
      });
  
    } catch (err) {
      console.error("❌ Config Error:", err);
      res.status(500).json({ error: err.message });
    }
  });
  
  
  /* ============================================================
     2. START INTERVIEW SESSION (Frontend → POST /interview/start)
     ============================================================ */
  router.post('/start', authenticateToken, checkLogin, async (req, res) => {
    try {
      const userId = req.user.user_id;
      const { configId } = req.body;
  
      console.log("Start Session → userId =", userId, "configId =", configId);
  
      const result = await query(
        `INSERT INTO interview_sessions (user_id, config_id, start_time)
         VALUES ($1, $2, NOW())
         RETURNING session_id`,
        [userId, configId]
      );
  
      return res.status(201).json({
        message: "Interview session started",
        sessionId: result.rows[0].session_id
      });
  
    } catch (err) {
      console.error("❌ Start Interview Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

// -----------------------------------------------------------
// POST: Create / Save Interview Setup (Session-based values)
// -----------------------------------------------------------
router.post('/setup-session', authenticateToken, checkLogin, async (req, res) => {
  try {
    // Pull user details directly from verified JWT session
    const userId = req.user.userid;    // DB user ID (from auth middleware)
    const username = req.user.name;    // user's display name

    // Extract incoming optional fields
    const {
      mode,
      questionSource,
      interviewLevel,
      focusArea,
      specificTopics,
      preparationTime
    } = req.body;

    // Apply defaults and explicitly set "null" where missing
    const finalConfig = {
      userId: userId,
      username: username || 'Unknown User',
      mode: mode || 'text',
      questionSource: questionSource || 'predefined',
      interviewLevel: interviewLevel || 'intermediate',
      focusArea: focusArea || 'null',
      specificTopics: specificTopics || 'null',
      preparationTime: preparationTime !== undefined ? preparationTime : 2,
      createdAt: new Date().toISOString()
    };

    // Optional: Save to DB if table exists
    // await query(`
    //   INSERT INTO interview_setup 
    //     (user_id, mode, question_source, interview_level, focus_area, specific_topics, preparation_time, created_at)
    //   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    // `, [
    //   userId,
    //   finalConfig.mode,
    //   finalConfig.questionSource,
    //   finalConfig.interviewLevel,
    //   finalConfig.focusArea,
    //   finalConfig.specificTopics,
    //   finalConfig.preparationTime,
    //   finalConfig.createdAt
    // ]);

    // Send the session-based response
    return res.status(201).json({
      message: 'Interview setup saved successfully',
      data: finalConfig
    });
  } catch (error) {
    console.error('Interview setup error:', error);
    return res.status(500).json({
      message: 'Failed to save interview setup',
      error: error.message
    });
  }
});

module.exports = router;


