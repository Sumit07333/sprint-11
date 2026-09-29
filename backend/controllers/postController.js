const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const { isCloudinaryConfigured, uploadImageBuffer } = require('../config/cloudinary');

/**
 * Helper to check if MongoDB Atlas connection is active
 */
function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

/**
 * GET /posts
 * Retrieve all blog posts from MongoDB Atlas.
 * Populates author information if an authorId reference exists.
 */
async function getAllPosts(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        error: 'Database not connected. Please ensure MONGO_URI is configured in your environment.'
      });
    }

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('authorId', 'name email');

    return res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /posts/recent/top3
 * Retrieve top 3 most recent blog posts sorted by createdAt descending.
 * Populates author information.
 */
async function getTop3RecentPosts(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        error: 'Database not connected. Please ensure MONGO_URI is configured in your environment.'
      });
    }

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('authorId', 'name email');

    return res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /posts/:id
 * Retrieve a single blog post by its MongoDB ObjectId.
 * Validates ObjectId format to prevent unhandled CastErrors.
 */
async function getPostById(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({
        error: 'Database not connected. Please ensure MONGO_URI is configured in your environment.'
      });
    }

    const post = await Post.findById(id).populate('authorId', 'name email');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json(post);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /posts and POST /api/posts
 * Create a new blog post in MongoDB Atlas.
 * Accepts title, content, optional authorId, and optional image (via Multer memoryStorage).
 */
async function createPost(req, res, next) {
  try {
    const { title, content, authorId } = req.body || {};

    if (
      !title ||
      !content ||
      typeof title !== 'string' ||
      typeof content !== 'string' ||
      !title.trim() ||
      !content.trim()
    ) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    let validAuthorId = null;
    if (authorId && typeof authorId === 'string' && authorId.trim()) {
      if (!mongoose.Types.ObjectId.isValid(authorId.trim())) {
        return res.status(400).json({ error: 'Invalid authorId format' });
      }
      validAuthorId = authorId.trim();
    }

    if (!isDbConnected()) {
      return res.status(503).json({
        error: 'Database not connected. Please ensure MONGO_URI is configured in your environment.'
      });
    }

    // Process image upload to Cloudinary if provided
    let imageUrl = null;
    if (req.file) {
      if (!isCloudinaryConfigured()) {
        console.error('❌ [Cloudinary Error]: Cloudinary environment variables are missing.');
        return res.status(500).json({
          error: 'Image upload failed: Cloudinary credentials are not configured on the server.'
        });
      }

      try {
        const uploadResult = await uploadImageBuffer(req.file.buffer);
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('❌ [Cloudinary Upload Error]:', uploadError.message || uploadError);
        return res.status(500).json({
          error: 'Failed to upload image to Cloudinary. Please try again.'
        });
      }
    }

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      authorId: validAuthorId,
      imageUrl: imageUrl || null
    });

    if (validAuthorId) {
      await post.populate('authorId', 'name email');
    }

    return res.status(201).json(post);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
}

/**
 * PUT /posts/:id
 * Update an existing blog post in MongoDB Atlas by ObjectId.
 */
async function updatePost(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }

    const { title, content, authorId } = req.body || {};
    const updateData = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      updateData.title = title.trim();
    }

    if (content !== undefined) {
      if (typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ error: 'Content cannot be empty' });
      }
      updateData.content = content.trim();
    }

    if (authorId !== undefined) {
      if (authorId && !mongoose.Types.ObjectId.isValid(authorId)) {
        return res.status(400).json({ error: 'Invalid authorId format' });
      }
      updateData.authorId = authorId || null;
    }

    if (req.body && req.body.imageUrl !== undefined) {
      updateData.imageUrl = req.body.imageUrl || null;
    }

    if (!isDbConnected()) {
      return res.status(503).json({
        error: 'Database not connected. Please ensure MONGO_URI is configured in your environment.'
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('authorId', 'name email');

    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json(updatedPost);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
}

/**
 * DELETE /posts/:id
 * Delete a blog post from MongoDB Atlas by ObjectId.
 */
async function deletePost(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({
        error: 'Database not connected. Please ensure MONGO_URI is configured in your environment.'
      });
    }

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllPosts,
  getTop3RecentPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
};
