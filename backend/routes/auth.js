// root/backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const validationUtils = require('../utils/validation');
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
    console.log(
      'REGISTER DB URL:',
      process.env.DATABASE_URL?.slice(0, 40)
    );
    // 1️⃣ Validate input
    const { isValid, errors, sanitized } =
      validationUtils.validateRegistration(req.body);

    if (!isValid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors,
      });
    }

    const { username, email, password } = sanitized;

    // 2️⃣ Check duplicate email
    const existingUser = await query(
      `SELECT user_id FROM "User" WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'User already exists',
      });
    }

    // 3️⃣ Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4️⃣ Insert user (ONLY REQUIRED FIELDS)
    await query(
      `
      INSERT INTO "User"
        (name, email, password_hash, created_at, is_admin, is_blacklisted)
      VALUES
        ($1, $2, $3, NOW(), FALSE, FALSE)
      `,
      [username, email, passwordHash]
    );

    return res.status(201).json({
      message: 'Registration successful',
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      message: 'Registration failed',
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
