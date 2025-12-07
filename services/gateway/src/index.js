require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const uploadRoutes = require('./routes/upload');
const { authenticateSocket } = require('./middleware/socketAuth');
const socketHandlers = require('./socket/handlers');
const redisClient = require('./config/redis');

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://chat-frontend-r61x.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'gateway' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', uploadRoutes);

// Serve uploaded files directly at /uploads
const path = require('path');
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Socket.IO authentication middleware
io.use(authenticateSocket);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  console.log(`Socket ID: ${socket.id}`);
  
  // Log all incoming events for debugging
  socket.onAny((eventName, ...args) => {
    console.log(`📥 Received event: ${eventName}`, args);
  });
  
  // Initialize socket handlers
  socketHandlers.initializeHandlers(io, socket);
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 4000;

// Initialize Redis connection
redisClient.connect().then(() => {
  console.log('Redis connected');
  
  server.listen(PORT, () => {
    console.log(`Gateway service running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Redis connection error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    redisClient.quit();
    process.exit(0);
  });
});
