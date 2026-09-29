const multer = require('multer');

/**
 * Multer In-Memory Storage Configuration (Sprint 11 Track B)
 *
 * Keeps uploaded file buffers in memory for direct Cloudinary streaming.
 * Does NOT write raw uploaded files to local disk.
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow common image mime types
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter
});

module.exports = upload;
