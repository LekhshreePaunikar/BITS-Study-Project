// root/backend/routes/userProfile.js

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userService = require('../services/userService');
const uploadResume = require('../middleware/uploadResume');
const checkLogin = require('../middleware/checkLogin');
const uploadProfileImage = require('../middleware/uploadProfileImage');

// ==============================
// GET /api/profile  -> Get logged-in user's profile
// ==============================
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
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
    await userService.updateUserProfile(req.user.id, req.body);
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Upload / Update Resume
router.post(
  '/resume',
  checkLogin,
  uploadResume.single('resume'),
  async (req, res) => {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ message: 'No resume uploaded' });
      }

      const resumePath = `/static/resumes/${req.file.filename}`;

      await userService.updateResumePath(userId, resumePath);

      res.json({
        message: 'Resume uploaded successfully',
        resume_path: resumePath
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to upload resume' });
    }
  }
);

router.post(
  '/image',
  authenticateToken,
  uploadProfileImage.single('profileImage'),
  async (req, res) => {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
      }

      const imagePath = `/static/profile-images/${req.file.filename}`;

      await userService.updateProfileImage(userId, imagePath);

      res.json({
        message: 'Profile image uploaded successfully',
        profileImage: imagePath
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to upload profile image' });
    }
  }
);


module.exports = router;

