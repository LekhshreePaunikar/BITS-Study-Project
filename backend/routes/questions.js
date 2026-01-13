// root/backend/routes/questions.js

const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all questions (with optional filtering)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, difficulty, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE is_active = true';
    let params = [];
    let paramCount = 1;

    if (category) {
      whereClause += ` AND category = $${paramCount++}`;
      params.push(category);
    }

    if (difficulty) {
      whereClause += ` AND difficulty = $${paramCount++}`;
      params.push(difficulty);
    }

    // Add pagination parameters
    params.push(limit, offset);

    const questionsResult = await query(`
      SELECT 
        id, question_text, category, difficulty, expected_duration, 
        sample_answer, evaluation_criteria, created_at
      FROM questions
      ${whereClause}
      ORDER BY category, difficulty, created_at DESC
      LIMIT $${paramCount++} OFFSET $${paramCount}
    `, params);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total FROM questions ${whereClause}
    `, params.slice(0, -2)); // Remove limit and offset params

    const totalQuestions = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalQuestions / limit);

    res.json({
      questions: questionsResult.rows.map(q => ({
        id: q.id,
        text: q.question_text,
        category: q.category,
        difficultyLevel: q.difficulty,
        expectedDuration: q.expected_duration,
        sampleAnswer: q.sample_answer,
        evaluationCriteria: q.evaluation_criteria,
        createdAt: q.created_at
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalQuestions,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      message: 'Failed to get questions',
      error: 'Internal server error'
    });
  }
});

// Get question categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categoriesResult = await query(`
      SELECT 
        category, 
        COUNT(*) as question_count,
        COUNT(CASE WHEN difficulty = 'easy' THEN 1 END) as easy_count,
        COUNT(CASE WHEN difficulty = 'medium' THEN 1 END) as medium_count,
        COUNT(CASE WHEN difficulty = 'hard' THEN 1 END) as hard_count
      FROM questions 
      WHERE is_active = true
      GROUP BY category
      ORDER BY category
    `);

    res.json({
      categories: categoriesResult.rows.map(cat => ({
        name: cat.category,
        totalQuestions: parseInt(cat.question_count),
        easyCount: parseInt(cat.easy_count),
        mediumCount: parseInt(cat.medium_count),
        hardCount: parseInt(cat.hard_count)
      }))
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      message: 'Failed to get question categories',
      error: 'Internal server error'
    });
  }
});

//(admin only) Create Static Question (BaseQuestion + StaticQuestion)
router.post("/admin", authenticateToken, requireAdmin, async (req, res) => {
  const userId = req.user.id;

  const {
    content,
    roles,
    skills,
    langs,
    level
  } = req.body;

  if (
    !content ||
    !Array.isArray(roles) || roles.length === 0 ||
    !Array.isArray(skills) || skills.length === 0 ||
    !Array.isArray(langs) || langs.length === 0
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // 1️⃣ Create BaseQuestion
    const baseRes = await query(
      `
      INSERT INTO "BaseQuestion"
        (is_predefined, difficulty, created_by)
      VALUES
        (true, $1, $2)
      RETURNING question_id, created_at
      `,
      [level, userId]
    );

    const baseQuestionId = baseRes.rows[0].question_id;

    // 2️⃣ Create StaticQuestion
    await query(
      `
      INSERT INTO "StaticQuestion"
        (base_question_id, question_content, roles, skills, langs)
      VALUES
        ($1, $2, $3, $4, $5)
      `,
      [baseQuestionId, content, roles, skills, langs]
    );

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      questionId: baseQuestionId
    });

  } catch (err) {
    console.error("Create static question error:", err);
    res.status(500).json({ message: "Failed to create question" });
  }
});


// (admin only) Update Static Question
router.put("/admin/:questionId", authenticateToken, requireAdmin, async (req, res) => {
  const { questionId } = req.params;
  const {
    content,
    roles,
    skills,
    langs,
    level
  } = req.body;

  if (!content || !roles || !skills || !langs || !level) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await query(
      `
      UPDATE "BaseQuestion"
      SET difficulty = $1,
          last_updated = NOW()
      WHERE question_id = $2
      `,
      [level, questionId]
    );

    const result = await query(
      `
      UPDATE "StaticQuestion"
      SET
        question_content = $1,
        roles = $2,
        skills = $3,
        langs = $4
      WHERE base_question_id = $5
      RETURNING static_question_id
      `,
      [content, roles, skills, langs, questionId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ success: true, message: "Question updated successfully" });

  } catch (err) {
    console.error("Update question error:", err);
    res.status(500).json({ message: "Failed to update question" });
  }
});

// Delete question (admin only) - soft delete
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);

    if (isNaN(questionId)) {
      return res.status(400).json({
        message: 'Invalid question ID',
        error: 'Question ID must be a number'
      });
    }

    const result = await query(
      'UPDATE questions SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [questionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Question not found',
        error: 'Question does not exist'
      });
    }

    res.json({
      message: 'Question deactivated successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      message: 'Failed to delete question',
      error: 'Internal server error'
    });
  }
});

// NOTE: This will fetch only the latest 6 questions from the database
// Later I plan to replace it with proper logic
const INTERVIEW_QUESTION_COUNT = 3;
// --------------------------------------------------
// Interview: Fetch latest questions for interview
// --------------------------------------------------
router.get("/predefined", authenticateToken, async (req, res) => {
  try {
    const questions = [];

    // Fetch latest N base questions
    const baseQuestionsRes = await query(
      `
      SELECT question_id, is_predefined, difficulty
      FROM "BaseQuestion"
      ORDER BY created_at DESC
      LIMIT $1
      `,
      [INTERVIEW_QUESTION_COUNT]
    );

    for (const base of baseQuestionsRes.rows) {
      let text = "";

      // Resolve question source
      if (base.is_predefined) {
        const staticRes = await query(
          `
          SELECT question_content
          FROM "StaticQuestion"
          WHERE base_question_id = $1
          `,
          [base.question_id]
        );

        text = staticRes.rows[0]?.question_content || "";
      } else {
        const dynamicRes = await query(
          `
          SELECT generated_question_content
          FROM "DynamicQuestion"
          WHERE base_question_id = $1
          LIMIT 1
          `,
          [base.question_id]
        );

        text = dynamicRes.rows[0]?.generated_question_content || "";
      }

      questions.push({
        questionId: base.question_id,
        text,
        difficulty: base.difficulty,
        type: base.is_predefined ? "static" : "dynamic",
      });
    }

    return res.json({
      success: true,
      count: questions.length,
      questions,
    });

  } catch (error) {
    console.error("Predefined interview questions error:", error);
    return res.status(500).json({
      message: "Failed to fetch interview questions",
    });
  }
});

// --------------------------------------------------
// Admin: Fetch Question Bank (Static + Dynamic)
// --------------------------------------------------
router.get("/admin", authenticateToken, requireAdmin, async (req, res) => {
  const userId = req.user?.id || req.user?.userId;

  if (!userId) {
    console.error("[GET /questions/admin] Missing userId", req.user);
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log("[GET /questions/admin] userId:", userId);
  try {
    const result = await query(`
      SELECT
        b.question_id,
        b.difficulty,
        b.created_at,

        -- Static question fields
        s.question_content AS static_text,
        s.roles,
        s.skills,
        s.langs,

        -- Dynamic question fields
        d.generated_question_content AS dynamic_text

      FROM "BaseQuestion" b
      LEFT JOIN "StaticQuestion" s
        ON s.base_question_id = b.question_id
      LEFT JOIN "DynamicQuestion" d
        ON d.base_question_id = b.question_id

      ORDER BY b.created_at DESC
    `);

    console.log(
      "[GET /questions/admin] DB rows:",
      result.rowCount,
      result.rows[0]
    );

    const questions = result.rows
      .filter(row => row.static_text || row.dynamic_text)
      .map(row => ({
        questionId: row.question_id,
        content: row.static_text || row.dynamic_text,
        roles: row.roles || [],
        skills: row.skills || [],
        langs: row.langs || [],
        level: row.difficulty,
        createdBy: row.static_text ? "Admin" : "LLM",
        dateTime: row.created_at,
        type: row.static_text ? "static" : "dynamic"
      }));

    console.log(
      "[GET /questions/admin] final response count:",
      questions.length
    );
    res.json({ success: true, questions });

  } catch (error) {
    console.error("Admin question fetch error:", error);
    res.status(500).json({
      message: "Failed to load question bank"
    });
  }
});

// DELETE question (via BaseQuestion cascade)
router.delete("/admin/:questionId", authenticateToken, requireAdmin, async (req, res) => {
  const { questionId } = req.params;

  try {
    const result = await query(
      `DELETE FROM "BaseQuestion" WHERE question_id = $1 RETURNING question_id`,
      [questionId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ success: true, message: "Question deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete question" });
  }
});



module.exports = router;