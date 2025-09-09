import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { apiService } from '@/services/api';
import { storage } from '@/utils';
import { STORAGE_KEYS } from '@/constants';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,

        // Actions
        login: async (credentials) => {
          set({ isLoading: true, error: null });

          try {
            const response = await apiService.login(credentials);

            if (response.success && response.data) {
              const { user, token } = response.data;
              
              // Store token in localStorage for API requests
              storage.set('auth_token', token);
              
              set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });

              return true;
            } else {
              set({
                isLoading: false,
                error: response.error || 'Login failed',
              });
              return false;
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            set({
              isLoading: false,
              error: errorMessage,
            });
            return false;
          }
        },

        logout: async () => {
          set({ isLoading: true });

          try {
            await apiService.logout();
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            // Clear all auth data regardless of API call result
            storage.remove('auth_token');
            storage.remove(STORAGE_KEYS.USER_PREFERENCES);
            storage.remove(STORAGE_KEYS.CONVERSATIONS);
            
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        getCurrentUser: async () => {
          const token = storage.get('auth_token', null);
          if (!token) {
            set({ isAuthenticated: false });
            return;
          }

          set({ isLoading: true });

          try {
            const response = await apiService.getCurrentUser();

            if (response.success && response.data) {
              set({
                user: response.data,
                token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              // Token is invalid, clear auth data
              storage.remove('auth_token');
              set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              });
            }
          } catch (error) {
            console.error('Get current user error:', error);
            storage.remove('auth_token');
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        clearError: () => {
          set({ error: null });
        },

        setUser: (user) => {
          set({ user });
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);

// Selectors for easier component usage
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);