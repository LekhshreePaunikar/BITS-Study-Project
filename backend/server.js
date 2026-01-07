// root/backend/server.js

// ==============================
// Server Setup for AI Mock Interview Platform
// ==============================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const interviewSetupRoutes = require("./routes/interviewSetup");
const userProfileRoutes = require('./routes/userProfile');


// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });



// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// ==============================
// Security & Middleware
// ==============================

// Basic security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Rate limiting (max 100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// static files
// backend/server.js

// Ensure this points correctly to the root 'static' folder
// backend/server.js

// Ab ye backend ke andar waale static folder ko point karega
app.use("/static", express.static(path.join(__dirname, "static")));


// ==============================
// Routes
// ==============================

// Import database helper
const { query } = require('./config/database');
const { authenticateToken } = require('./middleware/auth');
const checkLogin = require('./middleware/checkLogin');

// ==============================
// Register modular routes
// ==============================

// PUBLIC ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/support', require('./routes/supportTicket')); // user creates tickets
app.use('/api/questions', require('./routes/questions'));

// ADMIN ROUTES
app.use('/api/admin/support-tickets', require('./routes/adminSupportTickets')); // specific first
app.use('/api/admin', require('./routes/admin')); // general admin routes
app.use("/api/admin", require("./routes/adminProfile"));

// PROTECTED USER ROUTES
app.use('/api/user', authenticateToken, checkLogin, require('./routes/userProfile'));
app.use('/api/interview', authenticateToken, checkLogin, require('./routes/interviewSetup'));
app.use('/api/sessions', authenticateToken, checkLogin, require('./routes/sessions'));





// ==============================
// Test & Health Routes
// ==============================

// Database connection test route
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await query('SELECT NOW() AS current_time');
    res.json({
      message: 'Database connection successful!',
      server_time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({ error: 'Database test failed' });
  }
});

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ==============================
// Error Handling
// ==============================


app.use((req, res, next) => {
  // Ignore logging for static files and successful route hits
  if (!res.headersSent && !req.originalUrl.startsWith("/static")) {
    console.log("404 - Unmatched route:", req.method, req.originalUrl);
  }
  next();
});

app.use((req, res, next) => {
  if (!req.originalUrl.startsWith("/static")) {
    console.log("Unmatched route:", req.method, req.originalUrl);
  }
  next();
});

// Handle profile photo
app.use(
  "/static/profile-images",
  express.static(path.join(__dirname, "static/profile-images"))
);

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
// app.use('/api/profile', userProfileRoutes);
// ==============================
// Server Start
// ==============================
app.listen(PORT, () => {
  console.log('-----------------------------------');
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`Database: ${process.env.POSTGRES_DB}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}`);
  console.log('-----------------------------------');
});

module.exports = app;
