const mongoose = require('mongoose');

/**
 * MongoDB Atlas Connection Module (Sprint 10 Track B)
 * 
 * Securely connects to MongoDB Atlas using the MONGO_URI environment variable.
 * Does not expose credentials, usernames, or passwords in source code or logs.
 */
async function connectDB() {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI || typeof mongoURI !== 'string' || !mongoURI.trim()) {
    console.warn('⚠️  [Database Warning] MONGO_URI environment variable is not defined.');
    console.warn('⚠️  Server starting in offline-DB mode. Set MONGO_URI in .env or deployment settings to connect.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI.trim());
    console.log(`✅ [MongoDB Atlas Connected] Host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ [MongoDB Connection Error]:', error.message);
    return false;
  }
}

module.exports = connectDB;
