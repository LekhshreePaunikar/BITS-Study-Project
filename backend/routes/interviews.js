
const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireOwnershipOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Create interview configuration
router.post('/config', authenticateToken, async (req, res) => {
  try {
    const { jobTitle, company, experienceLevel, duration, questionCount, focusAreas } = req.body;

    // Input validation
    if (!jobTitle || !experienceLevel) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'Job title and experience level are required'
      });
    }

    if (!['beginner', 'intermediate', 'advanced'].includes(experienceLevel)) {
      return res.status(400).json({
        message: 'Invalid experience level',
        error: 'Experience level must be beginner, intermediate, or advanced'
      });
    }

    // Create configuration
    const configResult = await query(`
      INSERT INTO interview_configs (user_id, job_title, company, experience_level, duration, question_count, focus_areas)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, job_title, company, experience_level, duration, question_count, focus_areas, created_at
    `, [req.user.id, jobTitle, company, experienceLevel, duration || 30, questionCount || 5, focusAreas || []]);

    const config = configResult.rows[0];

    res.status(201).json({
      message: 'Interview configuration created successfully',
      config: {
        id: config.id,
        jobTitle: config.job_title,
        company: config.company,
        experienceLevel: config.experience_level,
        duration: config.duration,
        questionCount: config.question_count,
        focusAreas: config.focus_areas,
        createdAt: config.created_at
      }
    });
  } catch (error) {
    console.error('Create interview config error:', error);
    res.status(500).json({
      message: 'Failed to create interview configuration',
      error: 'Internal server error'
    });
  }
});

// Start interview session
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { configId } = req.body;

    if (!configId) {
      return res.status(400).json({
        message: 'Missing configuration ID',
        error: 'Configuration ID is required to start interview'
      });
    }

    // Verify config belongs to user
    const configResult = await query(
      'SELECT * FROM interview_configs WHERE id = $1 AND user_id = $2',
      [configId, req.user.id]
    );

    if (configResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Configuration not found',
        error: 'Invalid configuration ID'
      });
    }

    const config = configResult.rows[0];

    // Create interview session
    const sessionResult = await query(`
      INSERT INTO interview_sessions (user_id, config_id, session_status, started_at)
      VALUES ($1, $2, 'in_progress', CURRENT_TIMESTAMP)
      RETURNING id, session_status, started_at
    `, [req.user.id, configId]);

    const session = sessionResult.rows[0];

    // Get questions based on configuration
    const questionsResult = await query(`
      SELECT id, question_text, category, difficulty_level, expected_duration
      FROM questions
      WHERE difficulty_level = $1 AND is_active = true
      ORDER BY RANDOM()
      LIMIT $2
    `, [config.experience_level, config.question_count]);

    // Create session questions
    const sessionQuestions = [];
    for (let i = 0; i < questionsResult.rows.length; i++) {
      const question = questionsResult.rows[i];
      const sessionQuestionResult = await query(`
        INSERT INTO session_questions (session_id, question_id, question_order, question_text)
        VALUES ($1, $2, $3, $4)
        RETURNING id, question_order, question_text
      `, [session.id, question.id, i + 1, question.question_text]);

      sessionQuestions.push({
        id: sessionQuestionResult.rows[0].id,
        order: sessionQuestionResult.rows[0].question_order,
        text: sessionQuestionResult.rows[0].question_text,
        category: question.category,
        expectedDuration: question.expected_duration
      });
    }

    res.status(201).json({
      message: 'Interview session started successfully',
      session: {
        id: session.id,
        status: session.session_status,
        startedAt: session.started_at,
        config: {
          jobTitle: config.job_title,
          company: config.company,
          experienceLevel: config.experience_level,
          duration: config.duration
        },
        questions: sessionQuestions
      }
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({
      message: 'Failed to start interview session',
      error: 'Internal server error'
    });
  }
});

