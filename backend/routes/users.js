// root/backend/routes/users.js

const express = require('express');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin, requireOwnershipOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get user profile (public info)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        error: 'User ID must be a number'
      });
    }

    const userResult = await query(
      `SELECT id, username, email, full_name, profile_picture, created_at
       FROM "User" WHERE id = $1 AND is_active = true`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        error: 'User does not exist or is not active'
      });
    }

    const user = userResult.rows[0];

    res.json({
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        education: user.education,
        experience: user.experience,
        preferredRoles: user.preferred_roles,
        preferredLanguages: user.preferred_languages
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      message: 'Failed to get user profile',
      error: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/:id', authenticateToken, requireOwnershipOrAdmin('id'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { username, fullName, email } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        error: 'User ID must be a number'
      });
    }

    // Build update query dynamically
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (username) {
      // Check if username is already taken by another user
      const existingUser = await query(
        'SELECT id FROM "User" WHERE username = $1 AND id != $2',
        [username, userId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          message: 'Username already taken',
          error: 'This username is already in use'
        });
      }

      updateFields.push(`username = $${paramCount++}`);
      values.push(username);
    }

    if (fullName) {
      updateFields.push(`full_name = $${paramCount++}`);
      values.push(fullName);
    }

    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          message: 'Invalid email format',
          error: 'Please provide a valid email address'
        });
      }

      // Check if email is already taken by another user
      const existingEmail = await query(
        'SELECT id FROM "User" WHERE email = $1 AND id != $2',
        [email, userId]
      );

      if (existingEmail.rows.length > 0) {
        return res.status(409).json({
          message: 'Email already taken',
          error: 'This email is already in use'
        });
      }

      updateFields.push(`email = $${paramCount++}`);
      values.push(email);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        message: 'No fields to update',
        error: 'Please provide at least one field to update'
      });
    }

    // Add updated_at field
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const updateQuery = `
      UPDATE "User"
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, username, email, full_name, profile_picture, updated_at
    `;

    const updatedUser = await query(updateQuery, values);

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        error: 'User does not exist'
      });
    }

    const user = updatedUser.rows[0];

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        profilePicture: user.profile_picture,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      error: 'Internal server error'
    });
  }
});

// Change password
router.put('/:id/password', authenticateToken, requireOwnershipOrAdmin('id'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { currentPassword, newPassword } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        error: 'User ID must be a number'
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Missing passwords',
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Password too short',
        error: 'New password must be at least 6 characters long'
      });
    }

    // Get current password hash
    const userResult = await query(
      'SELECT password_hash FROM User WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        error: 'User does not exist'
      });
    }

    const user = userResult.rows[0];

    // If user doesn't have a password (Google OAuth only), skip current password check
    if (user.password_hash) {
      const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password_hash);

      if (!isValidCurrentPassword) {
        return res.status(401).json({
          message: 'Invalid current password',
          error: 'Current password is incorrect'
        });
      }
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      'UPDATE "User" SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Failed to change password',
      error: 'Internal server error'
    });
  }
});

// Get user statistics
router.get('/:id/stats', authenticateToken, requireOwnershipOrAdmin('id'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        error: 'User ID must be a number'
      });
    }

    // Get interview session statistics
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN session_status = 'completed' THEN 1 END) as completed_sessions,
        AVG(CASE WHEN overall_score IS NOT NULL THEN overall_score END) as average_score,
        SUM(CASE WHEN total_duration IS NOT NULL THEN total_duration END) as total_time_seconds
      FROM interview_sessions 
      WHERE user_id = $1
    `, [userId]);

    const stats = statsResult.rows[0];

    // Get recent performance metrics
    const performanceResult = await query(`
      SELECT metric_name, metric_value, metric_date
      FROM user_performance 
      WHERE user_id = $1 
      ORDER BY metric_date DESC 
      LIMIT 10
    `, [userId]);

    // Get question category statistics
    const categoryStatsResult = await query(`
      SELECT 
        q.category,
        COUNT(*) as questions_answered,
        AVG(sq.score) as average_score
      FROM session_questions sq
      JOIN questions q ON sq.question_id = q.id
      JOIN interview_sessions s ON sq.session_id = s.id
      WHERE s.user_id = $1 AND sq.score IS NOT NULL
      GROUP BY q.category
      ORDER BY questions_answered DESC
    `, [userId]);

    res.json({
      stats: {
        totalSessions: parseInt(stats.total_sessions) || 0,
        completedSessions: parseInt(stats.completed_sessions) || 0,
        averageScore: parseFloat(stats.average_score) || 0,
        totalTimeHours: Math.round((parseInt(stats.total_time_seconds) || 0) / 3600 * 10) / 10,
        recentPerformance: performanceResult.rows,
        categoryStats: categoryStatsResult.rows
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      message: 'Failed to get user statistics',
      error: 'Internal server error'
    });
  }
});

// Deactivate user account
router.delete('/:id', authenticateToken, requireOwnershipOrAdmin('id'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        error: 'User ID must be a number'
      });
    }    
    
  
    // Soft delete - deactivate account
    const result = await query(
      'UPDATE "User" SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING username',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        error: 'User does not exist'
      });
    }

    res.json({
      message: 'Account deactivated successfully',
      note: 'Account can be reactivated by contacting support'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      message: 'Failed to deactivate account',
      error: 'Internal server error'
    });
  }
});

// ADD SETUP ROUTE HERE (before module.exports)
router.put('/:id/setup', authenticateToken, requireOwnershipOrAdmin('id'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const {
      fullName,
      email,
      preferredRole,
      skills,
      programmingLanguages,
      experienceLevel,
      education,
      phone_number,
      location,
      hobbies,
      linkedinProfile,
      githubProfile,
      portfolio
    } = req.body;

    await query(`
      UPDATE "User"
      SET 
        name = $1,
        email = $2,
        education = $3,
        experience = $4,
        preferred_roles = $5,
        preferred_languages = $6
      WHERE user_id = $7
    `, [
      fullName,
      email,
      education,
      experienceLevel,
      skills,                 // TEXT[]
      programmingLanguages,   // TEXT[]
      userId
    ]);

    res.json({ message: "Profile setup saved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

module.exports = router;

