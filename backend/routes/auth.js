// root/backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { OAuth2Client } = require('google-auth-library');
const { query } = require('../config/database');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.OAUTH_CLIENT_ID);

// ==============================
// USER REGISTRATION
// ==============================
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'Username, email, and password are required',
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email format',
        error: 'Please provide a valid email address',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password too short',
        error: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const existingUser = await query(
      `SELECT user_id FROM "User" WHERE email = $1 OR name = $2`,
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'User already exists',
        error: 'Email or username is already taken',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new normal user (non-admin by default)
    const newUser = await query(
      `INSERT INTO "User" (name, email, password_hash, is_admin, is_blacklisted)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, name, email, created_at, is_admin`,
      [username, email, passwordHash, false, false]
    );

    const user = newUser.rows[0];

    // Generate JWT token (include admin flag)
    const token = generateToken(user.user_id, user.name, user.email, user.is_admin);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.user_id,
        username: user.name,
        email: user.email,
        createdAt: user.created_at,
        isAdmin: user.is_admin,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: error.message,
      stack: error.stack,
    });

  }
});

// ==============================
// USER LOGIN
// ==============================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Missing credentials',
        error: 'Email and password are required',
      });
    }

    // Fetch user by email
    const userResult = await query(
      `SELECT user_id, name, email, password_hash, is_admin, is_blacklisted
       FROM "User"
       WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid credentials',
        error: 'Email or password is incorrect',
      });
    }

    const user = userResult.rows[0];

    // Block blacklisted users
    if (user.is_blacklisted) {
      return res.status(403).json({
        message: 'Account disabled',
        error: 'Your account has been blacklisted. Contact support.',
      });
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid credentials',
        error: 'Email or password is incorrect',
      });
    }

    // Generate token with admin flag
    const token = generateToken(user.user_id, user.name, user.email, user.is_admin);

    res.json({
      message: 'Login successful',
      user: {
        id: user.user_id,
        username: user.name,
        email: user.email,
        isAdmin: user.is_admin,
        isBlacklisted: user.is_blacklisted,
      },
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: error.message,
    });
  }
});

// ==============================
// GET CURRENT USER PROFILE
// ==============================
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT user_id, name, email, created_at, is_admin, is_blacklisted
       FROM "User"
       WHERE user_id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        error: 'User profile not found',
      });
    }

    const user = userResult.rows[0];

    res.json({
      user: {
        id: user.user_id,
        username: user.name,
        email: user.email,
        createdAt: user.created_at,
        isAdmin: user.is_admin,
        isBlacklisted: user.is_blacklisted,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Failed to get user profile',
      error: error.message,
    });
  }
});

module.exports = router;
