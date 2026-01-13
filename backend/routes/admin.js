// root/backend/routes/admin.js

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
        COUNT(CASE WHEN is_blacklisted = false THEN 1 END) as active_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_30d
      FROM "User"
    `);

    // Get session statistics
    const sessionStatsResult = await query(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN end_time IS NOT NULL THEN 1 END) as completed_sessions,
        COUNT(CASE WHEN start_time >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as sessions_7d,
        AVG(CASE WHEN total_score IS NOT NULL THEN total_score END) as avg_score
      FROM "Session"
    `);

    // Get question statistics
    const questionStatsResult = await query(`
      SELECT 
        COUNT(*) as total_questions,
        COUNT(CASE WHEN is_predefined = true THEN 1 END) as predefined_questions,
        COUNT(DISTINCT difficulty) as difficulty_levels
      FROM "BaseQuestion"
    `);

    // Get recent activity (sessions in last 24 hours)
    const recentActivityResult = await query(`
      SELECT 
        'session' as activity_type,
        u.name as username,
        s.start_time as activity_time,
        json_build_object(
          'sessionId', s.session_id,
          'mode', s.interview_mode,
          'score', s.total_score
        ) as activity_data
      FROM "Session" s
      JOIN "User" u ON s.user_id = u.user_id
      WHERE s.start_time >= CURRENT_DATE - INTERVAL '24 hours'
      ORDER BY s.start_time DESC
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
          predefinedQuestions: parseInt(questionStats.predefined_questions),
          difficultyLevels: parseInt(questionStats.difficulty_levels)
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

    let whereClause = 'WHERE u.is_admin = false';
    let params = [];
    let paramCount = 1;

    if (search) {
      whereClause += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR CONCAT('USER', LPAD(u.user_id::text, 4, '0')) ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (active !== undefined && active !== 'all') {
      const isBlacklisted = active === 'false' || active === 'inactive';
      whereClause += ` AND u.is_blacklisted = $${paramCount}`;
      params.push(isBlacklisted);
      paramCount++;
    }

    params.push(limit, offset);

    const usersResult = await query(`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.is_admin,
        u.is_blacklisted,
        u.created_at,
        u.profile_image,
        u.preferred_roles,
        u.updated_at as last_login,
        COUNT(DISTINCT s.session_id) as session_count,
        COALESCE(AVG(s.total_score), 0) as avg_score,
        CASE 
          WHEN u.university IS NOT NULL AND u.graduation_year IS NOT NULL 
            AND u.skills IS NOT NULL AND array_length(u.skills, 1) > 0 
          THEN 100
          WHEN u.university IS NOT NULL OR u.graduation_year IS NOT NULL 
          THEN 50
          ELSE 0
        END as profile_completion_percentage
      FROM "User" u
      LEFT JOIN "Session" s ON u.user_id = s.user_id
      ${whereClause}
      GROUP BY u.user_id
      ORDER BY u.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, params);

    const countResult = await query(`
      SELECT COUNT(*) as total FROM "User" u ${whereClause}
    `, params.slice(0, -2));

    const totalUsers = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users: usersResult.rows.map(user => ({
        id: user.user_id,
        displayId: `USER${String(user.user_id).padStart(4, '0')}`,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin,
        isBlacklisted: user.is_blacklisted,
        status: user.is_blacklisted ? 'Inactive' : 'Active',
        createdAt: user.created_at,
        lastLogin: user.last_login,
        role: user.preferred_roles || 'Not Specified',
        profileImage: user.profile_image,
        profileCompletion: {
          percentage: parseInt(user.profile_completion_percentage),
          status: parseInt(user.profile_completion_percentage) >= 100 ? 'Complete' : 'Incomplete'
        },
        sessionCount: parseInt(user.session_count) || 0,
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

// Toggle user blacklist status (replaces toggle-status)
router.put('/users/:userId/toggle-status', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        error: 'User ID must be a number'
      });
    }

    // Don't allow admin to blacklist themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        message: 'Cannot modify own status',
        error: 'Administrators cannot blacklist their own accounts'
      });
    }

    const result = await query(`
      UPDATE "User"
      SET is_blacklisted = NOT is_blacklisted, updated_at = NOW()
      WHERE user_id = $1 
      RETURNING user_id, name, is_blacklisted
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        error: 'User does not exist'
      });
    }

    const user = result.rows[0];

    res.json({
      message: `User ${user.is_blacklisted ? 'blacklisted' : 'activated'} successfully`,
      user: {
        id: user.user_id,
        name: user.name,
        isBlacklisted: user.is_blacklisted
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
        DATE(start_time) as date,
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN end_time IS NOT NULL THEN 1 END) as completed_sessions,
        AVG(CASE WHEN total_score IS NOT NULL THEN total_score END) as avg_score
      FROM "Session"
      WHERE start_time >= CURRENT_DATE - ${intervalClause}
      GROUP BY DATE(start_time)
      ORDER BY date DESC
    `);

    // User registration analytics
    const userAnalyticsResult = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM "User"
      WHERE created_at >= CURRENT_DATE - ${intervalClause}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Question difficulty distribution
    const difficultyDistributionResult = await query(`
      SELECT 
        difficulty,
        COUNT(*) as question_count
      FROM "BaseQuestion"
      GROUP BY difficulty
      ORDER BY question_count DESC
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
        difficultyDistribution: difficultyDistributionResult.rows.map(row => ({
          difficulty: row.difficulty,
          count: parseInt(row.question_count)
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

// View specific user details (personal, professional, performance)
router.get('/view_user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        error: 'User ID must be a number'
      });
    }

    // Get user personal and professional details (NO PASSWORD)
    const userResult = await query(`
      SELECT 
        user_id,
        name,
        gender,
        email,
        profile_image,
        university,
        graduation_year,
        phone_number,
        education,
        experience,
        preferred_roles,
        skills,
        programming_languages,
        location,
        hobbies,
        linkedin_profile,
        github_profile,
        portfolio,
        is_admin,
        is_blacklisted,
        created_at
      FROM "User"
      WHERE user_id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        error: 'User does not exist'
      });
    }

    const user = userResult.rows[0];

    // Get performance statistics
    const performanceResult = await query(`
      SELECT 
        COUNT(*) as total_attempts,
        AVG(total_score) as average_score,
        MAX(total_score) as best_score,
        MIN(total_score) as lowest_score
      FROM "Session"
      WHERE user_id = $1 AND total_score IS NOT NULL
    `, [userId]);

    const performance = performanceResult.rows[0];

    res.json({
      personal: {
        userId: user.user_id,
        name: user.name,
        gender: user.gender,
        email: user.email,
        profileImage: user.profile_image,
        phoneNumber: user.phone_number,
        location: user.location,
        hobbies: user.hobbies,
        createdAt: user.created_at,
        isAdmin: user.is_admin,
        isBlacklisted: user.is_blacklisted
      },
      professional: {
        university: user.university,
        graduationYear: user.graduation_year,
        education: user.education,
        experience: user.experience,
        preferredRoles: user.preferred_roles,
        skills: user.skills,
        programmingLanguages: user.programming_languages,
        linkedinProfile: user.linkedin_profile,
        githubProfile: user.github_profile,
        portfolio: user.portfolio
      },
      performance: {
        totalAttempts: parseInt(performance.total_attempts) || 0,
        averageScore: parseFloat(performance.average_score) || 0,
        bestScore: parseFloat(performance.best_score) || 0,
        lowestScore: parseFloat(performance.lowest_score) || 0
      }
    });
  } catch (error) {
    console.error('View user error:', error);
    res.status(500).json({
      message: 'Failed to get user details',
      error: 'Internal server error'
    });
  }
});

// Blacklist/Un-blacklist user
router.put('/blacklist_user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { blacklist } = req.body; // true to blacklist, false to un-blacklist

    if (isNaN(userId)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        error: 'User ID must be a number'
      });
    }

    if (typeof blacklist !== 'boolean') {
      return res.status(400).json({
        message: 'Invalid blacklist value',
        error: 'Blacklist must be true or false'
      });
    }

    // Don't allow admin to blacklist themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        message: 'Cannot modify own status',
        error: 'Administrators cannot blacklist their own accounts'
      });
    }

    const result = await query(`
      UPDATE "User"
      SET is_blacklisted = $1, updated_at = NOW()
      WHERE user_id = $2
      RETURNING user_id, name, is_blacklisted
    `, [blacklist, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        error: 'User does not exist'
      });
    }

    const user = result.rows[0];

    res.json({
      message: `User ${blacklist ? 'blacklisted' : 'un-blacklisted'} successfully`,
      user: {
        userId: user.user_id,
        name: user.name,
        isBlacklisted: user.is_blacklisted
      }
    });
  } catch (error) {
    console.error('Blacklist user error:', error);
    res.status(500).json({
      message: 'Failed to update blacklist status',
      error: 'Internal server error'
    });
  }
});

module.exports = router;