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

  // Pagination
  historyPage: number;
  hasMoreHistory: boolean;
  isLoadingMore: boolean;

  // Actions
  setTodayFortune: (fortune: Fortune | null) => void;
  setHistory: (fortunes: Fortune[]) => void;
  appendHistory: (fortunes: Fortune[]) => void;
  setLoading: (loading: boolean) => void;
  setLoadingHistory: (loading: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  setHistoryPage: (page: number) => void;
  setHasMoreHistory: (hasMore: boolean) => void;
  setError: (error: string | null) => void;
  resetHistory: () => void;
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
      historyPage: 0,
      hasMoreHistory: true,
      isLoadingMore: false,

      setTodayFortune: (fortune) => set({ todayFortune: fortune }),
      setHistory: (fortunes) => set({ history: fortunes }),
      appendHistory: (fortunes) =>
        set((state) => ({ history: [...state.history, ...fortunes] })),
      setLoading: (isLoading) => set({ isLoading }),
      setLoadingHistory: (isLoadingHistory) => set({ isLoadingHistory }),
      setLoadingMore: (isLoadingMore) => set({ isLoadingMore }),
      setHistoryPage: (historyPage) => set({ historyPage }),
      setHasMoreHistory: (hasMoreHistory) => set({ hasMoreHistory }),
      setError: (error) => set({ error }),

      resetHistory: () =>
        set({
          history: [],
          historyPage: 0,
          hasMoreHistory: true,
          isLoadingMore: false,
          isLoadingHistory: false,
        }),

      reset: () =>
        set({
          todayFortune: null,
          history: [],
          isLoading: false,
          isLoadingHistory: false,
          error: null,
          historyPage: 0,
          hasMoreHistory: true,
          isLoadingMore: false,
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
