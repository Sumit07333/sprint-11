const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Helper middleware to check if MongoDB is connected
 */
function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

/**
 * POST /users
 * Simple development/test endpoint to create a user for testing populate()
 */
async function createUser(req, res, next) {
  try {
    const { name, email } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'User name is required' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({
        error: 'Database not connected. Please ensure MONGO_URI is configured in your environment.'
      });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: email && typeof email === 'string' ? email.trim() : ''
    });

    return res.status(201).json(newUser);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
}

/**
 * GET /users
 * Retrieve all users for test verification
 */
async function getAllUsers(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        error: 'Database not connected. Please ensure MONGO_URI is configured in your environment.'
      });
    }

    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createUser,
  getAllUsers
};
