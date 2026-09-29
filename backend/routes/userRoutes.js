const express = require('express');
const router = express.Router();
const { createUser, getAllUsers } = require('../controllers/userController');

// Test endpoints for Sprint 10 Phase 3 User modeling
router.post('/', createUser);
router.get('/', getAllUsers);

module.exports = router;