// Submit answer for a question
router.post('/sessions/:sessionId/answers', authenticateToken, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const { questionId, answer, timeSpent } = req.body;

    if (isNaN(sessionId)) {
      return res.status(400).json({
        message: 'Invalid session ID',
        error: 'Session ID must be a number'
      });
    }

    if (!questionId || !answer) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'Question ID and answer are required'
      });
    }

    // Verify session belongs to user
    const sessionResult = await query(
      'SELECT id FROM interview_sessions WHERE id = $1 AND user_id = $2 AND session_status = $3',
      [sessionId, req.user.id, 'in_progress']
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Session not found',
        error: 'Invalid session or session is not in progress'
      });
    }

    // Update session question with answer
    const updateResult = await query(`
      UPDATE session_questions 
      SET user_answer = $1, time_spent = $2
      WHERE session_id = $3 AND id = $4
      RETURNING id, question_text, user_answer, time_spent
    `, [answer, timeSpent || 0, sessionId, questionId]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Question not found',
        error: 'Invalid question ID for this session'
      });
    }

    const updatedQuestion = updateResult.rows[0];

    res.json({
      message: 'Answer submitted successfully',
      question: {
        id: updatedQuestion.id,
        text: updatedQuestion.question_text,
        answer: updatedQuestion.user_answer,
        timeSpent: updatedQuestion.time_spent
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      message: 'Failed to submit answer',
      error: 'Internal server error'
    });
  }
});

// Complete interview session
router.post('/sessions/:sessionId/complete', authenticateToken, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);

    if (isNaN(sessionId)) {
      return res.status(400).json({
        message: 'Invalid session ID',
        error: 'Session ID must be a number'
      });
    }

    // Verify session belongs to user
    const sessionResult = await query(
      'SELECT id FROM interview_sessions WHERE id = $1 AND user_id = $2 AND session_status = $3',
      [sessionId, req.user.id, 'in_progress']
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Session not found',
        error: 'Invalid session or session is not in progress'
      });
    }

    // Calculate session statistics
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_questions,
        COUNT(CASE WHEN user_answer IS NOT NULL AND user_answer != '' THEN 1 END) as answered_questions,
        SUM(CASE WHEN time_spent IS NOT NULL THEN time_spent ELSE 0 END) as total_time
      FROM session_questions
      WHERE session_id = $1
    `, [sessionId]);

    const stats = statsResult.rows[0];

    // Generate a basic score (this could be enhanced with AI evaluation)
    const completionRate = stats.answered_questions / stats.total_questions;
    const baseScore = Math.round(completionRate * 85); // Base score of 85% for completing all questions
    const overallScore = Math.min(100, Math.max(0, baseScore + Math.floor(Math.random() * 15))); // Add some randomness for demo

    // Update session as completed
    const completeResult = await query(`
      UPDATE interview_sessions 
      SET 
        session_status = 'completed',
        completed_at = CURRENT_TIMESTAMP,
        total_duration = $1,
        overall_score = $2
      WHERE id = $3
      RETURNING id, session_status, completed_at, total_duration, overall_score
    `, [stats.total_time, overallScore, sessionId]);

    const completedSession = completeResult.rows[0];

    // Generate basic feedback (this could be enhanced with AI)
    const feedbackResult = await query(`
      INSERT INTO session_feedback (
        session_id, 
        strengths, 
        areas_for_improvement, 
        detailed_feedback,
        overall_rating
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, strengths, areas_for_improvement, detailed_feedback, overall_rating
    `, [
      sessionId,
      ['Good communication skills', 'Completed all questions', 'Showed enthusiasm'],
      ['Provide more specific examples', 'Elaborate on technical details'],
      'Overall solid performance. Consider providing more detailed examples and expanding on your technical experience.',
      Math.round(overallScore / 20) // Convert to 1-5 rating
    ]);

    const feedback = feedbackResult.rows[0];

    res.json({
      message: 'Interview session completed successfully',
      session: {
        id: completedSession.id,
        status: completedSession.session_status,
        completedAt: completedSession.completed_at,
        totalDuration: completedSession.total_duration,
        overallScore: completedSession.overall_score,
        questionsAnswered: parseInt(stats.answered_questions),
        totalQuestions: parseInt(stats.total_questions)
      },
      feedback: {
        strengths: feedback.strengths,
        areasForImprovement: feedback.areas_for_improvement,
        detailedFeedback: feedback.detailed_feedback,
        overallRating: feedback.overall_rating
      }
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({
      message: 'Failed to complete interview session',
      error: 'Internal server error'
    });
  }
});

// Get user's interview sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const sessionsResult = await query(`
      SELECT 
        s.id,
        s.session_status,
        s.started_at,
        s.completed_at,
        s.overall_score,
        c.job_title,
        c.company,
        c.experience_level,
        COUNT(sq.id) as total_questions,
        COUNT(CASE WHEN sq.user_answer IS NOT NULL AND sq.user_answer != '' THEN 1 END) as answered_questions
      FROM interview_sessions s
      JOIN interview_configs c ON s.config_id = c.id
      LEFT JOIN session_questions sq ON s.id = sq.session_id
      WHERE s.user_id = $1
      GROUP BY s.id, c.id
      ORDER BY s.started_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, limit, offset]);

    // Get total count for pagination
    const countResult = await query(
      'SELECT COUNT(*) as total FROM interview_sessions WHERE user_id = $1',
      [req.user.id]
    );

    const totalSessions = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalSessions / limit);

    res.json({
      sessions: sessionsResult.rows.map(session => ({
        id: session.id,
        status: session.session_status,
        startedAt: session.started_at,
        completedAt: session.completed_at,
        overallScore: session.overall_score,
        jobTitle: session.job_title,
        company: session.company,
        experienceLevel: session.experience_level,
        totalQuestions: parseInt(session.total_questions),
        answeredQuestions: parseInt(session.answered_questions)
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalSessions,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      message: 'Failed to get interview sessions',
      error: 'Internal server error'
    });
  }
});

