const cloudinary = require('cloudinary').v2;

/**
 * Cloudinary Configuration Module (Sprint 11 Track B)
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload an in-memory image buffer to Cloudinary.
 * Only the Cloudinary URL is stored in MongoDB.
 */
function uploadImageBuffer(buffer, folder = 'posts') {
  return new Promise((resolve, reject) => {
    if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
      return reject(new Error('Invalid or empty image buffer supplied for upload.'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result || !result.secure_url) {
          return reject(new Error('Cloudinary did not return a secure image URL.'));
        }

        resolve(result);
      }
    );

    uploadStream.on('error', reject);
    uploadStream.end(buffer);
  });
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadImageBuffer
};