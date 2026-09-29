require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const requestLogger = require('./middleware/logger');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Initialize MongoDB Atlas connection
connectDB();

// 1. JSON Body Parser Middleware
app.use(express.json());

// 2. Custom Request Logger Middleware
app.use(requestLogger);

// 3. API Discovery & Info Endpoint (Sprint 10 Track B)
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'The Data Hub',
    description: 'RESTful API Server - Sprint 10 Track B (Fullstack Developer)',
    theme: 'NoSQL Cloud Databases & Object Data Modeling (ODM)',
    database: 'MongoDB Atlas (Mongoose ODM)',
    status: 'online',
    endpoints: {
      'GET /posts': 'Retrieve all blog posts (supports populated authorId)',
      'GET /posts/recent/top3': 'Retrieve top 3 most recent posts sorted by createdAt descending',
      'GET /posts/:id': 'Retrieve a specific blog post by MongoDB ObjectId',
      'POST /posts': 'Create a new blog post in MongoDB (accepts title, content, optional authorId)',
      'PUT /posts/:id': 'Update an existing blog post by MongoDB ObjectId',
      'DELETE /posts/:id': 'Delete a blog post by MongoDB ObjectId',
      'POST /users': 'Create a test user for relationship modeling and populate() testing',
      'GET /users': 'List test users in MongoDB',
      'POST /login': 'Mock authentication returning mock JWT'
    }
  });
});

// 4. Mount REST Routes
app.use('/posts', postRoutes);
app.use('/users', userRoutes);

// 5. Mock Login Endpoint (Preserved Sprint 09 Mock Auth)
app.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // NOTE: This is mock authentication scaffolding preserved from Sprint 09.
  return res.status(200).json({
    message: 'Login successful',
    token: 'mock-jwt-token'
  });
});

// 6. 404 Route Not Found Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 7. Global Error Handler Middleware
// Catches unhandled errors and prevents leaking stack traces to clients
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message || err);
  res.status(500).json({ error: 'Internal server error' });
});

// 8. Port Configuration
// Preserves Render dynamic PORT, handles AI Studio container routing (3000),
// and defaults to port 5000 for standard local development.
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
