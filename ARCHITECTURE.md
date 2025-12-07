# Architecture Documentation

## System Overview

The Real-Time Chat Application is built using a microservices architecture with the following components:

```
┌─────────────┐
│   Frontend  │ (React + Vite + Tailwind)
│  (Port 3000)│
└──────┬──────┘
       │
       ↓
┌─────────────┐
│    NGINX    │ (Load Balancer + Rate Limiting)
│  (Port 80)  │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────────┐
│         Gateway Service                  │
│  (API Gateway + WebSocket Server)        │
│           (Port 4000)                    │
└────┬────────────────────────────────┬───┘
     │                                 │
     ↓                                 ↓
┌────────────────┐              ┌──────────────┐
│  Auth Service  │              │ Socket.IO    │
│  (Port 4001)   │              │ (WebSocket)  │
└────────────────┘              └──────────────┘
     │
     ↓
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│  User Service  │    │  Chat Service  │    │ Notification   │
│  (Port 4002)   │    │  (Port 4003)   │    │    Service     │
└────────────────┘    └────────────────┘    │  (Port 4004)   │
                                             └────────────────┘
     │                      │                       │
     └──────────────────────┼───────────────────────┘
                            ↓
                    ┌───────────────┐
                    │   RabbitMQ    │
                    │  (Port 5672)  │
                    └───────────────┘
                            │
     ┌──────────────────────┼───────────────────────┐
     ↓                      ↓                       ↓
┌──────────┐         ┌──────────┐           ┌──────────┐
│ MongoDB  │         │  Redis   │           │ MongoDB  │
│  (Auth)  │         │ (Cache)  │           │ (Chat)   │
└──────────┘         └──────────┘           └──────────┘
```

## Service Responsibilities

### 1. Gateway Service (Port 4000)

**Purpose:** API Gateway and WebSocket connection manager

**Responsibilities:**
- Route HTTP requests to appropriate microservices
- Manage WebSocket connections (Socket.IO)
- Handle real-time message routing
- JWT token verification
- Request/response transformation

**Technologies:**
- Express.js
- Socket.IO
- Redis (for socket mapping)
- Axios (for service communication)

**Key Features:**
- WebSocket authentication
- Real-time event handling (messages, typing, read receipts)
- Online/offline status management

### 2. Auth Service (Port 4001)

**Purpose:** User authentication and authorization

**Responsibilities:**
- User registration
- User login/logout
- JWT token generation (access + refresh tokens)
- Token refresh mechanism
- Password hashing and validation

**Technologies:**
- Express.js
- MongoDB (user credentials)
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- RabbitMQ (event publishing)

**Database Schema:**
```javascript
User {
  username: String (unique)
  email: String (unique)
  password: String (hashed)
  refreshTokens: [{ token, createdAt }]
  timestamps: true
}
```

**Events Published:**
- `user.created` - When new user registers
- `user.login` - When user logs in

### 3. User Service (Port 4002)

**Purpose:** User profile management and search

**Responsibilities:**
- User profile CRUD operations
- User search functionality
- Online status management
- User metadata storage

**Technologies:**
- Express.js
- MongoDB (user profiles)
- Redis (caching)
- RabbitMQ (event consumption)

**Database Schema:**
```javascript
UserProfile {
  userId: String (unique)
  username: String
  email: String
  displayName: String
  avatar: String
  bio: String
  status: Enum ['online', 'offline', 'away', 'busy']
  lastSeen: Date
  timestamps: true
}
```

**Events Consumed:**
- `user.created` - Creates user profile

### 4. Chat Service (Port 4003)

**Purpose:** Message and conversation management

**Responsibilities:**
- Message storage and retrieval
- Conversation management
- Group chat functionality
- Message status tracking (sent, delivered, read)
- Message history

**Technologies:**
- Express.js
- MongoDB (messages, conversations, groups)
- Redis (caching)
- RabbitMQ (event publishing)

**Database Schemas:**

```javascript
Message {
  conversationId: String
  senderId: String
  receiverId: String
  groupId: String (optional)
  content: String
  type: Enum ['text', 'image', 'file', 'audio', 'video']
  status: Enum ['sent', 'delivered', 'read']
  readBy: [{ userId, readAt }]
  deletedFor: [String]
  timestamps: true
}

Conversation {
  participants: [String]
  type: Enum ['direct', 'group']
  lastMessage: { content, senderId, timestamp }
  unreadCount: Map<String, Number>
  timestamps: true
}

Group {
  name: String
  description: String
  avatar: String
  creatorId: String
  members: [{ userId, role, joinedAt }]
  conversationId: String
  timestamps: true
}
```

**Events Published:**
- `message.sent` - When message is sent
- `group.message.sent` - When group message is sent
- `message.status.updated` - When message status changes

### 5. Notification Service (Port 4004)

**Purpose:** Real-time notification routing and management

**Responsibilities:**
- Consume events from other services
- Store notifications in Redis
- Route notifications to appropriate users
- Handle push notification logic

