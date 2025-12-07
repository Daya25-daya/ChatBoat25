# API Documentation

Base URL: `http://localhost:4000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Auth Endpoints

### Register User

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Errors:**
- `400` - Validation error or user already exists
- `500` - Server error

---

### Login

**POST** `/api/auth/login`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Errors:**
- `401` - Invalid credentials
- `500` - Server error

---

### Refresh Token

**POST** `/api/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGc..."
}
```

**Errors:**
- `401` - Invalid or expired refresh token
- `500` - Server error

---

### Logout

**POST** `/api/auth/logout`

Invalidate refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### Get User Profile

**GET** `/api/users/profile` 🔒

Get current user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "userId": "user_id",
  "username": "johndoe",
  "email": "john@example.com",
  "displayName": "John Doe",
  "avatar": "https://...",
  "bio": "Hello world",
  "status": "online",
  "lastSeen": "2024-01-01T00:00:00.000Z"
}
```

---

### Update User Profile

**PUT** `/api/users/profile` 🔒

Update current user's profile.

**Request Body:**
```json
{
  "displayName": "John Doe",
  "avatar": "https://...",
  "bio": "Hello world",
  "status": "online"
}
```

**Response:** `200 OK`
```json
{
  "userId": "user_id",
  "username": "johndoe",
  "displayName": "John Doe",
  "avatar": "https://...",
  "bio": "Hello world",
  "status": "online"
}
```

---

### Search Users

**GET** `/api/users/search?q=john&limit=10` 🔒

Search for users by username or display name.

**Query Parameters:**
- `q` (required) - Search query (min 2 characters)
- `limit` (optional) - Max results (default: 10)

**Response:** `200 OK`
```json
[
  {
    "userId": "user_id",
    "username": "johndoe",
    "displayName": "John Doe",
    "avatar": "https://...",
    "status": "online"
  }
]
```

---

### Get User by ID

**GET** `/api/users/:userId` 🔒

Get user details by user ID.

**Response:** `200 OK`
```json
{
  "userId": "user_id",
  "username": "johndoe",
  "displayName": "John Doe",
  "avatar": "https://...",
  "bio": "Hello world",
  "status": "online",
  "lastSeen": "2024-01-01T00:00:00.000Z"
}
```

---

## Chat Endpoints

### Get Conversations

**GET** `/api/chat/conversations` 🔒

Get all conversations for current user.

