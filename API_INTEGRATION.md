# FR-05.1 ChatUI API Integration Guide

This document outlines the API requirements and integration specifications for the ChatUI frontend to communicate with the RAG backend system.

## 🔗 API Overview

The ChatUI application requires a backend API that provides authentication, conversation management, messaging, and file upload capabilities. All API endpoints should follow RESTful conventions and return JSON responses.

## 🏗️ Base API Structure

### Base URL
```
Production: https://your-api-domain.com
Development: http://localhost:8000
```

### Common Response Format
```json
{
  "success": boolean,
  "data": object | array | null,
  "error": string | null,
  "message": string | null,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Pagination Response Format
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasMore": true
  }
}
```

## 🔐 Authentication Endpoints

### POST /auth/login
**Purpose**: Authenticate user and return access token

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "username": "demo_user",
      "email": "user@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "isOnline": true,
      "lastSeen": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### POST /auth/logout
**Purpose**: Logout user and invalidate token

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /auth/me
**Purpose**: Get current authenticated user information

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "username": "demo_user",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "isOnline": true,
    "lastSeen": "2024-01-01T00:00:00Z"
  }
}
```

## 💬 Conversation Management Endpoints

### GET /conversations
**Purpose**: List user's conversations with pagination

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `sort` (string, optional): Sort order ('recent', 'oldest', 'title')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv_123",
      "title": "Discussion about AI",
      "messages": [
        {
          "id": "msg_456",
          "content": "Hello, how can I help?",
          "type": "assistant",
          "timestamp": "2024-01-01T00:00:00Z",
          "conversationId": "conv_123",
          "userId": null,
          "metadata": {
            "tokens": 10,
            "model": "gpt-3.5-turbo"
          }
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:05:00Z",
      "userId": "user_123",
      "isActive": true,
      "metadata": {
        "totalTokens": 150,
        "model": "gpt-3.5-turbo",
        "summary": "AI discussion"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "hasMore": false
  }
}
```

### POST /conversations
**Purpose**: Create a new conversation

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "New Discussion" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv_789",
    "title": "New Discussion",
    "messages": [],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "userId": "user_123",
    "isActive": true,
    "metadata": {}
  }
}
```

### GET /conversations/:id
**Purpose**: Get specific conversation details

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Same format as single conversation in list above

### PATCH /conversations/:id
**Purpose**: Update conversation (title, metadata)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Updated Title",
  "metadata": {
    "tags": ["important", "work"]
  }
}
```

**Response:** Updated conversation object

### DELETE /conversations/:id
**Purpose**: Delete a conversation

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

## 💬 Message Endpoints

### GET /conversations/:id/messages
**Purpose**: Get messages for a conversation

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page (default: 50)
- `before` (string, optional): Get messages before this message ID
- `after` (string, optional): Get messages after this message ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg_123",
      "content": "What is artificial intelligence?",
      "type": "user",
      "timestamp": "2024-01-01T00:00:00Z",
      "conversationId": "conv_123",
      "userId": "user_123",
      "metadata": {
        "files": [
          {
            "id": "file_456",
            "name": "document.pdf",
            "size": 1024000,
            "type": "application/pdf",
            "url": "https://example.com/files/document.pdf",
            "uploadedAt": "2024-01-01T00:00:00Z",
            "status": "processed"
          }
        ]
      }
    },
    {
      "id": "msg_124",
      "content": "Artificial intelligence (AI) refers to...",
      "type": "assistant",
      "timestamp": "2024-01-01T00:00:30Z",
      "conversationId": "conv_123",
      "userId": null,
      "metadata": {
        "tokens": 150,
        "model": "gpt-3.5-turbo",
        "sources": ["document.pdf:page-1", "document.pdf:page-3"]
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "hasMore": false
  }
}
```

### POST /conversations/:id/messages
**Purpose**: Send a new message

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "content": "What is machine learning?",
  "files": ["file_123", "file_456"] // optional file IDs
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "msg_789",
    "content": "What is machine learning?",
    "type": "user",
    "timestamp": "2024-01-01T00:00:00Z",
    "conversationId": "conv_123",
    "userId": "user_123",
    "metadata": {
      "files": [...] // file objects if included
    }
  }
}
```

### DELETE /conversations/:id/messages/:messageId
**Purpose**: Delete a message

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

## 📁 File Upload Endpoints

### POST /files/upload
**Purpose**: Upload a file for processing

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: File to upload
- `conversationId` (optional): Associate with conversation

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file_123",
    "name": "document.pdf",
    "size": 1024000,
    "type": "application/pdf",
    "url": "https://example.com/files/document.pdf",
    "uploadedAt": "2024-01-01T00:00:00Z",
    "status": "processing",
    "metadata": {
      "pages": null,
      "extractedText": null
    }
  }
}
```

**Status Values:**
- `uploading`: File is being uploaded
- `uploaded`: Upload complete, processing not started
- `processing`: File is being processed
- `processed`: Ready for use
- `error`: Processing failed

### GET /files/:id/status
**Purpose**: Check file processing status

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file_123",
    "name": "document.pdf",
    "size": 1024000,
    "type": "application/pdf",
    "url": "https://example.com/files/document.pdf",
    "uploadedAt": "2024-01-01T00:00:00Z",
    "status": "processed",
    "metadata": {
      "pages": 10,
      "extractedText": "Document content...",
      "processingTime": 5.2
    }
  }
}
```

