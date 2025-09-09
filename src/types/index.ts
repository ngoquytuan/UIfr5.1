// Core application types
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant' | 'system';
  timestamp: Date;
  conversationId: string;
  userId?: string;
  metadata?: {
    files?: FileUpload[];
    tokens?: number;
    model?: string;
    sources?: string[];
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isActive: boolean;
  metadata?: {
    totalTokens?: number;
    model?: string;
    summary?: string;
  };
}

export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  status: 'uploading' | 'uploaded' | 'processing' | 'processed' | 'error';
  metadata?: {
    pages?: number;
    extractedText?: string;
    processingError?: string;
  };
}

export interface ChatSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  enableStreaming: boolean;
  enableFileUpload: boolean;
}

export interface ExportOptions {
  format: 'json' | 'markdown' | 'pdf' | 'txt';
  includeMetadata: boolean;
  includeFiles: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchFilters {
  query?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  messageType?: Message['type'];
  hasFiles?: boolean;
  conversationId?: string;
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'status' | 'error' | 'file_upload';
  data: any;
  timestamp: Date;
  conversationId?: string;
}

export interface AppState {
  user: User | null;
  currentConversation: Conversation | null;
  conversations: Conversation[];
  isConnected: boolean;
  isTyping: boolean;
  settings: ChatSettings;
  theme: 'light' | 'dark' | 'system';
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Component props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  error?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}