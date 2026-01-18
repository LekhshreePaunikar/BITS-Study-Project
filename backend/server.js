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


// Route modules (KEEPING ALL YOU MENTIONED)
const interviewSetupRoutes = require('./routes/interviewSetup');
const userProfileRoutes = require('./routes/userProfile');
const adminKpisRoutes = require('./routes/adminKpis');
const performanceReportRoutes = require('./routes/performanceReport');
const performanceRoutes = require('./routes/performance');

// Load environment variables
require('dotenv').config();

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
  origin: [process.env.FRONTEND_URL, process.env.VITE_API_URL],
  credentials: true
}));

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// static files
// backend/server.js

// Ensure this points correctly to the root 'static' folder
// backend/server.js

app.use("/static", express.static(path.join(__dirname, "static")));
// Handle profile photo
app.use(
  "/static/profile-images",
  express.static(path.join(__dirname, "static/profile-images"))
);
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
app.use('/api/support', require('./routes/supportTicket'));
app.use('/api/questions', require('./routes/questions'));


// ADMIN ROUTES
app.use('/api/admin/support-tickets', require('./routes/adminSupportTickets'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin', require('./routes/adminProfile'));
app.use('/api/admin', adminKpisRoutes);

// PROTECTED USER ROUTES
app.use('/api/user', authenticateToken, checkLogin, require('./routes/userKpis'));
app.use('/api/user', authenticateToken, checkLogin, require('./routes/userProfile'));
app.use('/api/interview', authenticateToken, checkLogin, require('./routes/interviewSetup'));
app.use('/api/sessions', authenticateToken, checkLogin, require('./routes/sessions'));

app.use("/api/performance", require("./routes/performance"));
app.use('/api/past-sessions', authenticateToken, checkLogin, require('./routes/pastSessions'));
app.use('/api/performance-report', authenticateToken, checkLogin, performanceReportRoutes);

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

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'API endpoint not found'
  });
});

// ==============================
// Serve React SPA (PRODUCTION ONLY)
// ==============================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==============================
// Server Start
// ==============================
app.listen(PORT, () => {
  console.log('-----------------------------------');
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  if (!process.env.FRONTEND_URL) {
    console.warn('⚠️ FRONTEND_URL is not set');
  } else {
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  }

  console.log(`Database URL present: ${!!process.env.DATABASE_URL}`);
  console.log('-----------------------------------');
});




// // ==============================
// // Error Handling
// // ==============================

// app.use((req, res, next) => {
//   if (!req.originalUrl.startsWith("/static")) {
//     console.log("Unmatched route:", req.method, req.originalUrl);
//   }
//   next();
// });



module.exports = app;