### DELETE /files/:id
**Purpose**: Delete an uploaded file

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## 🔍 Search Endpoints

### GET /search/messages
**Purpose**: Search messages across conversations

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `q`: Search query
- `conversationId` (optional): Limit to specific conversation
- `type` (optional): Message type filter
- `hasFiles` (optional): Filter messages with/without files
- `startDate` (optional): Start date filter (ISO string)
- `endDate` (optional): End date filter (ISO string)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:** Same format as GET messages with search highlights

### GET /search/conversations
**Purpose**: Search conversations by title or content

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `q`: Search query
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:** Same format as GET conversations

## 📤 Export Endpoints

### POST /conversations/:id/export
**Purpose**: Export a single conversation

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "format": "json", // "json", "markdown", "pdf", "txt"
  "includeMetadata": true,
  "includeFiles": false,
  "dateRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://example.com/exports/conv_123.json",
    "expiresAt": "2024-01-01T01:00:00Z"
  }
}
```

### POST /conversations/export
**Purpose**: Export multiple conversations

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "conversationIds": ["conv_123", "conv_456"],
  "options": {
    "format": "json",
    "includeMetadata": true,
    "includeFiles": false
  }
}
```

**Response:** Same format as single export

## ⚙️ Settings Endpoints

### GET /settings
**Purpose**: Get user settings and preferences

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "model": "gpt-3.5-turbo",
    "temperature": 0.7,
    "maxTokens": 2000,
    "systemPrompt": "You are a helpful assistant...",
    "enableStreaming": true,
    "enableFileUpload": true,
    "theme": "dark",
    "language": "en"
  }
}
```

### PATCH /settings
**Purpose**: Update user settings

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "model": "gpt-4",
  "temperature": 0.8,
  "theme": "light"
}
```

**Response:** Updated settings object

## 🏥 Health Check Endpoint

### GET /health
**Purpose**: Check API health status

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0",
    "uptime": 3600,
    "database": "connected",
    "redis": "connected"
  }
}
```

## 🔌 WebSocket Integration

### Connection
```javascript
// Connect to WebSocket
const socket = io('ws://localhost:8000', {
  auth: {
    token: 'jwt_token_here'
  }
});
```

### Events

#### Client → Server Events

**join_conversation**
```javascript
socket.emit('join_conversation', {
  conversationId: 'conv_123'
});
```

**send_message**
```javascript
socket.emit('send_message', {
  conversationId: 'conv_123',
  content: 'Hello world',
  files: ['file_123']
});
```

**typing_start**
```javascript
socket.emit('typing_start', {
  conversationId: 'conv_123'
});
```

**typing_stop**
```javascript
socket.emit('typing_stop', {
  conversationId: 'conv_123'
});
```

#### Server → Client Events

**message_received**
```javascript
socket.on('message_received', (data) => {
  // New complete message
  console.log(data); // Message object
});
```

**message_chunk**
```javascript
socket.on('message_chunk', (data) => {
  // Streaming message chunk
  console.log(data); // { messageId, chunk, isComplete }
});
```

**message_complete**
```javascript
socket.on('message_complete', (data) => {
  // Complete streamed message
  console.log(data); // Final message object
});
```

**user_typing**
```javascript
socket.on('user_typing', (data) => {
  // User typing status
  console.log(data); // { userId, isTyping }
});
```

**error**
```javascript
socket.on('error', (error) => {
  // Error handling
  console.error(error); // { message, code }
});
```

**connection_status**
```javascript
socket.on('connection_status', (data) => {
  // Connection status updates
  console.log(data); // { status, message }
});
```

## 🔒 Security Requirements

### Authentication
- All endpoints (except `/health` and `/auth/login`) require `Authorization: Bearer <token>` header
- JWT tokens should include user ID and expiration
- Implement token refresh mechanism for long-lived sessions

### File Upload Security
- Validate file types and sizes
- Scan uploaded files for malware
- Store files securely with proper access controls
- Generate secure, temporary download URLs

### Rate Limiting
- Implement rate limiting per user/IP
- Suggested limits:
  - Login: 5 attempts per minute
  - Message sending: 10 per minute
  - File upload: 3 per minute
  - General API: 100 requests per minute

### CORS Configuration
```javascript
// Allow ChatUI origins
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-chatui-domain.com'
  ],
  credentials: true
};
```

## 📝 Implementation Notes

### Error Handling
- Use consistent HTTP status codes
- Provide detailed error messages for debugging
- Log errors server-side with request context
- Handle network timeouts gracefully

### Performance Optimization
- Implement database indexing for search queries
- Use pagination for large result sets
- Cache frequently accessed data
- Optimize file processing workflows

### WebSocket Best Practices
- Implement connection heartbeat/ping-pong
- Handle reconnection logic
- Validate WebSocket messages
- Implement room-based message distribution

This API specification provides all the endpoints and data formats needed for the ChatUI to function properly with a RAG backend system.