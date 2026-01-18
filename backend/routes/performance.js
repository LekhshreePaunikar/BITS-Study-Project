const express = require("express");
const router = express.Router();
const { query } = require("../config/database");

// IMPORTANT: auth middleware must be applied
const { authenticateToken } = require("../middleware/auth");

router.get("/summary", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;

        /* =========================
           SUMMARY CARDS
        ========================== */
        const summaryRes = await query(
            `
      SELECT
        COUNT(*) AS total_sessions,
        COALESCE(ROUND(AVG(total_score)::numeric, 1), 0) AS avg_score,
        COALESCE(MAX(total_score), 0) AS best_score,
        COALESCE(MIN(total_score), 0) AS lowest_score
      FROM "Session"
      WHERE user_id = $1
        AND total_score IS NOT NULL
      `,
            [userId]
        );

        /* =========================
           SCORE OVER TIME (LINE)
        ========================== */
        const scoreOverTimeRes = await query(
            `
      SELECT
        TO_CHAR(start_time, 'Mon DD') AS date,
        ROUND(total_score::numeric, 1) AS score
      FROM "Session"
      WHERE user_id = $1
        AND total_score IS NOT NULL
      ORDER BY start_time ASC
      LIMIT 12
      `,
            [userId]
        );

        /* =========================
           DIFFICULTY DISTRIBUTION
        ========================== */
        const difficultyRes = await query(
            `
      SELECT selected_difficulty, COUNT(*)::int AS count
      FROM "Session"
      WHERE user_id = $1
      GROUP BY selected_difficulty
      `,
            [userId]
        );

        const difficulty = { easy: 0, medium: 0, hard: 0 };
        difficultyRes.rows.forEach(r => {
            if (r.selected_difficulty) {
                difficulty[r.selected_difficulty] = r.count;
            }
        });

        /* =========================
           MODE DISTRIBUTION (PIE)
        ========================== */
        const modeRes = await query(
            `
      SELECT interview_mode, COUNT(*)::int AS count
      FROM "Session"
      WHERE user_id = $1
      GROUP BY interview_mode
      `,
            [userId]
        );

        const mode = { text: 0, voice: 0 };
        modeRes.rows.forEach(r => {
            if (r.interview_mode) {
                mode[r.interview_mode] = r.count;
            }
        });

        /* =========================
           SKILL PERFORMANCE (BAR)
        ========================== */
        const skillsRes = await query(
            `
      SELECT
        ROUND(AVG(score_clarity)::numeric,1) AS communication,
        ROUND(AVG(score_content)::numeric,1) AS technical,
        ROUND(AVG(score_overall)::numeric,1) AS overall
      FROM "Answer" a
      JOIN "Session" s ON s.session_id = a.session_id
      WHERE s.user_id = $1
      `,
            [userId]
        );
        const skills = skillsRes.rows[0] || {
            communication: 0,
            technical: 0,
            overall: 0,
        };

        /* =========================
           STRENGTHS & WEAKNESSES (FROM PerformanceReport)
        ========================= */
        const swRes = await query(
            `
  SELECT
  ARRAY_AGG(DISTINCT s) FILTER (WHERE s IS NOT NULL) AS strengths,
  ARRAY_AGG(DISTINCT w) FILTER (WHERE w IS NOT NULL) AS weaknesses
FROM "PerformanceReport" pr
JOIN "Session" sess
  ON sess.session_id = pr.session_id
LEFT JOIN LATERAL unnest(pr.strengths) AS s ON TRUE
LEFT JOIN LATERAL unnest(pr.weaknesses) AS w ON TRUE
WHERE sess.user_id = $1;

  `,
            [userId]
        );



        res.json({
            summary: summaryRes.rows[0],
            scoreOverTime: scoreOverTimeRes.rows,
            difficulty,
            mode,
            strengths: swRes.rows[0]?.strengths || [],
            weaknesses: swRes.rows[0]?.weaknesses || [],
            skills: skillsRes.rows[0] || {
                communication: 0,
                technical: 0,
                overall: 0
            }
        });



    } catch (err) {
        console.error("Performance summary error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
