require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const { connectRabbitMQ } = require('./config/rabbitmq');
const redisClient = require('./config/redis');

const app = express();

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auth' });
});

// Routes
app.use('/', authRoutes);

const PORT = process.env.PORT || 4001;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    
    // Connect to Redis
    await redisClient.connect();
    console.log('Redis connected');
    
    // Connect to RabbitMQ
    await connectRabbitMQ();
    console.log('RabbitMQ connected');
    
    app.listen(PORT, () => {
      console.log(`Auth service running on port ${PORT}`);
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
