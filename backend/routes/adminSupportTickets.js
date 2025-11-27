const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Get ALL user support tickets (admin view)
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
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

// Update ticket status
router.patch("/:ticketId", authenticateToken, requireAdmin, async (req, res) => {
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

    res.json(result.rows[0]);

  } catch (err) {
    console.error("Error updating ticket:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
