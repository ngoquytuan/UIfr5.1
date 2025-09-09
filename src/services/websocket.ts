import { io, Socket } from 'socket.io-client';
import { API_CONFIG, WS_EVENTS } from '@/constants';
import { useChatStore } from '@/stores/chatStore';
import { storage } from '@/utils';
import type { Message, WebSocketMessage } from '@/types';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.isConnecting || this.socket?.connected) {
      return;
    }

    this.isConnecting = true;
    const token = storage.get('auth_token', null);

    if (!token) {
      this.isConnecting = false;
      return;
    }

    try {
      this.socket = io(API_CONFIG.WS_URL, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: this.maxReconnectAttempts,
      });

      this.setupEventHandlers();
      this.isConnecting = false;
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.isConnecting = false;
      this.handleReconnection();
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      useChatStore.getState().setConnectionStatus(true);

      // Clear any pending reconnection timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      useChatStore.getState().setConnectionStatus(false);
      
      // Attempt to reconnect if not a manual disconnect
      if (reason !== 'io client disconnect') {
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      useChatStore.getState().setConnectionStatus(false);
      this.handleReconnection();
    });

    // Message events
    this.socket.on(WS_EVENTS.MESSAGE_RECEIVED, (data: Message) => {
      console.log('Message received:', data);
      useChatStore.getState().addMessage(data);
    });

    this.socket.on(WS_EVENTS.MESSAGE_CHUNK, (data: { 
      messageId: string; 
      chunk: string; 
      isComplete: boolean 
    }) => {
      console.log('Message chunk received:', data);
      // Handle streaming message chunks
      this.handleMessageChunk(data);
    });

    this.socket.on(WS_EVENTS.MESSAGE_COMPLETE, (data: Message) => {
      console.log('Message complete:', data);
      // Update the complete message
      this.handleMessageComplete(data);
    });

    // Typing events
    this.socket.on(WS_EVENTS.USER_TYPING, (data: { userId: string; isTyping: boolean }) => {
      const { addTypingUser, removeTypingUser } = useChatStore.getState();
      
      if (data.isTyping) {
        addTypingUser(data.userId);
      } else {
        removeTypingUser(data.userId);
      }
    });

    // Error handling
    this.socket.on(WS_EVENTS.ERROR, (error: { message: string; code?: string }) => {
      console.error('WebSocket error:', error);
      // Handle specific error types if needed
    });

    // Connection status updates
    this.socket.on(WS_EVENTS.CONNECTION_STATUS, (data: { status: string; message?: string }) => {
      console.log('Connection status update:', data);
    });
  }

  private handleMessageChunk(data: { messageId: string; chunk: string; isComplete: boolean }) {
    // For streaming messages, update the message content progressively
    const chatStore = useChatStore.getState();
    const messages = chatStore.messages;
    const messageIndex = messages.findIndex(m => m.id === data.messageId);

    if (messageIndex !== -1) {
      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: updatedMessages[messageIndex].content + data.chunk,
      };
      
      // Update the store directly (you might want to add an updateMessage action)
      chatStore.messages = updatedMessages;
    }
  }

  private handleMessageComplete(message: Message) {
    // Replace the streaming message with the complete version
    const chatStore = useChatStore.getState();
    const messages = chatStore.messages;
    const messageIndex = messages.findIndex(m => m.id === message.id);

    if (messageIndex !== -1) {
      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = message;
      
      // Update the store directly
      chatStore.messages = updatedMessages;
    } else {
      // Add as new message if not found
      chatStore.addMessage(message);
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Public methods
  public joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit(WS_EVENTS.JOIN_CONVERSATION, { conversationId });
    }
  }

  public sendMessage(conversationId: string, content: string, files?: string[]) {
    if (this.socket?.connected) {
      this.socket.emit(WS_EVENTS.SEND_MESSAGE, {
        conversationId,
        content,
        files,
      });
    }
  }

  public startTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit(WS_EVENTS.TYPING_START, { conversationId });
    }
  }

  public stopTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit(WS_EVENTS.TYPING_STOP, { conversationId });
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    useChatStore.getState().setConnectionStatus(false);
  }

  public reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

// Create and export singleton instance
export const wsService = new WebSocketService();
export default wsService;