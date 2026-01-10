const express = require("express");
const router = express.Router();
const { query } = require("../config/database");

/**
 * GET /api/user/kpis
 * Requires authenticateToken middleware
 */
router.get("/kpis", async (req, res) => {
    try {
        const userId = req.user.id;

        /**
         * -------------------------
         * BASIC SESSION METRICS
         * -------------------------
         */
        const totalSessionsRes = await query(
            `
      SELECT COUNT(*)::int AS count
      FROM "Session"
      WHERE user_id = $1
      `,
            [userId]
        );

        const completedSessionsRes = await query(
            `
      SELECT COUNT(*)::int AS count
      FROM "Session"
      WHERE user_id = $1
        AND end_time IS NOT NULL
      `,
            [userId]
        );

        const avgScoreRes = await query(
            `
      SELECT COALESCE(AVG(total_score), 0)::float AS avg
      FROM "Session"
      WHERE user_id = $1
        AND total_score IS NOT NULL
      `,
            [userId]
        );

        const bestScoreRes = await query(
            `
      SELECT COALESCE(MAX(total_score), 0)::float AS best
      FROM "Session"
      WHERE user_id = $1
      `,
            [userId]
        );

        const lastSessionScoreRes = await query(
            `
      SELECT total_score
      FROM "Session"
      WHERE user_id = $1
        AND total_score IS NOT NULL
        AND end_time IS NOT NULL
      ORDER BY end_time DESC
      LIMIT 1
      `,
            [userId]
        );

        const hoursRes = await query(
            `
      SELECT COALESCE(
        SUM(EXTRACT(EPOCH FROM (end_time - start_time))) / 3600,
        0
      )::float AS hours
      FROM "Session"
      WHERE user_id = $1
        AND end_time IS NOT NULL
      `,
            [userId]
        );

        /**
         * -------------------------
         * QUESTIONS & ANSWERS
         * -------------------------
         */

        // Total static questions (global pool)
        const totalQuestionsRes = await query(
            `
      SELECT COUNT(*)::int AS total
      FROM "StaticQuestion"
      `
        );

        // Total answers given by user (via Session join)
        const totalAnswersRes = await query(
            `
      SELECT COUNT(*)::int AS total
      FROM "Answer" a
      JOIN "Session" s ON s.session_id = a.session_id
      WHERE s.user_id = $1
      `,
            [userId]
        );

        /**
         * -------------------------
         * PRACTICE STREAK
         * (distinct days with completed sessions)
         * -------------------------
         */
        const streakRes = await query(
            `
      SELECT COUNT(DISTINCT DATE(end_time))::int AS days
      FROM "Session"
      WHERE user_id = $1
        AND end_time IS NOT NULL
      `,
            [userId]
        );

        /**
         * -------------------------
         * COMPLETION RATE
         * -------------------------
         */
        const totalSessions = totalSessionsRes.rows[0].count;
        const completedSessions = completedSessionsRes.rows[0].count;

        const completionRate =
            totalSessions > 0
                ? Math.round((completedSessions / totalSessions) * 100)
                : 0;

        /**
         * -------------------------
         * IMPROVEMENT RATE
         * (% difference between average & last session)
         * -------------------------
         */
        const avgScore = avgScoreRes.rows[0].avg;
        const lastSessionScore = lastSessionScoreRes.rows[0]?.total_score ?? 0;

        let improvementRate = avgScore;

        if (completedSessions > 1 && avgScore > 0) {
            improvementRate = ((lastSessionScore - avgScore) / avgScore) * 100;
        }

        // -------------------------
        // DELTAS (simple, meaningful)
        // -------------------------

        const deltaSessions =
            completedSessions > 0 ? 1 : 0; // last session counts as +1

        const deltaScore =
            completedSessions > 1
                ? Number((lastSessionScore - avgScore).toFixed(1))
                : 0;

        const deltaHours =
            completedSessions > 0
                ? Number((hoursRes.rows[0].hours / completedSessions).toFixed(1))
                : 0;

        /**
         * -------------------------
         * RESPONSE (frontend-safe)
         * -------------------------
         */
        res.json({
            // top KPIs
            total_sessions: totalSessions,
            average_score: Number(avgScore.toFixed(1)),
            hours_completed: Number(hoursRes.rows[0].hours.toFixed(1)),
            improvement_rate: Number(improvementRate.toFixed(1)),

            // deltas (kept for frontend compatibility)
            delta_sessions: deltaSessions,
            delta_score: deltaScore,
            delta_hours: deltaHours,

            // performance highlights
            last_session_score: Number(lastSessionScore.toFixed(1)),
            best_score: Number(bestScoreRes.rows[0].best.toFixed(1)),
            total_questions: totalQuestionsRes.rows[0].total,
            total_answers: totalAnswersRes.rows[0].total,
            completion_rate: completionRate,
            streak_days: streakRes.rows[0].days,
        });

    } catch (err) {
        console.error("User KPI fetch failed:", err);
        res.status(500).json({ error: "Failed to load user KPIs" });
    }
});

module.exports = router;
