import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, OnboardingState, Gender, CalendarType } from '@/types/user';

interface UserState {
  user: User | null;
  onboarding: OnboardingState;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setBirthDate: (birthDate: string) => void;
  setGender: (gender: Gender) => void;
  setCalendarType: (calendarType: CalendarType) => void;
  setOnboardingStep: (step: OnboardingState['currentStep']) => void;
  completeOnboarding: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialOnboarding: OnboardingState = {
  completed: false,
  currentStep: 'welcome',
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      onboarding: initialOnboarding,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setBirthDate: (birthDate) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, birthDate }
            : {
                id: 0,
                kakaoId: '',
                name: '',
                birthDate,
                gender: null,
                calendarType: null,
                createdAt: new Date().toISOString(),
              },
        })),

      setGender: (gender) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, gender }
            : {
                id: 0,
                kakaoId: '',
                name: '',
                birthDate: null,
                gender,
                calendarType: null,
                createdAt: new Date().toISOString(),
              },
        })),

      setCalendarType: (calendarType) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, calendarType }
            : {
                id: 0,
                kakaoId: '',
                name: '',
                birthDate: null,
                gender: null,
                calendarType,
                createdAt: new Date().toISOString(),
              },
        })),

      setOnboardingStep: (step) =>
        set((state) => ({
          onboarding: { ...state.onboarding, currentStep: step },
        })),

      completeOnboarding: () =>
        set({
          onboarding: { completed: true, currentStep: 'done' },
        }),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      reset: () =>
        set({
          user: null,
          onboarding: initialOnboarding,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        onboarding: state.onboarding,
      }),
    }
  )
);
