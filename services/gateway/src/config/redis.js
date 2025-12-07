const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Configure Redis client with TLS support for Upstash
const redisClient = createClient({
  url: redisUrl,
  socket: {
    tls: redisUrl.startsWith('rediss://'),
    rejectUnauthorized: false
  }
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis client connected');
});

module.exports = redisClient;
