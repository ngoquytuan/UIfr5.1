// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'), // 10MB
  ALLOWED_TYPES: (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || '.pdf,.doc,.docx,.txt,.md').split(','),
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks
} as const;

// Application Configuration
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'RAG Chatbot UI',
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
} as const;

// Feature Flags
export const FEATURES = {
  FILE_UPLOAD: process.env.NEXT_PUBLIC_ENABLE_FILE_UPLOAD === 'true',
  EXPORT: process.env.NEXT_PUBLIC_ENABLE_EXPORT === 'true',
  SEARCH: process.env.NEXT_PUBLIC_ENABLE_SEARCH === 'true',
  DARK_MODE: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE === 'true',
} as const;

// Chat Configuration
export const CHAT_CONFIG = {
  MAX_MESSAGES_PER_CONVERSATION: 1000,
  MAX_MESSAGE_LENGTH: 4000,
  TYPING_INDICATOR_TIMEOUT: 3000,
  MESSAGE_RETRY_ATTEMPTS: 3,
  CONVERSATION_TITLE_LENGTH: 50,
} as const;

// WebSocket Events
export const WS_EVENTS = {
  // Client to Server
  JOIN_CONVERSATION: 'join_conversation',
  SEND_MESSAGE: 'send_message',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  DISCONNECT: 'disconnect',
  
  // Server to Client
  MESSAGE_RECEIVED: 'message_received',
  MESSAGE_CHUNK: 'message_chunk',
  MESSAGE_COMPLETE: 'message_complete',
  USER_TYPING: 'user_typing',
  ERROR: 'error',
  CONNECTION_STATUS: 'connection_status',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'chat_user_preferences',
  THEME: 'chat_theme',
  CONVERSATIONS: 'chat_conversations',
  DRAFT_MESSAGES: 'chat_draft_messages',
  SETTINGS: 'chat_settings',
} as const;

// Default Settings
export const DEFAULT_SETTINGS = {
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2000,
  enableStreaming: true,
  enableFileUpload: true,
  theme: 'system' as const,
  autoSave: true,
  showTimestamps: true,
  enableNotifications: true,
} as const;

// Export Formats
export const EXPORT_FORMATS = [
  { value: 'json', label: 'JSON', extension: '.json' },
  { value: 'markdown', label: 'Markdown', extension: '.md' },
  { value: 'txt', label: 'Plain Text', extension: '.txt' },
  { value: 'pdf', label: 'PDF', extension: '.pdf' },
] as const;

// Message Types
export const MESSAGE_TYPES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;

// UI Constants
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 320,
  MOBILE_BREAKPOINT: 768,
  DESKTOP_BREAKPOINT: 1024,
  MESSAGE_BUBBLE_MAX_WIDTH: '75%',
  SCROLL_THRESHOLD: 100,
  ANIMATION_DURATION: 200,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload PDF, DOC, DOCX, TXT, or MD files.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  MESSAGE_FAILED: 'Failed to send message. Please try again.',
  CONVERSATION_LOAD_FAILED: 'Failed to load conversation history.',
  EXPORT_FAILED: 'Failed to export conversation.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: 'File uploaded successfully',
  MESSAGE_SENT: 'Message sent',
  CONVERSATION_SAVED: 'Conversation saved',
  CONVERSATION_EXPORTED: 'Conversation exported successfully',
  SETTINGS_SAVED: 'Settings saved',
} as const;

// Regex Patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  MENTION: /@[\w\d_-]+/g,
  CODE_BLOCK: /```[\s\S]*?```/g,
  INLINE_CODE: /`[^`]+`/g,
} as const;