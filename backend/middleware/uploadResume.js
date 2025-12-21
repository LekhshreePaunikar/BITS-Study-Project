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
    const userId = req.user.id;
    const ext = path.extname(file.originalname).toLowerCase();

    // Always overwrite with same name
    const filename = `user-${userId}-resume${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Only PDF files are allowed'), false);
  }
  cb(null, true);
};

const uploadResume = multer({
  storage,
  fileFilter
});

module.exports = uploadResume;
