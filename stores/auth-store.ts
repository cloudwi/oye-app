import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthToken } from '@/types/auth';

interface AuthState {
  token: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setToken: (token: AuthToken) => void;
  clearToken: () => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setToken: (token) =>
        set({ token, isAuthenticated: true, isLoading: false }),

      clearToken: () =>
        set({ token: null, isAuthenticated: false, isLoading: false }),

      logout: () =>
        set({ token: null, isAuthenticated: false, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
