const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');

const USER_SERVICE = process.env.USER_SERVICE_URL;
const CHAT_SERVICE = process.env.CHAT_SERVICE_URL;

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get dashboard stats
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE}/admin/stats`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

// Get all users
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE}/admin/users`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

// Ban user
router.post('/users/:userId/ban', authenticateToken, isAdmin, async (req, res) => {
  try {
    const response = await axios.post(
      `${USER_SERVICE}/admin/users/${req.params.userId}/ban`,
      {},
      { headers: { Authorization: req.headers.authorization } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

// Unban user
router.post('/users/:userId/unban', authenticateToken, isAdmin, async (req, res) => {
  try {
    const response = await axios.post(
      `${USER_SERVICE}/admin/users/${req.params.userId}/unban`,
      {},
      { headers: { Authorization: req.headers.authorization } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

// Get recent messages
router.get('/recent-messages', authenticateToken, isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${CHAT_SERVICE}/admin/recent-messages`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

// Search messages
router.get('/search', authenticateToken, isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${CHAT_SERVICE}/admin/search`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

module.exports = router;
