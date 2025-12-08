const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get message count and stats
router.get('/message-count', async (req, res) => {
  try {
    // Total messages
    const total = await Message.countDocuments();
    
    // Messages in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last24Hours = await Message.countDocuments({
      createdAt: { $gte: oneDayAgo }
    });
    
    // Messages per hour
    const perHour = Math.round(last24Hours / 24);
    
    res.json({
      total,
      last24Hours,
      perHour
    });
  } catch (error) {
    console.error('Error getting message count:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recent messages
router.get('/recent-messages', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('senderId content type createdAt conversationId');
    
    res.json(messages);
  } catch (error) {
    console.error('Error getting recent messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search messages
router.get('/search', async (req, res) => {
  try {
    const { query, conversationId, sender, dateFrom, dateTo, type } = req.query;
    
    const filter = {};
    
    // Conversation filter
    if (conversationId) {
      filter.conversationId = conversationId;
    }
    
    // Text search
    if (query) {
      filter.$text = { $search: query };
    }
    
    // Sender filter
    if (sender) {
      filter.senderId = sender;
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    
    // Type filter
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(messages);
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
