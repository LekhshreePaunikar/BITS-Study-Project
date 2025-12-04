// root/backend/routes/adminSupportTickets.js

const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

/**
 * SAFE AUTH WRAPPER
 * Prevents the server from throwing "jwt malformed"
 * when the frontend loads BEFORE a token exists.
 */
const safeAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader === "Bearer null" || authHeader === "Bearer undefined") {
    return res.status(401).json({
      message: "Authentication required",
      error: "Token missing or invalid",
    });
  }

  return authenticateToken(req, res, next);
};

/**
 * ======================
 * GET ALL SUPPORT TICKETS
 * ======================
 * (Only accessible after admin logs in successfully)
 */
router.get("/", safeAuth, requireAdmin, async (req, res) => {
  try {
    const sql = `
      SELECT 
        ticket_id,
        user_id,
        issue_type,
        message,
        status,
        created_at,
        updated_at
      FROM "SupportTicket"
      ORDER BY created_at DESC;
    `;

    const result = await query(sql);
    res.json(result.rows);

  } catch (err) {
    console.error("Error fetching admin support tickets:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * ======================
 * UPDATE TICKET STATUS
 * ======================
 */
router.patch("/:ticketId", safeAuth, requireAdmin, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const valid = ["open", "closed", "in_progress"];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const sql = `
      UPDATE "SupportTicket"
      SET status = $1, updated_at = NOW()
      WHERE ticket_id = $2
      RETURNING ticket_id, status, updated_at
    `;

    const result = await query(sql, [status, ticketId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("Error updating ticket:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
