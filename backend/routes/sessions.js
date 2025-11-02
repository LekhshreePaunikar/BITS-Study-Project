// root/backend/routes/sessions.js

const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const checkLogin = require('../middleware/checkLogin');

const router = express.Router();

// Get session feedback
router.get('/:sessionId/feedback', authenticateToken, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);

    if (isNaN(sessionId)) {
      return res.status(400).json({
        message: 'Invalid session ID',
        error: 'Session ID must be a number'
      });
    }

    // Verify session belongs to user or user is admin
    const sessionResult = await query(
      'SELECT user_id FROM interview_sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Session not found',
        error: 'Session does not exist'
      });
    }

    const sessionUserId = sessionResult.rows[0].user_id;
    if (sessionUserId !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({
        message: 'Access denied',
        error: 'You can only access your own session feedback'
      });
    }

    // Get feedback
    const feedbackResult = await query(`
      SELECT 
        f.*,
        s.overall_score,
        s.session_status,
        s.completed_at
      FROM session_feedback f
      JOIN interview_sessions s ON f.session_id = s.id
      WHERE f.session_id = $1
    `, [sessionId]);

    if (feedbackResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Feedback not found',
        error: 'No feedback available for this session'
      });
    }

    const feedback = feedbackResult.rows[0];

    res.json({
      feedback: {
        id: feedback.id,
        sessionId: feedback.session_id,
        strengths: feedback.strengths,
        areasForImprovement: feedback.areas_for_improvement,
        detailedFeedback: feedback.detailed_feedback,
        recommendations: feedback.recommendations,
        overallRating: feedback.overall_rating,
        overallScore: feedback.overall_score,
        sessionStatus: feedback.session_status,
        completedAt: feedback.completed_at,
        createdAt: feedback.created_at
      }
    });
  } catch (error) {
    console.error('Get session feedback error:', error);
    res.status(500).json({
      message: 'Failed to get session feedback',
      error: 'Internal server error'
    });
  }
});

// Update session feedback (can be used for AI enhancements)
router.put('/:sessionId/feedback', authenticateToken, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const { 
      strengths, 
      areasForImprovement, 
      detailedFeedback, 
      recommendations,
      overallRating 
    } = req.body;

    if (isNaN(sessionId)) {
      return res.status(400).json({
        message: 'Invalid session ID',
        error: 'Session ID must be a number'
      });
    }

    // Verify session belongs to user or user is admin
    const sessionResult = await query(
      'SELECT user_id FROM interview_sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Session not found',
        error: 'Session does not exist'
      });
    }

    const sessionUserId = sessionResult.rows[0].user_id;
    if (sessionUserId !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({
        message: 'Access denied',
        error: 'You can only update your own session feedback'
      });
    }

    // Build update query dynamically
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (strengths) {
      updateFields.push(`strengths = $${paramCount++}`);
      values.push(strengths);
    }

    if (areasForImprovement) {
      updateFields.push(`areas_for_improvement = $${paramCount++}`);
      values.push(areasForImprovement);
    }

    if (detailedFeedback) {
      updateFields.push(`detailed_feedback = $${paramCount++}`);
      values.push(detailedFeedback);
    }

    if (recommendations) {
      updateFields.push(`recommendations = $${paramCount++}`);
      values.push(recommendations);
    }

    if (overallRating) {
      updateFields.push(`overall_rating = $${paramCount++}`);
      values.push(overallRating);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        message: 'No fields to update',
        error: 'Please provide at least one field to update'
      });
    }

    values.push(sessionId);

    const updateQuery = `
      UPDATE session_feedback 
      SET ${updateFields.join(', ')}
      WHERE session_id = $${paramCount}
      RETURNING id, strengths, areas_for_improvement, detailed_feedback, recommendations, overall_rating
    `;

    const updatedFeedback = await query(updateQuery, values);

    if (updatedFeedback.rows.length === 0) {
      return res.status(404).json({
        message: 'Feedback not found',
        error: 'No feedback found for this session'
      });
    }

    const feedback = updatedFeedback.rows[0];

    res.json({
      message: 'Feedback updated successfully',
      feedback: {
        id: feedback.id,
        strengths: feedback.strengths,
        areasForImprovement: feedback.areas_for_improvement,
        detailedFeedback: feedback.detailed_feedback,
        recommendations: feedback.recommendations,
        overallRating: feedback.overall_rating
      }
    });
  } catch (error) {
    console.error('Update session feedback error:', error);
    res.status(500).json({
      message: 'Failed to update session feedback',
      error: 'Internal server error'
    });
  }
});

