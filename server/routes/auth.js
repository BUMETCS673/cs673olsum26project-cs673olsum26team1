const express = require('express');
const router = express.Router();

// POST /api/auth/register
// Register a new patient account
router.post('/register', async (req, res) => {
  try {
    res.json({ message: 'Register route working' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
// Login and return user role
router.post('/login', async (req, res) => {
  try {
    res.json({ message: 'Login route working' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me
// Get current user role
router.get('/me', async (req, res) => {
  try {
    res.json({ message: 'Me route working' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;