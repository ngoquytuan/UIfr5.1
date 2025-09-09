# FR-05.1 ChatUI - RAG Chatbot User Interface

A modern, real-time chat interface for RAG-powered AI conversations built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Real-time Messaging**: WebSocket-powered instant messaging with typing indicators
- **File Upload**: Drag-and-drop file upload with support for PDF, DOC, DOCX, TXT, MD files
- **Conversation Management**: Create, manage, and organize chat conversations
- **Responsive Design**: Fully responsive interface optimized for desktop and mobile
- **Dark Mode**: Built-in dark/light theme with system preference detection
- **Authentication**: Secure user authentication and session management
- **Export Functionality**: Export conversations in multiple formats (JSON, Markdown, PDF, TXT)
- **Search & Filter**: Advanced search and filtering capabilities
- **TypeScript**: Full type safety throughout the application
- **Modern UI**: Clean, intuitive interface with smooth animations

## 📋 Requirements

- Node.js 18+ 
- npm 8+
- Docker (for containerized deployment)
- Modern web browser with WebSocket support

## 🛠️ Technology Stack

- **Frontend**: Next.js 13.5+, React 18.2+, TypeScript 5.2+
- **Styling**: Tailwind CSS 3.3+, CSS-in-JS
- **State Management**: Zustand 4.4+
- **Real-time Communication**: Socket.IO Client 4.7+
- **HTTP Client**: Fetch API with custom service layer
- **Form Handling**: React Hook Form 7.47+
- **Animations**: Framer Motion 10.16+
- **File Upload**: react-dropzone 14.2+
- **Data Fetching**: TanStack React Query 4.35+
- **Build Tools**: Next.js, TypeScript, ESLint, Prettier
- **Deployment**: Docker, Nginx

## 📁 Project Structure

```
FR-05.1_ChatUI/
├── src/
│   ├── app/                    # Next.js 13 App Router pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── login/             # Authentication pages
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable React components
│   │   ├── ui/               # Base UI components (Button, Input, etc.)
│   │   ├── layout/           # Layout components (Header, Sidebar, etc.)
│   │   ├── chat/             # Chat-specific components
│   │   └── upload/           # File upload components
│   ├── stores/               # Zustand state management
│   │   ├── authStore.ts      # Authentication state
│   │   └── chatStore.ts      # Chat state
│   ├── services/             # API and external services
│   │   ├── api.ts            # REST API service
│   │   └── websocket.ts      # WebSocket service
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript type definitions
│   └── constants/            # Application constants
├── public/                   # Static assets
├── nginx/                    # Nginx configuration
├── scripts/                  # Deployment and utility scripts
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile               # Docker build configuration
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## 🚀 Quick Start

### Development Setup

1. **Clone and navigate to the project:**
   ```bash
   cd C:\undertest\FR-02.2\FR-05.1_ChatUI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_WS_URL=ws://localhost:8000
   NEXT_PUBLIC_MAX_FILE_SIZE=10485760
   # ... other variables
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

### Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

## 🐳 Docker Deployment

### Option 1: Docker Compose (Recommended)

1. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your production settings
   ```

2. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - HTTP: `http://localhost:3000`
   - With Nginx: `http://localhost:80`

4. **View logs:**
   ```bash
   docker-compose logs -f chatui
   ```

5. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Option 2: Docker Build

1. **Build the Docker image:**
   ```bash
   docker build -t rag-chatui .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
     -e NEXT_PUBLIC_WS_URL=ws://localhost:8000 \
     --name rag-chatui \
     rag-chatui
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` | Yes |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `ws://localhost:8000` | Yes |
| `NEXT_PUBLIC_MAX_FILE_SIZE` | Max upload size (bytes) | `10485760` (10MB) | No |
| `NEXT_PUBLIC_ALLOWED_FILE_TYPES` | Allowed file extensions | `.pdf,.doc,.docx,.txt,.md` | No |
| `NEXT_PUBLIC_APP_NAME` | Application name | `RAG Chatbot UI` | No |
| `NEXT_PUBLIC_ENABLE_FILE_UPLOAD` | Enable file upload | `true` | No |
| `NEXT_PUBLIC_ENABLE_DARK_MODE` | Enable dark mode | `true` | No |

