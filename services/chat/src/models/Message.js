const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true,
    index: true
  },
  receiverId: {
    type: String,
    index: true
  },
  groupId: {
    type: String,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  // Message Reactions
  reactions: [{
    userId: String,
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Reply-To Feature
  replyTo: {
    messageId: String,
    content: String,
    senderName: String
  },
  // E2E Encryption
  encrypted: {
    type: Boolean,
    default: false
  },
  encryptedContent: String,
  encryptedKey: String,
  iv: String,
  // Read Status
  readBy: [{
    userId: String,
    readAt: Date
  }],
  deletedFor: [{
    type: String
  }]
}, {
  timestamps: true
});

// Compound indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ groupId: 1, createdAt: -1 });
// Text search index for advanced search
messageSchema.index({ content: 'text' });

module.exports = mongoose.model('Message', messageSchema);
