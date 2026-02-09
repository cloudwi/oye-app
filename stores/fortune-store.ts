import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Fortune } from '@/types/fortune';

interface FortuneState {
  todayFortune: Fortune | null;
  history: Fortune[];
  isLoading: boolean;
  isLoadingHistory: boolean;
  error: string | null;

  // Actions
  setTodayFortune: (fortune: Fortune | null) => void;
  setHistory: (fortunes: Fortune[]) => void;
  setLoading: (loading: boolean) => void;
  setLoadingHistory: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useFortuneStore = create<FortuneState>()(
  persist(
    (set) => ({
      todayFortune: null,
      history: [],
      isLoading: false,
      isLoadingHistory: false,
      error: null,

      setTodayFortune: (fortune) => set({ todayFortune: fortune }),
      setHistory: (fortunes) => set({ history: fortunes }),
      setLoading: (isLoading) => set({ isLoading }),
      setLoadingHistory: (isLoadingHistory) => set({ isLoadingHistory }),
      setError: (error) => set({ error }),

      reset: () =>
        set({
          todayFortune: null,
          history: [],
          isLoading: false,
          isLoadingHistory: false,
          error: null,
        }),
    }),
    {
      name: 'fortune-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        todayFortune: state.todayFortune,
        history: state.history.slice(0, 30),
      }),
    }
  )
);
