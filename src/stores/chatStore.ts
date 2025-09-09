import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { apiService } from '@/services/api';
import { storage } from '@/utils';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/constants';
import type { 
  Conversation, 
  Message, 
  ChatSettings, 
  FileUpload,
  SearchFilters 
} from '@/types';

interface ChatState {
  // Conversations
  conversations: Conversation[];
  currentConversation: Conversation | null;
  conversationsLoading: boolean;
  conversationsError: string | null;
  
  // Messages
  messages: Message[];
  messagesLoading: boolean;
  messagesError: string | null;
  
  // Real-time state
  isConnected: boolean;
  isTyping: boolean;
  typingUsers: string[];
  
  // UI state
  sidebarOpen: boolean;
  searchQuery: string;
  selectedMessages: string[];
  
  // Settings
  settings: ChatSettings;
  theme: 'light' | 'dark' | 'system';
  
  // File uploads
  uploadingFiles: FileUpload[];
}

interface ChatActions {
  // Conversations
  loadConversations: () => Promise<void>;
  createConversation: (title?: string) => Promise<Conversation | null>;
  selectConversation: (conversationId: string) => Promise<void>;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  
  // Messages
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, files?: string[]) => Promise<void>;
  addMessage: (message: Message) => void;
  deleteMessage: (messageId: string) => Promise<void>;
  
  // Real-time
  setConnectionStatus: (connected: boolean) => void;
  setTypingStatus: (typing: boolean) => void;
  addTypingUser: (userId: string) => void;
  removeTypingUser: (userId: string) => void;
  
  // UI actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  toggleMessageSelection: (messageId: string) => void;
  clearMessageSelection: () => void;
  
  // Settings
  updateSettings: (settings: Partial<ChatSettings>) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // File uploads
  addUploadingFile: (file: FileUpload) => void;
  updateUploadingFile: (fileId: string, updates: Partial<FileUpload>) => void;
  removeUploadingFile: (fileId: string) => void;
  
  // Search
  searchMessages: (filters: SearchFilters) => Promise<Message[]>;
  
  // Clear state
  clearError: () => void;
  reset: () => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        conversations: [],
        currentConversation: null,
        conversationsLoading: false,
        conversationsError: null,
        
        messages: [],
        messagesLoading: false,
        messagesError: null,
        
        isConnected: false,
        isTyping: false,
        typingUsers: [],
        
        sidebarOpen: true,
        searchQuery: '',
        selectedMessages: [],
        
        settings: DEFAULT_SETTINGS,
        theme: 'system',
        
        uploadingFiles: [],

        // Actions
        loadConversations: async () => {
          set({ conversationsLoading: true, conversationsError: null });

          try {
            const response = await apiService.getConversations();

            if (response.success && response.data) {
              set({
                conversations: response.data,
                conversationsLoading: false,
                conversationsError: null,
              });
            } else {
              set({
                conversationsLoading: false,
                conversationsError: response.error || 'Failed to load conversations',
              });
            }
          } catch (error) {
            set({
              conversationsLoading: false,
              conversationsError: error instanceof Error ? error.message : 'Failed to load conversations',
            });
          }
        },

        createConversation: async (title) => {
          try {
            const response = await apiService.createConversation(title);

            if (response.success && response.data) {
              const newConversation = response.data;
              
              set((state) => ({
                conversations: [newConversation, ...state.conversations],
                currentConversation: newConversation,
                messages: [],
              }));

              return newConversation;
            }
          } catch (error) {
            console.error('Failed to create conversation:', error);
          }
          
          return null;
        },

        selectConversation: async (conversationId) => {
          const { conversations } = get();
          const conversation = conversations.find(c => c.id === conversationId);
          
          if (conversation) {
            set({ 
              currentConversation: conversation,
              selectedMessages: [],
            });
            
            // Load messages for this conversation
            await get().loadMessages(conversationId);
          }
        },

        updateConversation: async (conversationId, updates) => {
          try {
            const response = await apiService.updateConversation(conversationId, updates);

            if (response.success && response.data) {
              set((state) => ({
                conversations: state.conversations.map(c => 
                  c.id === conversationId ? { ...c, ...updates } : c
                ),
                currentConversation: state.currentConversation?.id === conversationId 
                  ? { ...state.currentConversation, ...updates }
                  : state.currentConversation,
              }));
            }
          } catch (error) {
            console.error('Failed to update conversation:', error);
          }
        },

        deleteConversation: async (conversationId) => {
          try {
            const response = await apiService.deleteConversation(conversationId);

            if (response.success) {
              set((state) => ({
                conversations: state.conversations.filter(c => c.id !== conversationId),
                currentConversation: state.currentConversation?.id === conversationId 
                  ? null 
                  : state.currentConversation,
                messages: state.currentConversation?.id === conversationId ? [] : state.messages,
              }));
            }
          } catch (error) {
            console.error('Failed to delete conversation:', error);
          }
        },

        loadMessages: async (conversationId) => {
          set({ messagesLoading: true, messagesError: null });

          try {
            const response = await apiService.getMessages(conversationId);

            if (response.success && response.data) {
              set({
                messages: response.data,
                messagesLoading: false,
                messagesError: null,
              });
            } else {
              set({
                messagesLoading: false,
                messagesError: response.error || 'Failed to load messages',
              });
            }
          } catch (error) {
            set({
              messagesLoading: false,
              messagesError: error instanceof Error ? error.message : 'Failed to load messages',
            });
          }
        },

        sendMessage: async (content, files) => {
          const { currentConversation } = get();
          if (!currentConversation) return;

          try {
            const response = await apiService.sendMessage(currentConversation.id, content, files);

            if (response.success && response.data) {
              get().addMessage(response.data);
            }
          } catch (error) {
            console.error('Failed to send message:', error);
          }
        },

        addMessage: (message) => {
          set((state) => ({
            messages: [...state.messages, message],
          }));
        },

        deleteMessage: async (messageId) => {
          const { currentConversation } = get();
          if (!currentConversation) return;

          try {
            const response = await apiService.deleteMessage(currentConversation.id, messageId);

            if (response.success) {
              set((state) => ({
                messages: state.messages.filter(m => m.id !== messageId),
              }));
            }
          } catch (error) {
            console.error('Failed to delete message:', error);
          }
        },

        setConnectionStatus: (connected) => {
          set({ isConnected: connected });
        },

        setTypingStatus: (typing) => {
          set({ isTyping: typing });
        },

        addTypingUser: (userId) => {
          set((state) => ({
            typingUsers: state.typingUsers.includes(userId) 
              ? state.typingUsers 
              : [...state.typingUsers, userId],
          }));
        },

        removeTypingUser: (userId) => {
          set((state) => ({
            typingUsers: state.typingUsers.filter(id => id !== userId),
          }));
        },

        toggleSidebar: () => {
          set((state) => ({ sidebarOpen: !state.sidebarOpen }));
        },

        setSidebarOpen: (open) => {
          set({ sidebarOpen: open });
        },

        setSearchQuery: (query) => {
          set({ searchQuery: query });
        },

        toggleMessageSelection: (messageId) => {
          set((state) => ({
            selectedMessages: state.selectedMessages.includes(messageId)
              ? state.selectedMessages.filter(id => id !== messageId)
              : [...state.selectedMessages, messageId],
          }));
        },

        clearMessageSelection: () => {
          set({ selectedMessages: [] });
        },

        updateSettings: (newSettings) => {
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          }));
        },

        setTheme: (theme) => {
          set({ theme });
          storage.set(STORAGE_KEYS.THEME, theme);
        },

        addUploadingFile: (file) => {
          set((state) => ({
            uploadingFiles: [...state.uploadingFiles, file],
          }));
        },

        updateUploadingFile: (fileId, updates) => {
          set((state) => ({
            uploadingFiles: state.uploadingFiles.map(f => 
              f.id === fileId ? { ...f, ...updates } : f
            ),
          }));
        },

        removeUploadingFile: (fileId) => {
          set((state) => ({
            uploadingFiles: state.uploadingFiles.filter(f => f.id !== fileId),
          }));
        },

        searchMessages: async (filters) => {
          try {
            const response = await apiService.searchMessages(filters);
            return response.success && response.data ? response.data : [];
          } catch (error) {
            console.error('Search failed:', error);
            return [];
          }
        },

        clearError: () => {
          set({ 
            conversationsError: null, 
            messagesError: null 
          });
        },

        reset: () => {
          set({
            conversations: [],
            currentConversation: null,
            messages: [],
            isConnected: false,
            isTyping: false,
            typingUsers: [],
            selectedMessages: [],
            uploadingFiles: [],
            conversationsError: null,
            messagesError: null,
          });
        },
      }),
      {
        name: 'chat-store',
        partialize: (state) => ({
          conversations: state.conversations,
          settings: state.settings,
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    { name: 'chat-store' }
  )
);

// Selectors
export const useCurrentConversation = () => useChatStore((state) => state.currentConversation);
export const useMessages = () => useChatStore((state) => state.messages);
export const useConversations = () => useChatStore((state) => state.conversations);
export const useChatSettings = () => useChatStore((state) => state.settings);
export const useTheme = () => useChatStore((state) => state.theme);
export const useConnectionStatus = () => useChatStore((state) => state.isConnected);