### Backend Integration

The ChatUI connects to a backend API that should provide:

1. **Authentication Endpoints:**
   - `POST /auth/login` - User login
   - `POST /auth/logout` - User logout
   - `GET /auth/me` - Get current user

2. **Conversation Endpoints:**
   - `GET /conversations` - List conversations
   - `POST /conversations` - Create conversation
   - `GET /conversations/:id` - Get conversation details
   - `DELETE /conversations/:id` - Delete conversation

3. **Message Endpoints:**
   - `GET /conversations/:id/messages` - Get messages
   - `POST /conversations/:id/messages` - Send message
   - `DELETE /conversations/:id/messages/:messageId` - Delete message

4. **File Upload Endpoints:**
   - `POST /files/upload` - Upload file
   - `GET /files/:id/status` - Check upload status

5. **WebSocket Events:**
   - Message streaming and real-time updates
   - Typing indicators
   - Connection status

## 🎨 Customization

### Theming

The application uses Tailwind CSS with a custom design system. Key customization files:

- `tailwind.config.js` - Tailwind configuration with custom colors and animations
- `src/app/globals.css` - Global styles and component classes
- `src/constants/index.ts` - Application constants and configuration

### Component Architecture

- **UI Components** (`src/components/ui/`): Reusable base components
- **Layout Components** (`src/components/layout/`): Application layout structure  
- **Chat Components** (`src/components/chat/`): Chat-specific functionality
- **Upload Components** (`src/components/upload/`): File upload functionality

## 📱 Mobile Optimization

The application is fully responsive with:
- Mobile-first design approach
- Touch-optimized interactions
- Responsive sidebar navigation
- Optimized file upload experience
- Progressive Web App (PWA) capabilities

## 🔒 Security Features

- Content Security Policy (CSP) headers
- XSS protection headers
- CSRF protection
- Secure file upload validation
- Rate limiting (via Nginx)
- HTTPS enforcement
- Secure cookie handling

## 🚀 Production Deployment

### Deployment Checklist

- [ ] Configure production environment variables
- [ ] Set up SSL certificates for HTTPS
- [ ] Configure Nginx reverse proxy
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Test all functionality in production environment
- [ ] Set up health checks and alerts

### Nginx Configuration

The included Nginx configuration provides:
- SSL termination
- Static file serving
- Rate limiting
- Security headers
- WebSocket proxy support
- Health checks

### Health Checks

The application includes health check endpoints:
- Application: `http://localhost:3000/api/health`
- Nginx: `http://localhost:80/health`

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📊 Performance

### Optimization Features

- Next.js automatic code splitting
- Image optimization
- Static asset caching
- Gzip compression
- Bundle size optimization
- Lazy loading of components

### Performance Targets

- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- UI Response Time: < 200ms
- File Upload: Support up to 10MB files
- Concurrent Users: 100+ supported

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed:**
   - Verify `NEXT_PUBLIC_WS_URL` is correct
   - Check if backend WebSocket server is running
   - Ensure firewall allows WebSocket connections

2. **File Upload Not Working:**
   - Check `NEXT_PUBLIC_MAX_FILE_SIZE` setting
   - Verify file types are in `NEXT_PUBLIC_ALLOWED_FILE_TYPES`
   - Ensure backend upload endpoint is configured

3. **Authentication Issues:**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check backend authentication endpoints
   - Clear browser cookies and localStorage

4. **Docker Build Fails:**
   - Ensure Docker is installed and running
   - Check `.env.local` file exists
   - Verify all dependencies in `package.json`

### Logs

- **Development:** Console logs in browser dev tools
- **Production:** `docker-compose logs -f chatui`
- **Nginx:** `docker-compose logs -f nginx`

## 📄 License

This project is part of the FR-02.2 RAG pipeline system.

## 🤝 Support

For technical support or questions about deployment:
1. Check the troubleshooting section above
2. Review the backend API integration requirements
3. Verify all environment variables are correctly configured
4. Check Docker and system requirements

## 📝 Version History

- **v1.0.0**: Initial release with core chat functionality
  - Real-time messaging with WebSocket
  - File upload with drag-and-drop
  - Conversation management
  - Authentication system
  - Docker deployment support
  - Responsive design with dark mode