// backend/routes/pastSessions.js

const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const checkLogin = require("../middleware/checkLogin");

// helpers
const scoreToStars = (score = 0) => {
  if (score < 20) return 1;
  if (score < 40) return 2;
  if (score < 60) return 3;
  if (score < 80) return 4;
  return 5;
};

const scoreLabel = (score = 0) => {
  if (score < 20) return "Very Bad";
  if (score < 40) return "Bad";
  if (score < 60) return "Average";
  if (score < 80) return "Good";
  return "Excellent";
};

const durationMMSS = (start, end) => {
  if (!start) return "00:00";
  const diff = Math.max(
    0,
    Math.floor((new Date(end ?? Date.now()) - new Date(start)) / 1000)
  );
  const mm = String(Math.floor(diff / 60)).padStart(2, "0");
  const ss = String(diff % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

// GET /api/past-sessions
router.get("/", authenticateToken, checkLogin, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Logged-in userId:", userId);

    // KPI SUMMARY
    const summaryResult = await query(
      `
      SELECT
        COUNT(*)::int AS total_sessions,
        COALESCE(AVG(total_score),0)::float AS average_score,
        COUNT(*) FILTER (WHERE total_score >= 80)::int AS excellent_scores,
        COUNT(DISTINCT focus_area)::int AS different_roles
      FROM "Session"
      WHERE user_id = $1
      `,
      [userId]
    );

    // SESSIONS LIST
    const sessionsResult = await query(
      `
      SELECT *
      FROM "Session"
      WHERE user_id = $1
      ORDER BY start_time DESC
      `,
      [userId]
    );

    const sessions = sessionsResult.rows.map((s) => ({
      session_id: s.session_id,
      start_time: s.start_time,
      selected_difficulty: s.selected_difficulty,
      interview_mode:
        s.interview_mode?.toLowerCase() === "voice" ? "Voice" : "Text",
      question_source:
        s.question_source === "predefined" ? "General" : "Personalized",
      total_score: s.total_score,
      stars: scoreToStars(s.total_score),
      score_label: scoreLabel(s.total_score),
      duration: durationMMSS(s.start_time, s.end_time),
      prep_time_minutes: s.prep_time_minutes,
      focus_area: s.focus_area,
      keywords: s.keywords || [],
    }));

    res.json({
      summary: {
        totalSessions: summaryResult.rows[0].total_sessions,
        averageScore: summaryResult.rows[0].average_score,
        excellentScores: summaryResult.rows[0].excellent_scores,
        differentRoles: summaryResult.rows[0].different_roles,
      },
      sessions,
    });
  } catch (err) {
    console.error("Past sessions error:", err);
    res.status(500).json({ message: "Failed to fetch past sessions" });
  }
});

module.exports = router;
