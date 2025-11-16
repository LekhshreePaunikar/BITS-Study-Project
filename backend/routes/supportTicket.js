// root/backend/routes/supportTicket.js

const express = require('express');
const router = express.Router();
const { query } = require('../config/database'); // same pattern as other routes

const { authenticateToken, requireAdmin } = require('../middleware/auth');

const checkLogin = require('../middleware/checkLogin');

console.log('supportTicket.js loaded');
router.get('/test', (req, res) => {
  res.json({ message: 'Support ticket route reached ✅' });
});


// ================================================
// POST /api/support
// Create a new support ticket for logged-in, non-admin, non-blacklisted users
// ================================================

router.post('/', authenticateToken, checkLogin, async (req, res) => {
  try {
    // accept subject + description as requested; keep issueType
    const { subject, issueType, description } = req.body;

    // For now, force UserID = 1
   const userId = req.user.userId || req.user.id; // user id from JWT

    // Basic validation
    const validIssueTypes = ['Login', 'Billing', 'Bug', 'Feature Request', 'Other'];
    if (!subject || !description || !issueType) {
      return res.status(400).json({ message: 'subject, issueType and description are required' });
    }
    if (!validIssueTypes.includes(issueType)) {
      return res.status(400).json({
        message: 'Invalid issueType',
        error: `Allowed: ${validIssueTypes.join(', ')}`
      });
    }

    // Compose Message = subject||description
    const message = `${String(subject).trim()}||${String(description).trim()}`;

    // Insert row with next TicketID, Status=open, timestamps = NOW()
    const insertQuery = `
      INSERT INTO "SupportTicket"
        (user_id, issue_type, message, status, created_at, updated_at)
      VALUES ($1, $2, $3, 'open', NOW(), NOW())
      RETURNING ticket_id, user_id, issue_type, message, status, created_at, updated_at;
    `;
    const result = await query(insertQuery, [userId, issueType, message]);

    return res.status(201).json({
      message: 'Support ticket created successfully',
      ticket: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating support ticket:', err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
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
      SET status = $1, updated_at = NOW()
      WHERE ticket_id = $2
      RETURNING ticket_id, status, updated_at;
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

// ================================================
// GET /api/support
// Fetch all support tickets for the logged-in user
// ================================================
router.get('/', authenticateToken, checkLogin, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id; // handle both user id from JWT
    console.log("Fetching tickets for user:", req.user);

    const fetchQuery = `
      SELECT ticket_id AS "TicketID",
       issue_type AS "IssueType",
       message AS "Message",
       status AS "Status",
       created_at AS "CreatedAt"
FROM "SupportTicket"
WHERE user_id = $1
ORDER BY created_at DESC;
    `;
    const result = await query(fetchQuery, [userId]);

    return res.status(200).json({
      tickets: result.rows
    });
  } catch (err) {
    console.error("Error fetching support tickets:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});


module.exports = router;