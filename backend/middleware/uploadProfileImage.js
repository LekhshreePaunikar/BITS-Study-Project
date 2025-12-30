const multer = require('multer');
const path = require('path');
const fs = require('fs');

const IMAGE_DIR = path.join(__dirname, '..', 'static', 'profile-images');

if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGE_DIR);
  },
  filename: (req, file, cb) => {
    const userId = req.user.id;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `user-${userId}-profile${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only png, jpg, jpeg allowed'), false);
  }
  cb(null, true);
};

module.exports = multer({ storage, fileFilter });
