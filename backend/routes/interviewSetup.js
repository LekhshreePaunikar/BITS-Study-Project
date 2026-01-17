// backend/routes/interviewSetup.js

require("dotenv").config({ path: "./.env.local" });
const PDFDocument = require("pdfkit");


const express = require('express');
const router = express.Router();
const { query } = require("../config/database");

const { evaluateAnswerWithOpenAI, isAIAvailable } = require("../services/aiService");




// This script tests the OpenAI API and generates interview questions
// for the user whose ID is 2. Questions are personalized based on 
// the user's profile in the database and grouped by difficulty.


// const { query } = require('../config/database');
// const { authenticateToken } = require('../middleware/auth');
// const checkLogin = require('../middleware/checkLogin');

// //**
// * POST /api/interview/start
// * Creates a row in public."Session" using frontend config values
// * Returns session_id
// */
router.post('/start', async (req, res) => {
  try {
    // Coming from authenticateToken middleware already applied in server.js
    const userId = req.user.id || req.user.userId;

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

    //  Insert session into rows
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
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,null)
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

    console.log("Session stored start_time:", result.rows[0].start_time);
    return res.status(201).json({
      success: true,
      session_id: result.rows[0].session_id,
      start_time: result.rows[0].start_time,
      message: 'Session created successfully'
    });

  } catch (err) {
    console.error('Start Session Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});



router.post("/:sessionId/answer", async (req, res) => {
  try {
    const sessionId = Number(req.params.sessionId);
    const userId = req.user?.id;
    const { questionId, userAnswer } = req.body;

    if (!userId || !sessionId || !questionId || !userAnswer) {
      return res.status(400).json({ error: "Invalid request" });
    }

    // 1️⃣ Insert Answer
    const insertResult = await query(
      `
      INSERT INTO "Answer" (
        session_id,
        question_id,
        mode_chosen,
        answer_text,
        start_time,
        end_time
      )
      VALUES ($1, $2, 'text', $3, NOW(), NOW())
      RETURNING answer_id
      `,
      [sessionId, questionId, userAnswer]
    );

    const answerId = insertResult.rows[0].answer_id;

    // 2️⃣ Fetch REAL question text
    const qRes = await query(
      `
      SELECT COALESCE(
        sq.question_content,
        dq.generated_question_content
      ) AS question_text
      FROM "BaseQuestion" b
      LEFT JOIN "StaticQuestion" sq ON sq.base_question_id = b.question_id
      LEFT JOIN "DynamicQuestion" dq ON dq.base_question_id = b.question_id
      WHERE b.question_id = $1
      `,
      [questionId]
    );

    const questionText =
      qRes.rows?.[0]?.question_text || "Question not found";

    // Evaluate with OpenAI ONLY
    if (!isAIAvailable()) {
      console.error("OpenAI key missing/config invalid. Skipping scoring.");
      return res.status(201).json({
        success: true,
        answer_id: answerId,
        ai_used: false,
        message: "Answer saved. OpenAI not available for scoring."
      });
    }

    let evaluation;
    try {
      evaluation = await evaluateAnswerWithOpenAI({
        questionText,
        answerText: userAnswer,
      });
    } catch (e) {
      console.error("OpenAI evaluation failed:", e.message);
      return res.status(201).json({
        success: true,
        answer_id: answerId,
        ai_used: false,
        message: "Answer saved. OpenAI evaluation failed (quota/billing)."
      });
    }


    // 4️⃣ Update Answer scores
    await query(
      `
      UPDATE "Answer"
      SET
        score_content = $1,
        score_clarity = $2,
        score_grammar = $3,
        score_fluency = $4,
        score_overall = $5
      WHERE answer_id = $6
      `,
      [
        evaluation.score_content,
        evaluation.score_clarity,
        evaluation.score_grammar,
        evaluation.score_fluency,
        evaluation.score_overall,
        answerId,
      ]
    );

    // 5️⃣ Insert Feedback
    await query(
      `
      INSERT INTO "Feedback"
        (answer_id, evaluation_model_id, suggestion_text, generated_at)
      VALUES ($1, 1, $2, NOW())
      `,
      [answerId, evaluation.suggestion_text]
    );

    return res.status(201).json({
      success: true,
      answer_id: answerId,
      ai_used: true,
    });

  } catch (err) {
    console.error("Answer insert/eval error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});


router.post('/:sessionId/history', async (req, res) => {
  try {
    const sessionId = Number(req.params.sessionId);
    const userId = req.user?.id;
    const { questionId, answerId } = req.body;

    if (!userId || !sessionId || !questionId || !answerId) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    await query(
      `
      INSERT INTO "SessionHistory"
        (session_id, question_id, answer_id, timestamp)
      VALUES ($1, $2, $3, NOW())
      `,
      [sessionId, questionId, answerId]
    );

    res.status(201).json({ success: true });

  } catch (err) {
    console.error('SessionHistory error:', err);
    res.status(500).json({ error: err.message });
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

    // Build performance report
    const agg = await query(
      `
  SELECT
    AVG(a.score_overall) FILTER (WHERE a.score_overall IS NOT NULL) AS total_score,
    COUNT(a.answer_id) AS answer_count,
    EXTRACT(EPOCH FROM (s.end_time - s.start_time)) AS session_seconds
  FROM "Session" s
  LEFT JOIN "Answer" a ON a.session_id = s.session_id
  WHERE s.session_id = $1
  GROUP BY s.session_id, s.start_time, s.end_time
  `,
      [session_id]
    );

    const totalScore = Number(agg.rows[0]?.total_score) || 0;
    const answerCount = Number(agg.rows[0]?.answer_count) || 0;
    const sessionSeconds = Number(agg.rows[0]?.session_seconds) || 0;

    const avgTime = answerCount > 0 ? sessionSeconds / answerCount : 0;

    // Fetch all feedback suggestions for this session
    const feedbackRes = await query(
      `
     SELECT a.score_overall, f.suggestion_text
     FROM "Feedback" f
     JOIN "Answer" a ON a.answer_id = f.answer_id
      WHERE a.session_id = $1
    `,
      [session_id]
    );

    const strengths = [];
    const weaknesses = [];

    feedbackRes.rows.forEach(row => {
      const score = Number(row.score_overall);
      const text = row.suggestion_text;

      if (Number.isNaN(score)) return;

      if (score >= 7) {
        strengths.push(text);
      }

      else if (score <= 6) {
        weaknesses.push(text);
      }
    });

    if (!strengths.length && totalScore >= 7) {
      strengths.push("Overall performance in this session was strong.");
    }

    if (!weaknesses.length && totalScore <= 6) {
      weaknesses.push("More consistent answers would improve the session.");
    }

    // remove duplicates & limit size
    const uniqueStrengths = [...new Set(strengths)].slice(0, 5);
    const uniqueWeaknesses = [...new Set(weaknesses)].slice(0, 5);







    await query(
      `
      INSERT INTO "PerformanceReport"
       (session_id, generated_at, total_score, avg_time_per_question, strengths, weaknesses)
      VALUES ($1, NOW(), $2, $3, $4, $5)
      ON CONFLICT (session_id)
      DO UPDATE SET
        total_score = EXCLUDED.total_score,
        avg_time_per_question = EXCLUDED.avg_time_per_question,
        strengths = EXCLUDED.strengths,
        weaknesses = EXCLUDED.weaknesses,
        generated_at = NOW()
    `,
      [
        session_id,
        totalScore,
        avgTime,
        uniqueStrengths,
        uniqueWeaknesses
      ]
    );


    // Update Session table
    await query(
      `UPDATE "Session" SET total_score = $1 WHERE session_id = $2`,
      [totalScore, session_id]
    );


    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Session not found or not owned by user",
      });
    }

    return res.json({
      success: true,
      session_id,
      totalScore,
      timeTakenSeconds: sessionSeconds,
      strengths: uniqueStrengths,
      weaknesses: uniqueWeaknesses,
      message: "Session ended successfully",
    });
  } catch (err) {
    console.error(" End Session Error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/interview/session-summary/:sessionId
 * Returns interview summary for SessionCompletion page
 */
router.get("/session-summary/:sessionId", async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = Number(req.params.sessionId);

    if (!userId || !sessionId) {
      return res.status(400).json({ error: "Invalid request" });
    }

    // 1️⃣ Fetch performance report
    const reportRes = await query(
      `
      SELECT
        total_score,
        avg_time_per_question
      FROM "PerformanceReport"
      WHERE session_id = $1
      `,
      [sessionId]
    );

    if (reportRes.rows.length === 0) {
      return res.status(404).json({ error: "Performance report not found" });
    }

    // 2️⃣ Fetch feedback + scores
    const feedbackRes = await query(
      `
      SELECT a.score_overall, f.suggestion_text
      FROM "Feedback" f
      JOIN "Answer" a ON a.answer_id = f.answer_id
      WHERE a.session_id = $1
      `,
      [sessionId]
    );

    const strengths = [];
    const weaknesses = [];
    const feedback = [];

    feedbackRes.rows.forEach(row => {
      feedback.push(row.suggestion_text);

      if (row.score_overall >= 7) strengths.push(row.suggestion_text);
      if (row.score_overall <= 4) weaknesses.push(row.suggestion_text);
    });

    res.json({
      totalScore: Number(reportRes.rows[0].total_score),
      timeTakenSeconds: Math.round(
        reportRes.rows[0].avg_time_per_question *
        feedbackRes.rows.length
      ),
      strengths: [...new Set(strengths)],
      weaknesses: [...new Set(weaknesses)],
      feedback: [...new Set(feedback)],
    });

  } catch (err) {
    console.error("Session summary error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper to clean & dedupe feedback bullets
const cleanBullets = (texts, max = 5) => {
  const seen = new Set();

  return texts
    .map(t => t.toLowerCase())
    .flatMap(t =>
      t
        .replace(/to improve,.*$/i, "")
        .replace(/however,.*$/i, "")
        .replace(/grammar.*$/i, "")
        .split(/[.\n]/)
        .map(s => s.trim())
    )
    .filter(s => s.length > 20)
    .filter(s => {
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    })
    .slice(0, max)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1));
};


// routes/interview.ts//download PDF report for a session

router.get("/session/:sessionId/report-pdf", async (req, res) => {
  try {
    const sessionId = Number(req.params.sessionId);

    // 1️⃣ Get performance report
    const reportRes = await query(
      `
      SELECT total_score, avg_time_per_question
      FROM "PerformanceReport"
      WHERE session_id = $1
      `,
      [sessionId]
    );

    if (reportRes.rows.length === 0) {
      return res.status(404).json({ error: "Performance report not found" });
    }

    // 2️⃣ Get feedback
    const feedbackRes = await query(
      `
      SELECT a.score_overall, f.suggestion_text
      FROM "Feedback" f
      JOIN "Answer" a ON a.answer_id = f.answer_id
      WHERE a.session_id = $1
      `,
      [sessionId]
    );

    const strengths = [];
    const weaknesses = [];
    const feedback = [];

    feedbackRes.rows.forEach(row => {
      if (!row.suggestion_text) return;

      feedback.push(row.suggestion_text);

      if (row.score_overall >= 7) {
        strengths.push(row.suggestion_text);
      }

      if (row.score_overall <= 4) {
        weaknesses.push(row.suggestion_text);
      }
    });

    // 3️⃣ Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=session-${sessionId}-report.pdf`
    );

    doc.pipe(res);

    // ---- HEADER ----
    doc.fontSize(18).fillColor("#111827")
      .text("Interview Session Report", { align: "center" });

    doc.moveDown();

    doc.fontSize(11).fillColor("#374151");
    doc.text(`Session ID: ${sessionId}`);
    doc.text(`Total Score: ${reportRes.rows[0].total_score.toFixed(1)} / 10`);
    doc.text(`Avg Time per Question: ${Math.round(reportRes.rows[0].avg_time_per_question)} sec`);

    doc.moveDown();

    // ---- CLEAN BULLETS ----
    const strengthsClean = cleanBullets(strengths, 4);
    const weaknessesClean = cleanBullets(weaknesses, 4);
    const feedbackClean = cleanBullets(feedback, 5);

    // ---- STRENGTHS ----
    doc.fillColor("#059669").fontSize(14).text("Strengths");
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#065f46");
    strengthsClean.forEach(s => doc.text(`• ${s}`, { indent: 20 }));

    // ---- IMPROVEMENTS ----
    doc.moveDown();
    doc.fillColor("#d97706").fontSize(14).text("Areas for Improvement");
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#92400e");
    weaknessesClean.forEach(w => doc.text(`• ${w}`, { indent: 20 }));

    // ---- AI FEEDBACK ----
    doc.moveDown();
    doc.fillColor("#2563eb").fontSize(14).text("AI Interviewer Summary");
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#1e3a8a");
    feedbackClean.forEach(f => doc.text(`• ${f}`, { indent: 20 }));

    doc.end();
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// GET Question Review for a session
router.get("/session/:sessionId/question-review", async (req, res) => {
  try {
    const sessionId = Number(req.params.sessionId);
    const userId = req.user?.id || req.user?.userId; // depending on your auth middleware

    if (!sessionId || !userId) {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Pull each question + user's answer + per-question feedback/score
    const result = await query(
      `
      SELECT
        a.answer_id,

        bq.question_id,

        COALESCE(
            sq.question_content,
            dq.generated_question_content
        ) AS "questionText",

       a.answer_text AS "userAnswer",

       ROUND(COALESCE(a.score_overall, 0)::numeric, 1) AS "score",

       COALESCE(f.suggestion_text, '') AS "feedback"

      FROM "Answer" a

      JOIN "BaseQuestion" bq
      ON bq.question_id = a.question_id

      LEFT JOIN "StaticQuestion" sq
      ON sq.base_question_id = bq.question_id

      LEFT JOIN "DynamicQuestion" dq
      ON dq.base_question_id = bq.question_id

      LEFT JOIN "Feedback" f
      ON f.answer_id = a.answer_id

      WHERE a.session_id = $1

       ORDER BY a.answer_id ASC;

      `,
      [sessionId]
    );

    const rows = result.rows.map((r) => ({
      questionText: r.questionText,
      userAnswer: r.userAnswer,
      score: Number(r.score),
      feedback: typeof r.feedback === "string"
        ? r.feedback.split("\n").map((x) => x.trim()).filter(Boolean)
        : [],
    }));

    return res.json(rows);
  } catch (err) {
    console.error("question-review error:", err);
    return res.status(500).json({ error: "Failed to load question review" });
  }
});




module.exports = router;
