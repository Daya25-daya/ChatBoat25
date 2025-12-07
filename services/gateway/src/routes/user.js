const express = require('express');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const USER_SERVICE = process.env.USER_SERVICE_URL;

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE}/profile/${req.user.userId}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const response = await axios.put(
      `${USER_SERVICE}/profile/${req.user.userId}`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

// Search users
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE}/search`, {
      params: req.query
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

// Get user by ID
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE}/users/${req.params.userId}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

module.exports = router;
