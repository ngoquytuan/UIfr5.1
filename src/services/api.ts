import { API_CONFIG } from '@/constants';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  Conversation, 
  Message, 
  FileUpload,
  User,
  ExportOptions,
  SearchFilters 
} from '@/types';

class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication
  async login(credentials: { username: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/auth/me');
  }

  // Conversations
  async getConversations(page = 1, limit = 20): Promise<PaginatedResponse<Conversation>> {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString() 
    });
    
    return this.request(`/conversations?${params}`);
  }

  async getConversation(id: string): Promise<ApiResponse<Conversation>> {
    return this.request(`/conversations/${id}`);
  }

  async createConversation(title?: string): Promise<ApiResponse<Conversation>> {
    return this.request('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<ApiResponse<Conversation>> {
    return this.request(`/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteConversation(id: string): Promise<ApiResponse<void>> {
    return this.request(`/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  // Messages
  async getMessages(conversationId: string, page = 1, limit = 50): Promise<PaginatedResponse<Message>> {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString() 
    });
    
    return this.request(`/conversations/${conversationId}/messages?${params}`);
  }

  async sendMessage(conversationId: string, content: string, files?: string[]): Promise<ApiResponse<Message>> {
    return this.request(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, files }),
    });
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<ApiResponse<void>> {
    return this.request(`/conversations/${conversationId}/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  // File Upload
  async uploadFile(file: File, conversationId?: string): Promise<ApiResponse<FileUpload>> {
    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) {
      formData.append('conversationId', conversationId);
    }

    return this.request('/files/upload', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it with boundary
      body: formData,
    });
  }

  async getFileStatus(fileId: string): Promise<ApiResponse<FileUpload>> {
    return this.request(`/files/${fileId}/status`);
  }

  async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  // Search
  async searchMessages(filters: SearchFilters): Promise<PaginatedResponse<Message>> {
    const params = new URLSearchParams();
    
    if (filters.query) params.append('q', filters.query);
    if (filters.conversationId) params.append('conversationId', filters.conversationId);
    if (filters.messageType) params.append('type', filters.messageType);
    if (filters.hasFiles !== undefined) params.append('hasFiles', filters.hasFiles.toString());
    if (filters.dateRange?.start) params.append('startDate', filters.dateRange.start.toISOString());
    if (filters.dateRange?.end) params.append('endDate', filters.dateRange.end.toISOString());

    return this.request(`/search/messages?${params}`);
  }

  async searchConversations(query: string): Promise<PaginatedResponse<Conversation>> {
    const params = new URLSearchParams({ q: query });
    return this.request(`/search/conversations?${params}`);
  }

  // Export
  async exportConversation(conversationId: string, options: ExportOptions): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request(`/conversations/${conversationId}/export`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async exportConversations(conversationIds: string[], options: ExportOptions): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request('/conversations/export', {
      method: 'POST',
      body: JSON.stringify({ conversationIds, options }),
    });
  }

  // Settings
  async getUserSettings(): Promise<ApiResponse<any>> {
    return this.request('/settings');
  }

  async updateUserSettings(settings: any): Promise<ApiResponse<any>> {
    return this.request('/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }
}

// Create and export singleton instance
export const apiService = new ApiService();
export default apiService;