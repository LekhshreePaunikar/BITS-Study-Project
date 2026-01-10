const express = require("express");
const router = express.Router();
const { query } = require("../config/database");

router.get("/kpis", async (req, res) => {
    console.log("REQ.USER in /kpis:", req.user);
    try {
        const userId = req.user.id;

        const totalSessionsRes = await query(
            `SELECT COUNT(*)::int AS count
       FROM "Session"
       WHERE user_id = $1`,
            [userId]
        );

        const avgScoreRes = await query(
            `SELECT COALESCE(AVG(total_score), 0)::float AS avg
       FROM "Session"
       WHERE user_id = $1`,
            [userId]
        );

        const hoursRes = await query(
            `SELECT COALESCE(
         SUM(EXTRACT(EPOCH FROM (end_time - start_time))) / 3600,
         0
       )::float AS hours
       FROM "Session"
       WHERE user_id = $1
         AND end_time IS NOT NULL`,
            [userId]
        );

        console.log("USER KPI RAW DATA", {
            userId,
            sessions: totalSessionsRes.rows,
            avg: avgScoreRes.rows,
            hours: hoursRes.rows,
        });

        res.json({
            total_sessions: parseInt(totalSessionsRes.rows[0].count, 10),
            average_score: Number(avgScoreRes.rows[0].avg || 0),
            hours_completed: Number(parseFloat(hoursRes.rows[0].hours || 0).toFixed(1)),
            improvement_rate: Number(parseFloat(avgScoreRes.rows[0].avg || 0).toFixed(1)),
        });

    } catch (err) {
        console.error("User KPI fetch failed:", err);
        res.status(500).json({ error: "Failed to load user KPIs" });
    }
});

module.exports = router;
