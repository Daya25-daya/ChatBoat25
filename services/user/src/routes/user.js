const express = require('express');
const Joi = require('joi');
const UserProfile = require('../models/UserProfile');
const redisClient = require('../config/redis');

const router = express.Router();

// Validation schema
const updateProfileSchema = Joi.object({
  displayName: Joi.string().max(50).optional(),
  avatar: Joi.string().uri().optional(),
  bio: Joi.string().max(500).optional(),
  status: Joi.string().valid('online', 'offline', 'away', 'busy').optional()
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Try cache first
    const cached = await redisClient.get(`profile:${userId}`);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Get from database
    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Cache for 5 minutes
    await redisClient.setEx(`profile:${userId}`, 300, JSON.stringify(profile));

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate input
    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Update profile
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Invalidate cache
    await redisClient.del(`profile:${userId}`);

    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Search users
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    // Search by username or display name
    const users = await UserProfile.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } }
      ]
    })
    .limit(parseInt(limit))
    .select('userId username displayName avatar status');

    res.json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get user by ID
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await UserProfile.findOne({ userId })
      .select('userId username displayName avatar bio status lastSeen');

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user status
router.put('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['online', 'offline', 'away', 'busy'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          status,
          lastSeen: Date.now()
        }
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Invalidate cache
    await redisClient.del(`profile:${userId}`);

    res.json(profile);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
