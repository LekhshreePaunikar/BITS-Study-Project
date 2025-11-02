// root/backend/routes/supportTicket.js

const express = require('express');
const router = express.Router();
const { query } = require('../config/database'); // same pattern as other routes

const { authenticateToken, requireAdmin } = require('../middleware/auth');

const checkLogin = require('../middleware/checkLogin');

// ================================================
// POST /api/support
// Create a new support ticket for logged-in, non-admin, non-blacklisted users
// ================================================
router.post('/', authenticateToken, checkLogin, async (req, res) => {
  try {
    const { issueType, message } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!issueType || !message) {
      return res.status(400).json({
        message: 'Issue type and message are required',
      });
    }

    // Prevent Admins or Blacklisted users from submitting
    if (req.user.is_admin) {
      return res.status(403).json({
        message: 'Admins cannot create support tickets',
      });
    }

    if (req.user.is_blacklisted) {
      return res.status(403).json({
        message: 'Access denied. User is blacklisted',
      });
    }

    // Insert ticket into DB
    const insertQuery = `
      INSERT INTO "SupportTicket" 
        ("UserID", "IssueType", "Message", "Status", "CreatedAt", "UpdatedAt")
      VALUES ($1, $2, $3, 'open', NOW(), NOW())
      RETURNING "TicketID", "UserID", "IssueType", "Message", "Status", "CreatedAt";
    `;
    const result = await query(insertQuery, [userId, issueType, message]);

    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket: result.rows[0],
    });
  } catch (err) {
    console.error('Error creating support ticket:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
});


// ================================================
// POST /api/support/status
// Admin can change the status of the ticket to In-Progress/Closed
// ================================================

router.patch('/:ticketId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    // Validate input
    const validStatuses = ['open', 'in_progress', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value',
        error: `Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    // Update DB
    const updateQuery = `
      UPDATE "SupportTicket"
      SET "Status" = $1, "UpdatedAt" = NOW()
      WHERE "TicketID" = $2
      RETURNING "TicketID", "Status", "UpdatedAt";
    `;
    const result = await query(updateQuery, [status, ticketId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Support ticket not found',
        error: 'No ticket found with the given ID',
      });
    }

    res.status(200).json({
      message: 'Ticket status updated successfully',
      ticket: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating ticket status:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

module.exports = router;