// backend/middleware/uploadResume.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const RESUME_DIR = path.join(__dirname, '..', 'static', 'resumes');

// Ensure directory exists
if (!fs.existsSync(RESUME_DIR)) {
  fs.mkdirSync(RESUME_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, RESUME_DIR);
  },

  filename: (req, file, cb) => {
    const userId = req.user.id || req.user.userId;

    // Always overwrite with same name
    const filename = `user-${userId}-resume.pdf`;
    cb(null, filename);
  }
});

const uploadResume = multer({ storage });


module.exports = uploadResume;
