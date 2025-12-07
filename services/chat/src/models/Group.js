const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  creatorId: {
    type: String,
    required: true
  },
  members: [{
    userId: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  conversationId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for finding groups by member
groupSchema.index({ 'members.userId': 1 });

module.exports = mongoose.model('Group', groupSchema);
