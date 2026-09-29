const mongoose = require('mongoose');

/**
 * User Schema (Sprint 10 Track B - Phase 3)
 * 
 * Used for object data modeling and relationship referencing with posts.
 * Mock authentication in server.js remains separate from this model.
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
