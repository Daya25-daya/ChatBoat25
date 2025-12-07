const express = require('express');
const axios = require('axios');
const router = express.Router();

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL;

// Register
router.post('/register', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE}/register`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE}/login`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE}/refresh`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE}/logout`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

module.exports = router;
