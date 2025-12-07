const express = require('express');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const CHAT_SERVICE = process.env.CHAT_SERVICE_URL;

// Get conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${CHAT_SERVICE}/conversations/${req.user.userId}`);
    const conversations = response.data;
    
    // Enrich conversations with user details
    const USER_SERVICE = process.env.USER_SERVICE_URL;
    const enrichedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        try {
          // Get the other participant's ID
          const otherUserId = conversation.participants.find(p => p !== req.user.userId);
          
          if (otherUserId) {
            // Fetch user details
            const userResponse = await axios.get(`${USER_SERVICE}/profile/${otherUserId}`);
            conversation.otherUser = {
              userId: otherUserId,
              username: userResponse.data.username,
              email: userResponse.data.email
            };
          }
        } catch (error) {
          console.error('Error fetching user details:', error.message);
          // If user fetch fails, use fallback
          const otherUserId = conversation.participants.find(p => p !== req.user.userId);
          conversation.otherUser = {
            userId: otherUserId,
            username: `User ${otherUserId?.substring(0, 8)}`,
            email: ''
          };
        }
        return conversation;
      })
    );
    
    res.json(enrichedConversations);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

// Get messages for a conversation
router.get('/messages/:conversationId', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(
      `${CHAT_SERVICE}/messages/${req.params.conversationId}`,
      { params: req.query }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

// Create group
router.post('/groups', authenticateToken, async (req, res) => {
  try {
    const response = await axios.post(`${CHAT_SERVICE}/groups`, {
      ...req.body,
      creatorId: req.user.userId
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

// Get group details
router.get('/groups/:groupId', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${CHAT_SERVICE}/groups/${req.params.groupId}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

// Add member to group
router.post('/groups/:groupId/members', authenticateToken, async (req, res) => {
  try {
    const response = await axios.post(
      `${CHAT_SERVICE}/groups/${req.params.groupId}/members`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Service unavailable' }
    );
  }
});

module.exports = router;
