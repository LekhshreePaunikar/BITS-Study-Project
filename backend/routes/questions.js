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

// Create new question (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      questionText,
      category,
      difficultyLevel,
      expectedDuration,
      sampleAnswer,
      evaluationCriteria
    } = req.body;

    // Input validation
    if (!questionText || !category || !difficultyLevel) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'Question text, category, and difficulty level are required'
      });
    }

    if (!['easy', 'medium', 'hard'].includes(difficultyLevel)) {
      return res.status(400).json({
        message: 'Invalid difficulty level',
        error: 'Difficulty level must be easy, medium, or hard'
      });
    }

    const questionResult = await query(`
      INSERT INTO questions (
        question_text, category, difficulty, expected_duration, 
        sample_answer, evaluation_criteria, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, question_text, category, difficulty, expected_duration, created_at
    `, [
      questionText,
      category,
      difficultyLevel,
      expectedDuration || 3,
      sampleAnswer,
      evaluationCriteria || [],
      req.user.id
    ]);

    const question = questionResult.rows[0];

    res.status(201).json({
      message: 'Question created successfully',
      question: {
        id: question.id,
        text: question.question_text,
        category: question.category,
        difficultyLevel: question.difficulty,
        expectedDuration: question.expected_duration,
        createdAt: question.created_at
      }
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      message: 'Failed to create question',
      error: 'Internal server error'
    });
  }
});

// Update question (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const {
      questionText,
      category,
      difficultyLevel,
      expectedDuration,
      sampleAnswer,
      evaluationCriteria
    } = req.body;

    if (isNaN(questionId)) {
      return res.status(400).json({
        message: 'Invalid question ID',
        error: 'Question ID must be a number'
      });
    }

    // Build update query dynamically
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (questionText) {
      updateFields.push(`question_text = $${paramCount++}`);
      values.push(questionText);
    }

    if (category) {
      updateFields.push(`category = $${paramCount++}`);
      values.push(category);
    }

    if (difficultyLevel) {
      if (!['easy', 'medium', 'hard'].includes(difficultyLevel)) {
        return res.status(400).json({
          message: 'Invalid difficulty level',
          error: 'Difficulty level must be easy, medium, or hard'
        });
      }
      updateFields.push(`difficulty = $${paramCount++}`);
      values.push(difficultyLevel);
    }

    if (expectedDuration !== undefined) {
      updateFields.push(`expected_duration = $${paramCount++}`);
      values.push(expectedDuration);
    }

    if (sampleAnswer !== undefined) {
      updateFields.push(`sample_answer = $${paramCount++}`);
      values.push(sampleAnswer);
    }

    if (evaluationCriteria !== undefined) {
      updateFields.push(`evaluation_criteria = $${paramCount++}`);
      values.push(evaluationCriteria);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        message: 'No fields to update',
        error: 'Please provide at least one field to update'
      });
    }

    // Add updated_at and question ID
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(questionId);

    const updateQuery = `
      UPDATE questions 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, question_text, category, difficulty, expected_duration, updated_at
    `;

    const updatedQuestion = await query(updateQuery, values);

    if (updatedQuestion.rows.length === 0) {
      return res.status(404).json({
        message: 'Question not found',
        error: 'Question does not exist'
      });
    }

    const question = updatedQuestion.rows[0];

    res.json({
      message: 'Question updated successfully',
      question: {
        id: question.id,
        text: question.question_text,
        category: question.category,
        difficultyLevel: question.difficulty,
        expectedDuration: question.expected_duration,
        updatedAt: question.updated_at
      }
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      message: 'Failed to update question',
      error: 'Internal server error'
    });
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
const INTERVIEW_QUESTION_COUNT = 6;
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
        s.role_id,
        s.skill_id,
        s.lang_id,

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
        role: row.role_id || "-",
        skill: row.skill_id || "-",
        language: row.lang_id || "-",
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

module.exports = router;