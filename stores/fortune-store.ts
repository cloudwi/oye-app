import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Fortune, FortuneHistory } from '@/types/fortune';

interface FortuneState {
  todayFortune: Fortune | null;
  history: Fortune[];
  selectedFortune: Fortune | null;
  isLoading: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  hasMoreHistory: boolean;
  historyPage: number;

  // Actions
  setTodayFortune: (fortune: Fortune | null) => void;
  setHistory: (history: FortuneHistory) => void;
  appendHistory: (history: FortuneHistory) => void;
  setSelectedFortune: (fortune: Fortune | null) => void;
  setLoading: (loading: boolean) => void;
  setLoadingHistory: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearHistory: () => void;
  reset: () => void;
}

export const useFortuneStore = create<FortuneState>()(
  persist(
    (set) => ({
      todayFortune: null,
      history: [],
      selectedFortune: null,
      isLoading: false,
      isLoadingHistory: false,
      error: null,
      hasMoreHistory: true,
      historyPage: 1,

      setTodayFortune: (fortune) => set({ todayFortune: fortune }),

      setHistory: (history) =>
        set({
          history: history.fortunes,
          hasMoreHistory: history.hasMore,
          historyPage: history.nextPage ?? 1,
        }),

      appendHistory: (history) =>
        set((state) => ({
          history: [...state.history, ...history.fortunes],
          hasMoreHistory: history.hasMore,
          historyPage: history.nextPage ?? state.historyPage,
        })),

      setSelectedFortune: (fortune) => set({ selectedFortune: fortune }),
      setLoading: (isLoading) => set({ isLoading }),
      setLoadingHistory: (isLoadingHistory) => set({ isLoadingHistory }),
      setError: (error) => set({ error }),

      clearHistory: () =>
        set({
          history: [],
          hasMoreHistory: true,
          historyPage: 1,
        }),

      reset: () =>
        set({
          todayFortune: null,
          history: [],
          selectedFortune: null,
          isLoading: false,
          isLoadingHistory: false,
          error: null,
          hasMoreHistory: true,
          historyPage: 1,
        }),
    }),
    {
      name: 'fortune-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        todayFortune: state.todayFortune,
        history: state.history.slice(0, 30), // Keep last 30 fortunes cached
      }),
    }
  )
);
