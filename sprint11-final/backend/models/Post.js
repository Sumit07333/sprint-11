const mongoose = require('mongoose');

/**
 * Post Schema (Sprint 10 Track B - Phases 1 & 3)
 * 
 * Persistent blog post model backed by MongoDB Atlas.
 * Includes relationship referencing to the User model via authorId.
 */
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
