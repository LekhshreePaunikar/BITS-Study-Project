const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const uploadProfileImage = require('../middleware/uploadProfileImage');

// GET admin profile
// GET admin profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Admin access only" });
    }

    const result = await query(
      `
      SELECT user_id, name, email, profile_image
      FROM "User"
      WHERE user_id = $1
      `,
      [req.user.id]
    );

    // IMPORTANT FIX
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Admin profile not found"
      });
    }

    // Always return JSON
    return res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error("Error fetching admin profile:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});


// UPDATE admin profile
router.put("/profile", authenticateToken, async (req, res) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Admin access only" });
  }

  const { name, email, profile_image } = req.body;

  await query(
    `
    UPDATE "User"
    SET name = $1, email = $2,  updated_at = NOW()
    WHERE user_id = $3
    `,
    [name, email, profile_image || null, req.user.id]
  );

  res.json({ success: true });
});

const upload = require("../middleware/uploadProfileImage");

/**
 * UPLOAD admin profile photo
 * POST /api/admin/profile/photo
 */
router.post(
  "/profile/photo",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access only" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const imageUrl = `/static/profile-images/${req.file.filename}`;

      await query(
        `
        UPDATE "User"
        SET profile_image = $1, updated_at = NOW()
        WHERE user_id = $2
        `,
        [imageUrl, req.user.id]
      );

      res.status(200).json({
        success: true,
        profile_image: imageUrl,
      });
    } catch (err) {
      console.error("Profile image upload failed:", err);
      res.status(500).json({ error: "Failed to upload profile image" });
    }
  }
);


module.exports = router;
