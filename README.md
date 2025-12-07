# Real-Time Chat Application

A production-ready, scalable real-time chat application built with microservices architecture.

## 🏗️ Architecture

- **Gateway Service**: API Gateway + WebSocket routing
- **Auth Service**: JWT authentication with refresh tokens
- **Chat Service**: Message delivery, groups, online status
- **User Service**: User profiles, search
- **Notification Service**: Real-time event routing

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- Socket.IO (WebSockets)
- MongoDB (data persistence)
- Redis (caching, sessions)
- RabbitMQ (inter-service communication)

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Context API
- Socket.IO Client

**Infrastructure:**
- Docker + Docker Compose
- NGINX (load balancer)

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

## 🚀 Quick Start

1. **Clone and setup:**
```bash
npm run setup
```

2. **Start all services:**
```bash
docker-compose up -d
```

3. **Access the application:**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000

## 📁 Project Structure

```
realtime-chat-app/
├── services/
│   ├── gateway/          # API Gateway + WebSocket
│   ├── auth/             # Authentication service
│   ├── chat/             # Chat service
│   ├── user/             # User service
│   └── notification/     # Notification service
├── frontend/             # React application
├── docker-compose.yml
├── nginx.conf
└── package.json
```

## 🔧 Development

**Run individual service:**
```bash
cd services/gateway
npm install
npm run dev
```

**Run frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🌟 Features

- ✅ 1-to-1 messaging
- ✅ Group chat
- ✅ Online/offline indicators
- ✅ Typing indicators
- ✅ Message status (sent, delivered, seen)
- ✅ Real-time notifications
- ✅ JWT authentication with refresh tokens
- ✅ Rate limiting
- ✅ User search
- ✅ Message history

## 📚 API Documentation

See individual service README files for detailed API documentation.

## 🔒 Security Features

- JWT access & refresh tokens
- Password hashing (bcrypt)
- Rate limiting
- CORS configuration
- Input validation
- XSS protection

## 📝 License

MIT
