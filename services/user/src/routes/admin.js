const express = require('express');
const router = express.Router();
const axios = require('axios');

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get dashboard stats
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get active users (online in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      lastActive: { $gte: fiveMinutesAgo }
    });
    
    // Get total messages from chat service
    let totalMessages = 0;
    let messagesPerHour = 0;
    try {
      const chatServiceUrl = process.env.CHAT_SERVICE_URL || 'http://localhost:4003';
      const messagesResponse = await axios.get(`${chatServiceUrl}/admin/message-count`);
      totalMessages = messagesResponse.data.total || 0;
      messagesPerHour = messagesResponse.data.perHour || 0;
    } catch (error) {
      console.error('Error fetching message stats:', error.message);
    }
    
    res.json({
      totalUsers,
      activeUsers,
      totalMessages,
      messagesPerHour
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', isAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find()
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ban user
router.post('/users/:userId/ban', isAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        banned: true,
        bannedAt: new Date(),
        bannedBy: req.user.userId
      },
      { new: true }
    ).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unban user
router.post('/users/:userId/unban', isAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        banned: false,
        bannedAt: null,
        bannedBy: null
      },
      { new: true }
    ).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
