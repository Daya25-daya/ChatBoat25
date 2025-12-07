const express = require('express');
const Joi = require('joi');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Group = require('../models/Group');
const { publishEvent } = require('../config/rabbitmq');

const router = express.Router();

// Validation schemas
const messageSchema = Joi.object({
  senderId: Joi.string().required(),
  receiverId: Joi.string().when('conversationId', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  conversationId: Joi.string().allow(null).optional(),
  content: Joi.string().required(),
  type: Joi.string().valid('text', 'image', 'file', 'audio', 'video').default('text')
});

const groupMessageSchema = Joi.object({
  senderId: Joi.string().required(),
  groupId: Joi.string().required(),
  content: Joi.string().required(),
  type: Joi.string().valid('text', 'image', 'file', 'audio', 'video').default('text')
});

// Send message
router.post('/messages', async (req, res) => {
  try {
    console.log('=== CHAT SERVICE: Received message ===');
    console.log('Request body:', req.body);
    
    const { error } = messageSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { senderId, receiverId, conversationId, content, type } = req.body;
    
    console.log('Validated data:', { senderId, receiverId, conversationId, content, type });

    // Find or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    } else {
      // Create conversation ID from sorted participant IDs
      const participants = [senderId, receiverId].sort();
      conversation = await Conversation.findOne({
        participants: { $all: participants },
        type: 'direct'
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants,
          type: 'direct'
        });
      }
    }

    // Create message
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      receiverId,
      content,
      type,
      status: 'sent'
    });

    // Update conversation
    conversation.lastMessage = {
      content,
      senderId,
      timestamp: message.createdAt
    };
    
    // Increment unread count for receiver
    if (!conversation.unreadCount) {
      conversation.unreadCount = new Map();
    }
    const currentCount = conversation.unreadCount.get(receiverId) || 0;
    conversation.unreadCount.set(receiverId, currentCount + 1);
    
    await conversation.save();

    // Publish message event
    await publishEvent('chat_events', 'message.sent', {
      messageId: message._id,
      conversationId: conversation._id,
      senderId,
      receiverId,
      content,
      timestamp: message.createdAt
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Send group message
router.post('/messages/group', async (req, res) => {
  try {
    const { error } = groupMessageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { senderId, groupId, content, type } = req.body;

    // Get group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Create message
    const message = await Message.create({
      conversationId: group.conversationId,
      senderId,
      groupId,
      content,
      type,
      status: 'sent'
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(group.conversationId, {
      lastMessage: {
        content,
        senderId,
        timestamp: message.createdAt
      }
    });

    // Publish group message event
    await publishEvent('chat_events', 'group.message.sent', {
      messageId: message._id,
      groupId,
      senderId,
      content,
      timestamp: message.createdAt
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send group message error:', error);
    res.status(500).json({ error: 'Failed to send group message' });
  }
});

// Get conversations for user
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({
      participants: userId
    })
    .sort({ 'lastMessage.timestamp': -1 })
    .limit(50);

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get messages for conversation
router.get('/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    const query = { conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Update message status
router.put('/messages/:messageId/status', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    if (!['sent', 'delivered', 'read'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const message = await Message.findByIdAndUpdate(
      messageId,
      { $set: { status } },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Publish status update event
    await publishEvent('chat_events', 'message.status.updated', {
      messageId,
      status,
      timestamp: new Date()
    });

    res.json(message);
  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({ error: 'Failed to update message status' });
  }
});

// Create group
router.post('/groups', async (req, res) => {
  try {
    const { name, description, creatorId, memberIds } = req.body;

    if (!name || !creatorId) {
      return res.status(400).json({ error: 'Name and creator ID are required' });
    }

    // Create conversation for group
    const conversation = await Conversation.create({
      participants: [creatorId, ...(memberIds || [])],
      type: 'group'
    });

    // Create group
    const members = [
      { userId: creatorId, role: 'admin' },
      ...(memberIds || []).map(id => ({ userId: id, role: 'member' }))
    ];

    const group = await Group.create({
      name,
      description: description || '',
      creatorId,
      members,
      conversationId: conversation._id
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Get group details
router.get('/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to get group' });
  }
});

// Add member to group
router.post('/groups/:groupId/members', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is already a member
    const isMember = group.members.some(m => m.userId === userId);
    if (isMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add member
    group.members.push({ userId, role: 'member' });
    await group.save();

    // Update conversation participants
    await Conversation.findByIdAndUpdate(group.conversationId, {
      $addToSet: { participants: userId }
    });

    res.json(group);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

module.exports = router;
