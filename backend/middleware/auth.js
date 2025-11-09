// root/backend/middleware/auth.js

const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// ==============================
// Middleware to verify JWT token
// ==============================
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      message: 'Access token required',
      error: 'No token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate user exists and is active
    const userResult = await query(
      `SELECT user_id, name, email, is_admin, is_blacklisted
       FROM "User"
       WHERE user_id = $1`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        message: 'User not found',
        error: 'Invalid token',
      });
    }

    const user = userResult.rows[0];

    // If user is blacklisted, block access
    if (user.is_blacklisted) {
      return res.status(401).json({
        message: 'Account is deactivated',
        error: 'User account is not active',
      });
    }

    req.user = {
      id: user.user_id,
      username: user.name,
      email: user.email,
      isAdmin: user.is_admin,
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired',
        error: 'Please log in again',
      });
    }

    return res.status(403).json({
      message: 'Invalid token',
      error: 'Token verification failed',
    });
  }
};

// ==============================
// Middleware to verify admin privileges
// ==============================
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required',
      error: 'User not authenticated',
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      message: 'Admin access required',
      error: 'Insufficient permissions',
    });
  }

  next();
};

// ==============================
// Middleware to check user ownership or admin
// ==============================
const requireOwnershipOrAdmin = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required',
        error: 'User not authenticated',
      });
    }

    // Admin can access any resource
    if (req.user.isAdmin) {
      return next();
    }

    // Check ownership
    const resourceUserId =
      req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (parseInt(resourceUserId) !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied',
        error: 'You can only access your own resources',
      });
    }

    next();
  };
};

// ==============================
// JWT Token Generator
// ==============================
const generateToken = (userId, username, email, isAdmin = false) => {
  const payload = {
    userId,
    username,
    email,
    isAdmin,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ==============================
// Optional Authentication
// ==============================
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await query(
      `SELECT user_id, name, email, is_admin, is_blacklisted
       FROM "User"
       WHERE user_id = $1`,
      [decoded.userId]
    );

    if (userResult.rows.length > 0 && !userResult.rows[0].is_blacklisted) {
      req.user = userResult.rows[0];
    } else {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
  generateToken,
  optionalAuth,
};
