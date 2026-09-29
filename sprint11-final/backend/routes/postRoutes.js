const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getTop3RecentPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} = require('../controllers/postController');

// Standard REST endpoints for Blog Posts (Sprint 10 Track B)

// 1. GET /posts - Retrieve all posts
router.get('/', getAllPosts);

// 2. GET /posts/recent/top3 - Retrieve top 3 most recent posts
// CRITICAL: Registered BEFORE /:id to prevent route shadowing
router.get('/recent/top3', getTop3RecentPosts);

// 3. GET /posts/:id - Retrieve a post by MongoDB ObjectId
router.get('/:id', getPostById);

// 4. POST /posts - Create a new post in MongoDB
router.post('/', createPost);

// 5. PUT /posts/:id - Update an existing post by ObjectId
router.put('/:id', updatePost);

// 6. DELETE /posts/:id - Delete a post by ObjectId
router.delete('/:id', deletePost);

module.exports = router;
