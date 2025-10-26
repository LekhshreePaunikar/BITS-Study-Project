
const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get user statistics
    const userStatsResult = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_30d
      FROM users
    `);

    // Get session statistics
    const sessionStatsResult = await query(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN session_status = 'completed' THEN 1 END) as completed_sessions,
        COUNT(CASE WHEN started_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as sessions_7d,
        AVG(CASE WHEN overall_score IS NOT NULL THEN overall_score END) as avg_score
      FROM interview_sessions
    `);

    // Get question statistics
    const questionStatsResult = await query(`
      SELECT 
        COUNT(*) as total_questions,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_questions,
        COUNT(DISTINCT category) as categories
      FROM questions
    `);

    // Get recent activity
    const recentActivityResult = await query(`
      SELECT 
        'session' as activity_type,
        u.username,
        s.started_at as activity_time,
        json_build_object(
          'sessionId', s.id,
          'status', s.session_status,
          'score', s.overall_score
        ) as activity_data
      FROM interview_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.started_at >= CURRENT_DATE - INTERVAL '24 hours'
      ORDER BY s.started_at DESC
      LIMIT 10
    `);

    const userStats = userStatsResult.rows[0];
    const sessionStats = sessionStatsResult.rows[0];
    const questionStats = questionStatsResult.rows[0];

    res.json({
      dashboard: {
        userStats: {
          totalUsers: parseInt(userStats.total_users),
          activeUsers: parseInt(userStats.active_users),
          newUsers30d: parseInt(userStats.new_users_30d)
        },
        sessionStats: {
          totalSessions: parseInt(sessionStats.total_sessions),
          completedSessions: parseInt(sessionStats.completed_sessions),
          sessions7d: parseInt(sessionStats.sessions_7d),
          averageScore: parseFloat(sessionStats.avg_score) || 0
        },
        questionStats: {
          totalQuestions: parseInt(questionStats.total_questions),
          activeQuestions: parseInt(questionStats.active_questions),
          categories: parseInt(questionStats.categories)
        },
        recentActivity: recentActivityResult.rows.map(activity => ({
          type: activity.activity_type,
          username: activity.username,
          time: activity.activity_time,
          data: activity.activity_data
        }))
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      message: 'Failed to get dashboard statistics',
      error: 'Internal server error'
    });
  }
});

// Get all users with filtering and pagination
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, active } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramCount = 1;

    if (search) {
      whereClause += ` AND (username ILIKE $${paramCount} OR email ILIKE $${paramCount} OR full_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (active !== undefined) {
      whereClause += ` AND is_active = $${paramCount++}`;
      params.push(active === 'true');
    }

    // Add pagination parameters
    params.push(limit, offset);

    const usersResult = await query(`
      SELECT 
        u.id, u.username, u.email, u.full_name, u.is_admin, u.is_active, u.created_at,
        COUNT(s.id) as session_count,
        AVG(s.overall_score) as avg_score
      FROM users u
      LEFT JOIN interview_sessions s ON u.id = s.user_id AND s.session_status = 'completed'
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT $${paramCount++} OFFSET $${paramCount}
    `, params);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total FROM users ${whereClause}
    `, params.slice(0, -2)); // Remove limit and offset params

    const totalUsers = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users: usersResult.rows.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        isAdmin: user.is_admin,
        isActive: user.is_active,
        createdAt: user.created_at,
        sessionCount: parseInt(user.session_count),
        averageScore: parseFloat(user.avg_score) || 0
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      message: 'Failed to get users',
      error: 'Internal server error'
    });
  }
});

