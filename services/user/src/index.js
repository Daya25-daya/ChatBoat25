require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const { connectRabbitMQ, consumeEvents } = require('./config/rabbitmq');
const redisClient = require('./config/redis');

const app = express();

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'user' });
});

// Routes
app.use('/', userRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 4002;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    
    // Connect to Redis
    await redisClient.connect();
    console.log('Redis connected');
    
    // Connect to RabbitMQ and start consuming events
    await connectRabbitMQ();
    await consumeEvents();
    console.log('RabbitMQ connected');
    
    app.listen(PORT, () => {
      console.log(`User service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing connections...');
  mongoose.connection.close();
  redisClient.quit();
  process.exit(0);
});
