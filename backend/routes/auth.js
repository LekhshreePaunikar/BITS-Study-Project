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
    const { username, email, password, fullName } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'Username, email, and password are required'
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email format',
        error: 'Please provide a valid email address'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password too short',
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT "UserID" FROM "User" WHERE "Email" = $1 OR "Name" = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'User already exists',
        error: 'Email or username is already taken'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await query(
      `INSERT INTO "User" ("Name", "Email", "PasswordHash") 
       VALUES ($1, $2, $3)
       RETURNING "UserID", "Name", "Email", "IsAdmin", "CreatedAt"`,
      [username, email, passwordHash]
    );

    const user = newUser.rows[0];

    // Generate JWT token
    const token = generateToken(
      user.UserID,
      user.Name,
      user.Email,
      user.IsAdmin
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.UserID,
        username: user.Name,
        email: user.Email,
        isAdmin: user.IsAdmin,
        createdAt: user.CreatedAt
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: 'Internal server error'
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
        error: 'Email and password are required'
      });
    }

    // Find user
    const userResult = await query(
      `SELECT 
         "UserID", "Name", "Email", "PasswordHash", 
         "IsAdmin", "IsBlacklisted"
       FROM "User" 
       WHERE "Email" = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid credentials',
        error: 'Email or password is incorrect'
      });
    }

    const user = userResult.rows[0];

    if (user.IsBlacklisted) {
      return res.status(403).json({
        message: 'Account deactivated',
        error: 'Your account has been deactivated'
      });
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.PasswordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid credentials',
        error: 'Email or password is incorrect'
      });
    }

    // Generate token
    const token = generateToken(
      user.UserID,
      user.Name,
      user.Email,
      user.IsAdmin
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.UserID,
        username: user.Name,
        email: user.Email,
        isAdmin: user.IsAdmin
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: 'Internal server error'
    });
  }
});

// ==============================
// GOOGLE OAUTH LOGIN
// ==============================
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({
        message: 'Missing Google credential',
        error: 'Google credential is required'
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.OAUTH_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check or create user
    let user;
    const existingUser = await query(
      'SELECT "UserID", "Name", "Email", "IsAdmin", "IsBlacklisted" FROM "User" WHERE "Email" = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      user = existingUser.rows[0];
      if (user.IsBlacklisted) {
        return res.status(403).json({
          message: 'Account deactivated',
          error: 'Your account has been deactivated'
        });
      }
    } else {
      const newUser = await query(
        `INSERT INTO "User" ("Name", "Email") 
         VALUES ($1, $2)
         RETURNING "UserID", "Name", "Email", "IsAdmin"`,
        [name || email.split('@')[0], email]
      );
      user = newUser.rows[0];
    }

    const token = generateToken(
      user.UserID,
      user.Name,
      user.Email,
      user.IsAdmin
    );

    res.json({
      message: 'Google login successful',
      user: {
        id: user.UserID,
        username: user.Name,
        email: user.Email,
        isAdmin: user.IsAdmin
      },
      token
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      message: 'Google login failed',
      error: 'Internal server error'
    });
  }
});

// ==============================
// GET CURRENT USER PROFILE
// ==============================
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT "UserID", "Name", "Email", "IsAdmin", "CreatedAt"
       FROM "User" WHERE "UserID" = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        error: 'User profile not found'
      });
    }

    const user = userResult.rows[0];

    res.json({
      user: {
        id: user.UserID,
        username: user.Name,
        email: user.Email,
        isAdmin: user.IsAdmin,
        createdAt: user.CreatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Failed to get user profile',
      error: 'Internal server error'
    });
  }
});

// ==============================
// REFRESH TOKEN
// ==============================
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const token = generateToken(
      req.user.id,
      req.user.username,
      req.user.email,
      req.user.is_admin
    );

    res.json({
      message: 'Token refreshed successfully',
      token
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      message: 'Token refresh failed',
      error: 'Internal server error'
    });
  }
});

// ==============================
// LOGOUT (Client-Side Token Removal)
// ==============================
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    message: 'Logout successful',
    note: 'Please remove the token from client storage'
  });
});

module.exports = router;
