// root/backend/routes/userProfile.js

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userService = require('../services/userService');

// ==============================
// GET /api/profile  -> Get logged-in user's profile
// ==============================
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.UserID);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// ==============================
// PUT /api/profile  -> Update profile
// ==============================
router.put('/', authenticateToken, async (req, res) => {
  try {
    await userService.updateUserProfile(req.user.UserID, req.body);
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

module.exports = router;
