// backend/routes/interviewSetup.js

require("dotenv").config({ path: "./.env.local" });

const express = require("express");
const router = express.Router();
const { query } = require("../config/database");

/**
 * POST /api/interview/start
 * Creates a new interview session
 */
router.post("/start", async (req, res) => {
  try {
    // user injected by auth middleware
    const userId = req.user?.id;

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
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NULL)
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

    return res.status(201).json({
      success: true,
      session_id: result.rows[0].session_id,
      start_time: result.rows[0].start_time,
      message: "Session created successfully",
    });
  } catch (err) {
    console.error("❌ Start Session Error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

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