// Toggle user active status
router.put('/users/:userId/toggle-status', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        error: 'User ID must be a number'
      });
    }

    // Don't allow admin to deactivate themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        message: 'Cannot modify own status',
        error: 'Administrators cannot deactivate their own accounts'
      });
    }

    const result = await query(`
      UPDATE users 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING id, username, is_active
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        error: 'User does not exist'
      });
    }

    const user = result.rows[0];

    // Log admin action
    await query(`
      INSERT INTO admin_logs (admin_user_id, action, target_user_id, details, ip_address)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      user.is_active ? 'activate_user' : 'deactivate_user',
      userId,
      { username: user.username },
      req.ip
    ]);

    res.json({
      message: `User ${user.is_active ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user.id,
        username: user.username,
        isActive: user.is_active
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      message: 'Failed to update user status',
      error: 'Internal server error'
    });
  }
});

// Get system analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let intervalClause;
    switch (period) {
      case '7d':
        intervalClause = "INTERVAL '7 days'";
        break;
      case '30d':
        intervalClause = "INTERVAL '30 days'";
        break;
      case '90d':
        intervalClause = "INTERVAL '90 days'";
        break;
      default:
        intervalClause = "INTERVAL '30 days'";
    }

    // Session analytics
    const sessionAnalyticsResult = await query(`
      SELECT 
        DATE(started_at) as date,
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN session_status = 'completed' THEN 1 END) as completed_sessions,
        AVG(CASE WHEN overall_score IS NOT NULL THEN overall_score END) as avg_score
      FROM interview_sessions
      WHERE started_at >= CURRENT_DATE - ${intervalClause}
      GROUP BY DATE(started_at)
      ORDER BY date DESC
    `);

    // User registration analytics
    const userAnalyticsResult = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM users
      WHERE created_at >= CURRENT_DATE - ${intervalClause}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Question category performance
    const categoryPerformanceResult = await query(`
      SELECT 
        q.category,
        COUNT(sq.id) as times_asked,
        AVG(sq.score) as avg_score,
        AVG(sq.time_spent) as avg_time
      FROM session_questions sq
      JOIN questions q ON sq.question_id = q.id
      JOIN interview_sessions s ON sq.session_id = s.id
      WHERE s.started_at >= CURRENT_DATE - ${intervalClause}
        AND sq.score IS NOT NULL
      GROUP BY q.category
      ORDER BY times_asked DESC
    `);

    res.json({
      analytics: {
        period,
        sessionTrends: sessionAnalyticsResult.rows.map(row => ({
          date: row.date,
          totalSessions: parseInt(row.total_sessions),
          completedSessions: parseInt(row.completed_sessions),
          averageScore: parseFloat(row.avg_score) || 0
        })),
        userRegistrations: userAnalyticsResult.rows.map(row => ({
          date: row.date,
          newUsers: parseInt(row.new_users)
        })),
        categoryPerformance: categoryPerformanceResult.rows.map(row => ({
          category: row.category,
          timesAsked: parseInt(row.times_asked),
          averageScore: parseFloat(row.avg_score) || 0,
          averageTime: parseFloat(row.avg_time) || 0
        }))
      }
    });
  } catch (error) {
    console.error('Get admin analytics error:', error);
    res.status(500).json({
      message: 'Failed to get analytics',
      error: 'Internal server error'
    });
  }
});

// Get admin logs
router.get('/logs', async (req, res) => {
  try {
    const { page = 1, limit = 50, action } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramCount = 1;

    if (action) {
      whereClause += ` AND action = $${paramCount++}`;
      params.push(action);
    }

    // Add pagination parameters
    params.push(limit, offset);

    const logsResult = await query(`
      SELECT 
        l.*,
        a.username as admin_username,
        t.username as target_username
      FROM admin_logs l
      JOIN users a ON l.admin_user_id = a.id
      LEFT JOIN users t ON l.target_user_id = t.id
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT $${paramCount++} OFFSET $${paramCount}
    `, params);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total FROM admin_logs ${whereClause}
    `, params.slice(0, -2)); // Remove limit and offset params

    const totalLogs = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalLogs / limit);

    res.json({
      logs: logsResult.rows.map(log => ({
        id: log.id,
        action: log.action,
        adminUsername: log.admin_username,
        targetUsername: log.target_username,
        details: log.details,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        createdAt: log.created_at
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalLogs,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({
      message: 'Failed to get admin logs',
      error: 'Internal server error'
    });
  }
});

// Content moderation - Get flagged content (placeholder)
router.get('/flagged-content', async (req, res) => {
  try {
    // This is a placeholder for flagged content
    // In a real implementation, you might have a table for flagged user answers
    // or inappropriate content that needs moderation
    
    res.json({
      flaggedContent: [],
      message: 'Content moderation feature ready for implementation'
    });
  } catch (error) {
    console.error('Get flagged content error:', error);
    res.status(500).json({
      message: 'Failed to get flagged content',
      error: 'Internal server error'
    });
  }
});

module.exports = router;

