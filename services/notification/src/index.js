require('dotenv').config();
const express = require('express');
const { connectRabbitMQ, consumeEvents } = require('./config/rabbitmq');
const redisClient = require('./config/redis');

const app = express();

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'notification' });
});

const PORT = process.env.PORT || 4004;

// Initialize connections
const init = async () => {
  try {
    // Connect to Redis
    await redisClient.connect();
    console.log('Redis connected');
    
    // Connect to RabbitMQ and start consuming
    await connectRabbitMQ();
    await consumeEvents();
    console.log('RabbitMQ connected and consuming events');
    
    app.listen(PORT, () => {
      console.log(`Notification service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
};

init();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing connections...');
  redisClient.quit();
  process.exit(0);
});
