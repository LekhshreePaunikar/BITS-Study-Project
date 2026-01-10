// backend/routes/adminKpis.js
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

router.get("/kpis/weekly", authenticateToken, async (req, res) => {
  try {
    // Questions added in last 7 days: base as 10 questions
    const questionsResult = await query(`
      SELECT COUNT(*) 
      FROM "BaseQuestion"
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);

    // Support tickets created in last 7 days: base as 10 tickets
    const ticketsResult = await query(`
      SELECT COUNT(*) 
      FROM "SupportTicket"
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);

    // Users created in last 7 days: base as 10 new users
    const usersResult = await query(`
      SELECT COUNT(*) 
      FROM "User"
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);

    // Average session duration (minutes) in last 7 days: base as 10 minutes
    const avgSessionResult = await query(`
      SELECT 
        COALESCE(
          AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60),
          0
        ) AS avg_minutes
      FROM "Session"
      WHERE 
        start_time >= NOW() - INTERVAL '7 days'
        AND end_time IS NOT NULL
    `);

    res.json({
      questions_last_week: Number(questionsResult.rows[0].count),
      tickets_last_week: Number(ticketsResult.rows[0].count),
      users_last_week: Number(usersResult.rows[0].count),
      avg_session_minutes: Number(avgSessionResult.rows[0].avg_minutes),
    });

  } catch (err) {
    console.error("Admin KPI fetch failed:", err);
    res.status(500).json({ error: "Failed to load admin KPIs" });
  }
});

module.exports = router;
