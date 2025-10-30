const express = require("express");
const router = express.Router();

// POST route to save interview setup preferences
router.post("/setup-session", async (req, res) => {
  try {
    const { mode, questionSource, level, focusArea, specificTopics, preparationTime } = req.body;

    // For now, just return the received data (you can save it to DB later)
    res.status(200).json({
      message: "Interview setup saved successfully",
      data: { mode, questionSource, level, focusArea, specificTopics, preparationTime }
    });
  } catch (error) {
    console.error("Error saving interview setup:", error);
    res.status(500).json({ error: "Failed to save interview setup" });
  }
});

module.exports = router;
