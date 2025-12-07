const axios = require('axios');
const redisClient = require('../config/redis');

const CHAT_SERVICE = process.env.CHAT_SERVICE_URL;

const initializeHandlers = (io, socket) => {
  const userId = socket.userId;

  // Store user socket mapping in Redis
  redisClient.set(`socket:${userId}`, socket.id, { EX: 86400 });
  
  // Set user online status
  setUserOnline(userId, true);

  // Join user's personal room
  socket.join(`user:${userId}`);

  // Handle sending messages
  socket.on('send_message', async (data) => {
    console.log('=== GATEWAY: Received send_message ===');
    console.log('From user:', userId);
    console.log('Data:', data);
    
    try {
      const response = await axios.post(`${CHAT_SERVICE}/messages`, {
        senderId: userId,
        receiverId: data.receiverId,
        conversationId: data.conversationId,
        content: data.content,
        type: data.type || 'text'
      });

      const message = response.data;
      console.log('Message saved:', message);

      // Send to sender
      console.log('Emitting message_sent to sender');
      socket.emit('message_sent', message);

      // Send to receiver if online
      const receiverSocketId = await redisClient.get(`socket:${data.receiverId}`);
      console.log('Receiver socket ID:', receiverSocketId);
      
      if (receiverSocketId) {
        console.log('Emitting new_message to receiver');
        io.to(receiverSocketId).emit('new_message', message);
      }

      // Update message status to delivered if receiver is online
      if (receiverSocketId) {
        await axios.put(`${CHAT_SERVICE}/messages/${message._id}/status`, {
          status: 'delivered'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle group messages
  socket.on('send_group_message', async (data) => {
    try {
      const response = await axios.post(`${CHAT_SERVICE}/messages/group`, {
        senderId: userId,
        groupId: data.groupId,
        content: data.content,
        type: data.type || 'text'
      });

      const message = response.data;

      // Broadcast to all group members
      io.to(`group:${data.groupId}`).emit('new_group_message', message);
    } catch (error) {
      socket.emit('error', { message: 'Failed to send group message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', async (data) => {
    const receiverSocketId = await redisClient.get(`socket:${data.receiverId}`);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', {
        userId: userId,
        conversationId: data.conversationId
      });
    }
  });

  // Handle stop typing
  socket.on('stop_typing', async (data) => {
    const receiverSocketId = await redisClient.get(`socket:${data.receiverId}`);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_stop_typing', {
        userId: userId,
        conversationId: data.conversationId
      });
    }
  });

  // Handle message read status
  socket.on('mark_as_read', async (data) => {
    try {
      await axios.put(`${CHAT_SERVICE}/messages/${data.messageId}/status`, {
        status: 'read'
      });

      // Notify sender
      const senderSocketId = await redisClient.get(`socket:${data.senderId}`);
      if (senderSocketId) {
        io.to(senderSocketId).emit('message_read', {
          messageId: data.messageId,
          readBy: userId
        });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // Handle joining group room
  socket.on('join_group', (data) => {
    socket.join(`group:${data.groupId}`);
  });

  // Handle leaving group room
  socket.on('leave_group', (data) => {
    socket.leave(`group:${data.groupId}`);
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    await redisClient.del(`socket:${userId}`);
    setUserOnline(userId, false);
  });
};

// Helper function to set user online status
const setUserOnline = async (userId, isOnline) => {
  try {
    await redisClient.set(`online:${userId}`, isOnline ? '1' : '0', { EX: 300 });
    
    // Broadcast online status to all connected clients
    // In production, you'd want to be more selective about who receives this
  } catch (error) {
    console.error('Error setting online status:', error);
  }
};

module.exports = { initializeHandlers };