// Get specific session details
router.get('/sessions/:sessionId', authenticateToken, requireOwnershipOrAdmin('sessionId'), async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);

    if (isNaN(sessionId)) {
      return res.status(400).json({
        message: 'Invalid session ID',
        error: 'Session ID must be a number'
      });
    }

    // Get session details
    const sessionResult = await query(`
      SELECT 
        s.*,
        c.job_title,
        c.company,
        c.experience_level,
        c.duration as config_duration,
        f.strengths,
        f.areas_for_improvement,
        f.detailed_feedback,
        f.overall_rating
      FROM interview_sessions s
      JOIN interview_configs c ON s.config_id = c.id
      LEFT JOIN session_feedback f ON s.id = f.session_id
      WHERE s.id = $1
    `, [sessionId]);

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Session not found',
        error: 'Session does not exist'
      });
    }

    const session = sessionResult.rows[0];

    // Get session questions and answers
    const questionsResult = await query(`
      SELECT 
        sq.id,
        sq.question_order,
        sq.question_text,
        sq.user_answer,
        sq.ai_feedback,
        sq.score,
        sq.time_spent,
        q.category,
        q.expected_duration
      FROM session_questions sq
      LEFT JOIN questions q ON sq.question_id = q.id
      WHERE sq.session_id = $1
      ORDER BY sq.question_order
    `, [sessionId]);

    res.json({
      session: {
        id: session.id,
        status: session.session_status,
        startedAt: session.started_at,
        completedAt: session.completed_at,
        totalDuration: session.total_duration,
        overallScore: session.overall_score,
        config: {
          jobTitle: session.job_title,
          company: session.company,
          experienceLevel: session.experience_level,
          duration: session.config_duration
        },
        questions: questionsResult.rows.map(q => ({
          id: q.id,
          order: q.question_order,
          text: q.question_text,
          answer: q.user_answer,
          feedback: q.ai_feedback,
          score: q.score,
          timeSpent: q.time_spent,
          category: q.category,
          expectedDuration: q.expected_duration
        })),
        feedback: session.strengths ? {
          strengths: session.strengths,
          areasForImprovement: session.areas_for_improvement,
          detailedFeedback: session.detailed_feedback,
          overallRating: session.overall_rating
        } : null
      }
    });
  } catch (error) {
    console.error('Get session details error:', error);
    res.status(500).json({
      message: 'Failed to get session details',
      error: 'Internal server error'
    });
  }
});

module.exports = router;