**Response:** `200 OK`
```json
[
  {
    "_id": "conversation_id",
    "participants": ["user_id_1", "user_id_2"],
    "type": "direct",
    "lastMessage": {
      "content": "Hello!",
      "senderId": "user_id_1",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    "unreadCount": {
      "user_id_2": 3
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Get Messages

**GET** `/api/chat/messages/:conversationId?limit=50&before=timestamp` 🔒

Get messages for a conversation.

**Query Parameters:**
- `limit` (optional) - Max messages (default: 50)
- `before` (optional) - Get messages before this timestamp (for pagination)

**Response:** `200 OK`
```json
[
  {
    "_id": "message_id",
    "conversationId": "conversation_id",
    "senderId": "user_id",
    "receiverId": "user_id",
    "content": "Hello!",
    "type": "text",
    "status": "read",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Create Group

**POST** `/api/chat/groups` 🔒

Create a new group chat.

**Request Body:**
```json
{
  "name": "My Group",
  "description": "Group description",
  "memberIds": ["user_id_1", "user_id_2"]
}
```

**Response:** `201 Created`
```json
{
  "_id": "group_id",
  "name": "My Group",
  "description": "Group description",
  "creatorId": "user_id",
  "members": [
    {
      "userId": "user_id",
      "role": "admin",
      "joinedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "conversationId": "conversation_id",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Get Group Details

**GET** `/api/chat/groups/:groupId` 🔒

Get group information.

**Response:** `200 OK`
```json
{
  "_id": "group_id",
  "name": "My Group",
  "description": "Group description",
  "avatar": "https://...",
  "creatorId": "user_id",
  "members": [
    {
      "userId": "user_id",
      "role": "admin",
      "joinedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "conversationId": "conversation_id"
}
```

---

### Add Group Member

**POST** `/api/chat/groups/:groupId/members` 🔒

Add a member to a group.

**Request Body:**
```json
{
  "userId": "user_id"
}
```

**Response:** `200 OK`
```json
{
  "_id": "group_id",
  "name": "My Group",
  "members": [...]
}
```

---

## WebSocket Events

Connect to WebSocket: `ws://localhost:4000`

**Authentication:**
```javascript
const socket = io('http://localhost:4000', {
  auth: {
    token: 'your_access_token'
  }
});
```

### Client → Server Events

#### send_message

Send a direct message.

**Payload:**
```javascript
socket.emit('send_message', {
  receiverId: 'user_id',
  conversationId: 'conversation_id', // optional
  content: 'Hello!',
  type: 'text' // optional, default: 'text'
});
```

---

#### send_group_message

Send a group message.

**Payload:**
```javascript
socket.emit('send_group_message', {
  groupId: 'group_id',
  content: 'Hello group!',
  type: 'text'
});
```

---

#### typing

Indicate user is typing.

**Payload:**
```javascript
socket.emit('typing', {
  receiverId: 'user_id',
  conversationId: 'conversation_id'
});
```

---

#### stop_typing

Indicate user stopped typing.

**Payload:**
```javascript
socket.emit('stop_typing', {
  receiverId: 'user_id',
  conversationId: 'conversation_id'
});
```

---

#### mark_as_read

Mark message as read.

**Payload:**
```javascript
socket.emit('mark_as_read', {
  messageId: 'message_id',
  senderId: 'user_id'
});
```

---

#### join_group

Join a group room.

**Payload:**
```javascript
socket.emit('join_group', {
  groupId: 'group_id'
});
```

---

#### leave_group

Leave a group room.

**Payload:**
```javascript
socket.emit('leave_group', {
  groupId: 'group_id'
});
```

---

### Server → Client Events

#### new_message

Receive a new message.

**Payload:**
```javascript
socket.on('new_message', (message) => {
  // message object
  {
    _id: 'message_id',
    conversationId: 'conversation_id',
    senderId: 'user_id',
    receiverId: 'user_id',
    content: 'Hello!',
    type: 'text',
    status: 'delivered',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
});
```

---

#### message_sent

Confirmation that message was sent.

**Payload:**
```javascript
socket.on('message_sent', (message) => {
  // Same structure as new_message
});
```

---

#### new_group_message

Receive a new group message.

**Payload:**
```javascript
socket.on('new_group_message', (message) => {
  // message object with groupId
});
```

---

#### user_typing

User is typing.

**Payload:**
```javascript
socket.on('user_typing', (data) => {
  {
    userId: 'user_id',
    conversationId: 'conversation_id'
  }
});
```

---

#### user_stop_typing

User stopped typing.

**Payload:**
```javascript
socket.on('user_stop_typing', (data) => {
  {
    userId: 'user_id',
    conversationId: 'conversation_id'
  }
});
```

---

#### message_read

Message was read.

**Payload:**
```javascript
socket.on('message_read', (data) => {
  {
    messageId: 'message_id',
    readBy: 'user_id'
  }
});
```

---

#### error

Error occurred.

**Payload:**
```javascript
socket.on('error', (error) => {
  {
    message: 'Error description'
  }
});
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (valid token but insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes per IP

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```

## Pagination

For endpoints that return lists, use these query parameters:

- `limit` - Number of items per page (default varies by endpoint)
- `before` - Cursor for pagination (timestamp or ID)

Example:
```
GET /api/chat/messages/conv_123?limit=20&before=2024-01-01T00:00:00.000Z
```

## Best Practices

1. **Token Management**
   - Store tokens securely (httpOnly cookies or secure storage)
   - Refresh access token before expiration
   - Handle 401 errors by refreshing token

2. **WebSocket Connection**
   - Reconnect on disconnect
   - Handle connection errors gracefully
   - Clean up event listeners on unmount

3. **Error Handling**
   - Always check response status
   - Display user-friendly error messages
   - Log errors for debugging

4. **Performance**
   - Implement message pagination
   - Cache user profiles
   - Debounce typing indicators
   - Throttle API calls

## Example Usage

### JavaScript/Fetch

```javascript
// Login
const response = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const { accessToken } = data;

// Get profile
const profileResponse = await fetch('http://localhost:4000/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const profile = await profileResponse.json();
```

### Axios

```javascript
import axios from 'axios';

// Set default base URL
axios.defaults.baseURL = 'http://localhost:4000/api';

// Add token to all requests
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const { data } = await axios.post('/auth/login', {
  email: 'john@example.com',
  password: 'password123'
});

// Get conversations
const conversations = await axios.get('/chat/conversations');
```

### Socket.IO Client

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: {
    token: accessToken
  }
});

socket.on('connect', () => {
  console.log('Connected');
});

socket.on('new_message', (message) => {
  console.log('New message:', message);
});

socket.emit('send_message', {
  receiverId: 'user_123',
  content: 'Hello!'
});
```
