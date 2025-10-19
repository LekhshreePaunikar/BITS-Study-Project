const express = require('express');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { OAuth2Client } = require('google-auth-library');
const { query } = require('../config/database');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.OAUTH_CLIENT_ID);

// User registration
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
      'SELECT id FROM users WHERE email = $1 OR username = $2',
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

    // Create user
    const newUser = await query(
      `INSERT INTO users (username, email, password_hash, full_name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, username, email, full_name, is_admin, created_at`,
      [username, email, passwordHash, fullName || username]
    );

    const user = newUser.rows[0];

    // Generate token
    const token = generateToken(user.id, user.username, user.email, user.is_admin);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        isAdmin: user.is_admin,
        createdAt: user.created_at
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

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Missing credentials',
        error: 'Email and password are required'
      });
    }

    // Find user
    const userResult = await query(
      'SELECT id, username, email, password_hash, full_name, is_admin, is_active FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid credentials',
        error: 'Email or password is incorrect'
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        message: 'Account deactivated',
        error: 'Your account has been deactivated'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid credentials',
        error: 'Email or password is incorrect'
      });
    }

    // Generate token
    const token = generateToken(user.id, user.username, user.email, user.is_admin);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        isAdmin: user.is_admin
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

// Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: 'Missing Google credential',
        error: 'Google credential is required'
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.OAUTH_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user;
    const existingUser = await query(
      'SELECT id, username, email, full_name, is_admin, is_active FROM users WHERE google_id = $1 OR email = $2',
      [googleId, email]
    );

    if (existingUser.rows.length > 0) {
      user = existingUser.rows[0];
      
      if (!user.is_active) {
        return res.status(401).json({
          message: 'Account deactivated',
          error: 'Your account has been deactivated'
        });
      }

      // Update Google ID if not set
      if (!user.google_id) {
        await query(
          'UPDATE users SET google_id = $1, profile_picture = $2 WHERE id = $3',
          [googleId, picture, user.id]
        );
      }
    } else {
      // Create new user
      const username = email.split('@')[0];
      const newUser = await query(
        `INSERT INTO users (username, email, google_id, full_name, profile_picture) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, username, email, full_name, is_admin, created_at`,
        [username, email, googleId, name, picture]
      );
      user = newUser.rows[0];
    }

    // Generate token
    const token = generateToken(user.id, user.username, user.email, user.is_admin);

    res.json({
      message: 'Google login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        isAdmin: user.is_admin
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

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT id, username, email, full_name, profile_picture, is_admin, created_at 
       FROM users WHERE id = $1`,
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
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        profilePicture: user.profile_picture,
        isAdmin: user.is_admin,
        createdAt: user.created_at
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

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Generate new token
    const token = generateToken(req.user.id, req.user.username, req.user.email, req.user.is_admin);

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

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    message: 'Logout successful',
    note: 'Please remove the token from client storage'
  });
});

module.exports = router;