// root/backend/routes/questions.ja

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
      whereClause += ` AND difficulty_level = $${paramCount++}`;
      params.push(difficulty);
    }

    // Add pagination parameters
    params.push(limit, offset);

    const questionsResult = await query(`
      SELECT 
        id, question_text, category, difficulty_level, expected_duration, 
        sample_answer, evaluation_criteria, created_at
      FROM questions
      ${whereClause}
      ORDER BY category, difficulty_level, created_at DESC
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
        difficultyLevel: q.difficulty_level,
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
        COUNT(CASE WHEN difficulty_level = 'beginner' THEN 1 END) as beginner_count,
        COUNT(CASE WHEN difficulty_level = 'intermediate' THEN 1 END) as intermediate_count,
        COUNT(CASE WHEN difficulty_level = 'advanced' THEN 1 END) as advanced_count
      FROM questions 
      WHERE is_active = true
      GROUP BY category
      ORDER BY category
    `);

    res.json({
      categories: categoriesResult.rows.map(cat => ({
        name: cat.category,
        totalQuestions: parseInt(cat.question_count),
        beginnerCount: parseInt(cat.beginner_count),
        intermediateCount: parseInt(cat.intermediate_count),
        advancedCount: parseInt(cat.advanced_count)
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

    if (!['beginner', 'intermediate', 'advanced'].includes(difficultyLevel)) {
      return res.status(400).json({
        message: 'Invalid difficulty level',
        error: 'Difficulty level must be beginner, intermediate, or advanced'
      });
    }

    const questionResult = await query(`
      INSERT INTO questions (
        question_text, category, difficulty_level, expected_duration, 
        sample_answer, evaluation_criteria, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, question_text, category, difficulty_level, expected_duration, created_at
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
        difficultyLevel: question.difficulty_level,
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
      if (!['beginner', 'intermediate', 'advanced'].includes(difficultyLevel)) {
        return res.status(400).json({
          message: 'Invalid difficulty level',
          error: 'Difficulty level must be beginner, intermediate, or advanced'
        });
      }
      updateFields.push(`difficulty_level = $${paramCount++}`);
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
      RETURNING id, question_text, category, difficulty_level, expected_duration, updated_at
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
        difficultyLevel: question.difficulty_level,
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

module.exports = router;