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
      `SELECT "UserID" FROM "User" WHERE "Email" = $1 OR "Name" = $2`,
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
      `INSERT INTO "User" ("Name", "Email", "Password_Hash", "Is_Admin", "Is_Blacklisted")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING "UserID", "Name", "Email", "Created_At", "Is_Admin"`,
      [username, email, passwordHash, false, false]
    );

    const user = newUser.rows[0];

    // Generate JWT token (include admin flag)
    const token = generateToken(user.UserID, user.Name, user.Email, user.Is_Admin);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.UserID,
        username: user.Name,
        email: user.Email,
        createdAt: user.Created_At,
        isAdmin: user.Is_Admin,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: 'Internal server error',
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
      `SELECT "UserID", "Name", "Email", "Password_Hash", "Is_Admin", "Is_Blacklisted"
       FROM "User"
       WHERE "Email" = $1`,
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
    if (user.Is_Blacklisted) {
      return res.status(403).json({
        message: 'Account disabled',
        error: 'Your account has been blacklisted. Contact support.',
      });
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.Password_Hash);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid credentials',
        error: 'Email or password is incorrect',
      });
    }

    // Generate token with admin flag
    const token = generateToken(user.UserID, user.Name, user.Email, user.Is_Admin);

    res.json({
      message: 'Login successful',
      user: {
        id: user.UserID,
        username: user.Name,
        email: user.Email,
        isAdmin: user.Is_Admin,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: 'Internal server error',
    });
  }
});

// ==============================
// GET CURRENT USER PROFILE
// ==============================
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT "UserID", "Name", "Email", "Created_At", "Is_Admin", "Is_Blacklisted"
       FROM "User"
       WHERE "UserID" = $1`,
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
        id: user.UserID,
        username: user.Name,
        email: user.Email,
        createdAt: user.Created_At,
        isAdmin: user.Is_Admin,
        isBlacklisted: user.Is_Blacklisted,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Failed to get user profile',
      error: 'Internal server error',
    });
  }
});

module.exports = router;
