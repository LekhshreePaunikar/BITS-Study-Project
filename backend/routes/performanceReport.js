const express = require("express");
const router = express.Router();
const { query } = require("../config/database");

// 20 reusable interview tips (with emojis)

const GENERAL_TIPS = [
  "✔ Structure your answers using the STAR method (Situation, Task, Action, Result) to keep responses clear and impactful.",
  "✔ Clarify the question before answering to ensure you address exactly what the interviewer is asking.",
  "✔ Manage your time per question so that you cover the key points without rushing or over-explaining.",
  "✔ Clearly explain your thought process rather than jumping straight to the final answer.",
  "✔ Speak clearly, confidently, and at a steady pace to make your answers easy to follow.",
  "✔ Support your answers with real-world examples from projects, internships, or prior experience.",
  "✔ Break complex problems into smaller, logical steps before attempting a solution.",
  "✔ Be honest if you don’t know something and explain how you would approach learning or solving it.",
  "✔ Mention relevant tools, frameworks, or technologies when appropriate to demonstrate practical experience.",
  "✔ Stay focused on the question and avoid drifting into unrelated details.",
  "✔ Consider edge cases and limitations when discussing solutions or approaches.",
  "✔ Discuss trade-offs between different approaches to show depth of understanding.",
  "✔ Summarize your answer briefly at the end to reinforce your main points.",
  "✔ Listen carefully without interrupting and take a moment to think before responding.",
  "✔ Practice explaining code, algorithms, or system designs out loud to improve clarity.",
  "✔ Avoid unnecessary rambling and keep your answers concise and structured.",
  "✔ Quantify impact where possible (for example, performance improvements or reduced errors).",
  "✔ Maintain confidence and enthusiasm, even when discussing challenges or mistakes.",
  "✔ Regularly practice mock interviews to build confidence and improve communication.",
  "✔ Revise core fundamentals and concepts before interviews to strengthen your foundation.",
];


const pickRandomTips = (count = 5) => {
  return [...GENERAL_TIPS]
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
};

router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const sessionCheck = await query(
      `
      SELECT session_id
      FROM "Session"
      WHERE session_id = $1 AND user_id = $2
      `,
      [sessionId, userId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ message: "Session not found" });
    }

    const reportResult = await query(
      `
      SELECT strengths, weaknesses
      FROM "PerformanceReport"
      WHERE session_id = $1
      `,
      [sessionId]
    );

    if (reportResult.rows.length === 0) {
      return res.json({
        reportAvailable: false,
        strengths: [],
        weaknesses: [],
        tips: pickRandomTips(),
      });
    }

    const { strengths, weaknesses } = reportResult.rows[0];

    res.json({
      reportAvailable: true,
      strengths: Array.isArray(strengths) ? strengths : [],
      weaknesses: Array.isArray(weaknesses) ? weaknesses : [],
      tips: pickRandomTips(),
    });
  } catch (err) {
    console.error("Performance report fetch error:", err);
    res.status(500).json({ message: "Failed to fetch performance report" });
  }
});

module.exports = router;
