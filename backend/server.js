require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const requestLogger = require('./middleware/logger');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Initialize MongoDB Atlas connection
connectDB();

// 1. CORS Configuration (Sprint 11 Track B)
// Uses process.env.CLIENT_URL to support Vercel deployed frontend & local Vite dev
const clientURL = process.env.CLIENT_URL;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, server-to-server, curl)
    if (!origin) return callback(null, true);

    if (clientURL) {
      const normalizedClient = clientURL.replace(/\/+$/, '');
      if (origin === normalizedClient || origin === clientURL) {
        return callback(null, true);
      }
    }

    // In local development or testing, permit localhost and common dev origins
    const localDevOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];

    if (localDevOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// 2. JSON Body Parser Middleware
app.use(express.json());

// 3. Custom Request Logger Middleware
app.use(requestLogger);

// 4. API Discovery & Info Endpoint (Sprint 10 & 11 Track B)
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'The Data Hub',
    description: 'RESTful API Server - Sprint 10 & 11 Track B (Fullstack Developer)',
    theme: 'NoSQL Cloud Databases, Object Data Modeling (ODM) & Cloudinary Upload',
    database: 'MongoDB Atlas (Mongoose ODM)',
    status: 'online',
    endpoints: {
      'GET /api/posts (and /posts)': 'Retrieve all blog posts with populated authorId and imageUrl',
      'GET /api/posts/recent/top3 (and /posts/recent/top3)': 'Retrieve top 3 most recent posts sorted by createdAt descending',
      'GET /api/posts/:id (and /posts/:id)': 'Retrieve a specific blog post by MongoDB ObjectId',
      'POST /api/posts (and /posts)': 'Create a new blog post in MongoDB (accepts title, content, optional authorId, optional multipart image)',
      'PUT /api/posts/:id (and /posts/:id)': 'Update an existing blog post by MongoDB ObjectId',
      'DELETE /api/posts/:id (and /posts/:id)': 'Delete a blog post by MongoDB ObjectId',
      'POST /api/users (and /users)': 'Create a test user for relationship modeling',
      'GET /api/users (and /users)': 'List test users in MongoDB',
      'POST /api/login (and /login)': 'Mock authentication returning mock JWT'
    }
  });
});

// 5. Mount REST Routes (Preserving Sprint 10 routes and exposing Sprint 11 /api routes)
app.use('/posts', postRoutes);
app.use('/api/posts', postRoutes);

app.use('/users', userRoutes);
app.use('/api/users', userRoutes);

// 6. Mock Login Endpoint (Preserved Sprint 09/10 Mock Auth & Sprint 11 /api/login)
const handleLogin = (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  return res.status(200).json({
    message: 'Login successful',
    token: 'mock-jwt-token'
  });
};

app.post('/login', handleLogin);
app.post('/api/login', handleLogin);

// 7. 404 Route Not Found Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 8. Global Error Handler Middleware
// Catches unhandled errors and prevents leaking stack traces to clients
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message || err);
  res.status(500).json({ error: 'Internal server error' });
});

// 9. Port Configuration
// Preserves Render dynamic PORT, handles AI Studio container routing (3000),
// and defaults to port 5000 for standard local development.
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