// Get session performance metrics
router.get('/:sessionId/metrics', authenticateToken, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);

    if (isNaN(sessionId)) {
      return res.status(400).json({
        message: 'Invalid session ID',
        error: 'Session ID must be a number'
      });
    }

    // Verify session belongs to user or user is admin
    const sessionResult = await query(
      'SELECT user_id, overall_score, total_duration FROM interview_sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Session not found',
        error: 'Session does not exist'
      });
    }

    const session = sessionResult.rows[0];
    if (session.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({
        message: 'Access denied',
        error: 'You can only access your own session metrics'
      });
    }

    // Get detailed question metrics
    const metricsResult = await query(`
      SELECT 
        sq.id,
        sq.question_order,
        sq.score,
        sq.time_spent,
        q.category,
        q.expected_duration,
        CASE 
          WHEN sq.time_spent <= q.expected_duration * 60 THEN 'on_time'
          WHEN sq.time_spent <= q.expected_duration * 60 * 1.5 THEN 'slightly_over'
          ELSE 'over_time'
        END as time_performance
      FROM session_questions sq
      LEFT JOIN questions q ON sq.question_id = q.id
      WHERE sq.session_id = $1
      ORDER BY sq.question_order
    `, [sessionId]);

    // Calculate category-wise performance
    const categoryStats = {};
    metricsResult.rows.forEach(metric => {
      const category = metric.category || 'Unknown';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          totalQuestions: 0,
          totalScore: 0,
          totalTime: 0,
          averageScore: 0,
          averageTime: 0
        };
      }
      
      categoryStats[category].totalQuestions++;
      categoryStats[category].totalScore += metric.score || 0;
      categoryStats[category].totalTime += metric.time_spent || 0;
    });

    // Calculate averages
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.averageScore = stats.totalScore / stats.totalQuestions;
      stats.averageTime = stats.totalTime / stats.totalQuestions;
    });

    res.json({
      metrics: {
        sessionId,
        overallScore: session.overall_score,
        totalDuration: session.total_duration,
        questionMetrics: metricsResult.rows.map(metric => ({
          questionId: metric.id,
          order: metric.question_order,
          score: metric.score,
          timeSpent: metric.time_spent,
          category: metric.category,
          expectedDuration: metric.expected_duration,
          timePerformance: metric.time_performance
        })),
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get session metrics error:', error);
    res.status(500).json({
      message: 'Failed to get session metrics',
      error: 'Internal server error'
    });
  }
});

// Record user performance metrics
router.post('/performance', authenticateToken, async (req, res) => {
  try {
    const { metricName, metricValue, additionalData } = req.body;

    if (!metricName || metricValue === undefined) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'Metric name and value are required'
      });
    }

    const performanceResult = await query(`
      INSERT INTO user_performance (user_id, metric_name, metric_value, additional_data)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, metric_name, metric_date)
      DO UPDATE SET 
        metric_value = EXCLUDED.metric_value,
        additional_data = EXCLUDED.additional_data
      RETURNING id, metric_name, metric_value, metric_date, additional_data
    `, [req.user.id, metricName, metricValue, additionalData || {}]);

    const performance = performanceResult.rows[0];

    res.status(201).json({
      message: 'Performance metric recorded successfully',
      performance: {
        id: performance.id,
        metricName: performance.metric_name,
        metricValue: performance.metric_value,
        metricDate: performance.metric_date,
        additionalData: performance.additional_data
      }
    });
  } catch (error) {
    console.error('Record performance metric error:', error);
    res.status(500).json({
      message: 'Failed to record performance metric',
      error: 'Internal server error'
    });
  }
});

// Get user performance history
router.get('/performance/history', authenticateToken, async (req, res) => {
  try {
    const { metricName, days = 30 } = req.query;

    let whereClause = 'WHERE user_id = $1';
    let params = [req.user.id];
    let paramCount = 2;

    if (metricName) {
      whereClause += ` AND metric_name = $${paramCount++}`;
      params.push(metricName);
    }

    whereClause += ` AND metric_date >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'`;

    const performanceResult = await query(`
      SELECT 
        id, metric_name, metric_value, metric_date, additional_data
      FROM user_performance
      ${whereClause}
      ORDER BY metric_date DESC, metric_name
    `, params);

    res.json({
      performance: performanceResult.rows.map(p => ({
        id: p.id,
        metricName: p.metric_name,
        metricValue: parseFloat(p.metric_value),
        metricDate: p.metric_date,
        additionalData: p.additional_data
      }))
    });
  } catch (error) {
    console.error('Get performance history error:', error);
    res.status(500).json({
      message: 'Failed to get performance history',
      error: 'Internal server error'
    });
  }
});

module.exports = router;