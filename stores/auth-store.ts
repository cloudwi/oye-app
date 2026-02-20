import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from '@/services/secure-storage';
import type { AuthToken } from '@/types/auth';

const initialAuthState = {
  token: null as AuthToken | null,
  isAuthenticated: false,
  isLoading: false,
};

interface AuthState {
  token: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setToken: (token: AuthToken) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialAuthState,

      setToken: (token) =>
        set({ token, isAuthenticated: true, isLoading: false }),

      logout: () => set(initialAuthState),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
