# Setup Instructions

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Git installed

## Quick Start (Docker)

1. **Clone the repository:**
```bash
git clone <repository-url>
cd realtime-chat-app
```

2. **Start all services with Docker Compose:**
```bash
docker-compose up -d
```

3. **Wait for services to initialize (about 30-60 seconds)**

4. **Access the application:**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- RabbitMQ Management: http://localhost:15672 (admin/password123)

## Development Setup (Without Docker)

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all service dependencies
npm run install-all
```

### 2. Setup Infrastructure

Start MongoDB, Redis, and RabbitMQ using Docker:

```bash
docker-compose up -d mongodb redis rabbitmq
```

Or install them locally on your machine.

### 3. Configure Environment Variables

Copy `.env.example` to `.env` in each service directory:

```bash
# Auth Service
cd services/auth
cp .env.example .env

# User Service
cd ../user
cp .env.example .env

# Chat Service
cd ../chat
cp .env.example .env

# Notification Service
cd ../notification
cp .env.example .env

# Gateway Service
cd ../gateway
cp .env.example .env
```

Update the environment variables if needed (especially if not using Docker).

### 4. Start Services

Open 6 terminal windows and run:

**Terminal 1 - Auth Service:**
```bash
npm run dev:auth
```

**Terminal 2 - User Service:**
```bash
npm run dev:user
```

**Terminal 3 - Chat Service:**
```bash
npm run dev:chat
```

**Terminal 4 - Notification Service:**
```bash
npm run dev:notification
```

**Terminal 5 - Gateway Service:**
```bash
npm run dev:gateway
```

**Terminal 6 - Frontend:**
```bash
npm run dev:frontend
```

### 5. Access the Application

Open your browser and navigate to:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000

## Testing the Application

1. **Register a new account:**
   - Go to http://localhost:3000/register
   - Create an account with username, email, and password

2. **Login:**
   - Use your credentials to login

3. **Start chatting:**
   - Click "New Chat" to search for users
   - Select a user to start a conversation
   - Send messages in real-time

4. **Test with multiple users:**
   - Open another browser (or incognito window)
   - Register another account
   - Chat between the two accounts

## Troubleshooting

### Services won't start

1. Check if ports are already in use:
```bash
# Windows
netstat -ano | findstr :4000
netstat -ano | findstr :27017
netstat -ano | findstr :6379
netstat -ano | findstr :5672
```

2. Stop conflicting services or change ports in environment variables

### MongoDB connection error

1. Ensure MongoDB is running:
```bash
docker ps | findstr mongodb
```

2. Check MongoDB logs:
```bash
docker logs chat-mongodb
```

### RabbitMQ connection error

1. Wait for RabbitMQ to fully initialize (can take 30-60 seconds)

2. Check RabbitMQ logs:
```bash
docker logs chat-rabbitmq
```

### Frontend can't connect to backend

1. Ensure Gateway service is running on port 4000

2. Check browser console for errors

3. Verify CORS settings in gateway service

## Production Deployment

### Environment Variables

Update these critical environment variables for production:

```env
JWT_SECRET=<generate-strong-random-secret>
JWT_REFRESH_SECRET=<generate-strong-random-secret>
MONGODB_URI=<production-mongodb-uri>
REDIS_URL=<production-redis-url>
RABBITMQ_URL=<production-rabbitmq-url>
NODE_ENV=production
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable MongoDB authentication
- [ ] Use Redis password
- [ ] Configure RabbitMQ users and permissions
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Scaling

To scale horizontally:

1. **Scale Gateway Service:**
```bash
docker-compose up -d --scale gateway-service=3
```

2. **Use Redis for Socket.IO adapter:**
   - Install `@socket.io/redis-adapter`
   - Configure in gateway service

3. **Database Optimization:**
   - Add MongoDB indexes
   - Use MongoDB replica sets
   - Implement Redis caching strategy

4. **Load Balancing:**
   - Configure NGINX for multiple gateway instances
   - Use sticky sessions for WebSocket connections

## Monitoring

### Health Checks

All services expose a `/health` endpoint:

```bash
curl http://localhost:4000/health  # Gateway
curl http://localhost:4001/health  # Auth
curl http://localhost:4002/health  # User
curl http://localhost:4003/health  # Chat
curl http://localhost:4004/health  # Notification
```

### Logs

View logs for all services:

```bash
docker-compose logs -f
```

View logs for specific service:

```bash
docker-compose logs -f gateway-service
```

## Support

For issues and questions, please open an issue on GitHub.