**Technologies:**
- Express.js
- Redis (notification storage)
- RabbitMQ (event consumption)

**Events Consumed:**
- `message.sent` - Creates notification for receiver
- `group.message.sent` - Creates notifications for group members
- `user.login` - Triggers login-related notifications

## Data Flow

### 1. User Registration Flow

```
Frontend → Gateway → Auth Service → MongoDB
                          ↓
                      RabbitMQ (user.created event)
                          ↓
                    User Service → MongoDB (create profile)
```

### 2. Message Sending Flow

```
Frontend → Socket.IO (Gateway) → Chat Service → MongoDB
                                      ↓
                                  RabbitMQ (message.sent event)
                                      ↓
                              Notification Service → Redis
                                      ↓
                          Socket.IO (Gateway) → Receiver Frontend
```

### 3. Real-Time Message Delivery

```
Sender Frontend → Socket.IO → Gateway Service
                                    ↓
                              Chat Service (save message)
                                    ↓
                              Redis (get receiver socket)
                                    ↓
                              Socket.IO → Receiver Frontend
```

## Communication Patterns

### 1. Synchronous Communication (HTTP/REST)

Used for:
- User authentication
- Profile updates
- Message history retrieval
- User search

**Pattern:** Request-Response via HTTP

### 2. Asynchronous Communication (RabbitMQ)

Used for:
- Event-driven updates
- Service decoupling
- Notification distribution

**Pattern:** Publish-Subscribe with Topic Exchange

**Exchange Types:**
- `user_events` - User-related events
- `chat_events` - Chat-related events

### 3. Real-Time Communication (WebSocket)

Used for:
- Live message delivery
- Typing indicators
- Online status updates
- Read receipts

**Pattern:** Bidirectional WebSocket (Socket.IO)

## Caching Strategy

### Redis Usage

1. **User Profiles** (TTL: 5 minutes)
   - Key: `profile:{userId}`
   - Reduces database queries for frequently accessed profiles

2. **Socket Mappings** (TTL: 24 hours)
   - Key: `socket:{userId}`
   - Maps user IDs to socket IDs for message routing

3. **Online Status** (TTL: 5 minutes)
   - Key: `online:{userId}`
   - Tracks user online/offline status

4. **Notifications** (TTL: 24 hours)
   - Key: `notifications:{userId}`
   - Stores recent notifications

## Security Features

### 1. Authentication

- JWT-based authentication
- Access tokens (short-lived: 15 minutes)
- Refresh tokens (long-lived: 7 days)
- Secure password hashing (bcrypt)

### 2. Authorization

- Token verification on all protected routes
- Socket.IO authentication middleware
- User-specific data access control

### 3. Rate Limiting

- NGINX-level rate limiting
- API endpoint rate limiting
- Auth endpoint stricter limits

### 4. Data Protection

- Password hashing before storage
- Sensitive data excluded from responses
- CORS configuration
- XSS protection headers

## Scalability Considerations

### Horizontal Scaling

1. **Stateless Services**
   - All services are stateless
   - Can scale independently

2. **Load Balancing**
   - NGINX distributes traffic
   - Sticky sessions for WebSocket

3. **Database Scaling**
   - MongoDB replica sets
   - Read replicas for queries
   - Sharding for large datasets

4. **Message Queue**
   - RabbitMQ clustering
   - Multiple consumers per queue

### Performance Optimization

1. **Caching**
   - Redis for frequently accessed data
   - Reduces database load

2. **Database Indexes**
   - Indexed fields for fast queries
   - Compound indexes for complex queries

3. **Connection Pooling**
   - MongoDB connection pooling
   - Redis connection reuse

## Monitoring and Observability

### Health Checks

Each service exposes `/health` endpoint for:
- Kubernetes liveness probes
- Load balancer health checks
- Monitoring systems

### Logging

- Structured logging in all services
- Request/response logging
- Error tracking
- Event processing logs

### Metrics (Future Enhancement)

- Request latency
- Message throughput
- Active connections
- Error rates
- Resource utilization

## Deployment

### Docker Compose

- Single-command deployment
- Service orchestration
- Network isolation
- Volume management

### Production Considerations

1. **Container Orchestration**
   - Kubernetes for production
   - Auto-scaling policies
   - Rolling updates

2. **Database**
   - Managed MongoDB (Atlas)
   - Managed Redis (ElastiCache)
   - Automated backups

3. **Message Queue**
   - Managed RabbitMQ (CloudAMQP)
   - High availability setup

4. **CDN**
   - Static asset delivery
   - Frontend optimization

## Future Enhancements

1. **Features**
   - File/image sharing
   - Voice/video calls
   - Message reactions
   - Message editing/deletion
   - End-to-end encryption

2. **Technical**
   - GraphQL API
   - gRPC for inter-service communication
   - Event sourcing
   - CQRS pattern
   - Distributed tracing

3. **Infrastructure**
   - Service mesh (Istio)
   - API versioning
   - Blue-green deployments
   - Canary releases
