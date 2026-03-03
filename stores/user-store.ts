import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, OnboardingState } from '@/types/user';

interface UserState {
  user: User | null;
  onboarding: OnboardingState;

  // Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setOnboardingStep: (step: OnboardingState['currentStep']) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

const initialOnboarding: OnboardingState = {
  completed: false,
  currentStep: 'welcome',
};

const defaultUser: User = {
  id: 0,
  provider: null,
  name: '',
  birthDate: null,
  birthTime: null,
  gender: null,
  calendarType: null,
  occupation: null,
  mbti: null,
  bloodType: null,
  interests: null,
  role: 'USER',
  fortuneScheduleHour: 6,
  createdAt: new Date().toISOString(),
};

const initialState = {
  user: null as User | null,
  onboarding: initialOnboarding,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, ...updates }
            : { ...defaultUser, ...updates },
        })),

      setOnboardingStep: (step) =>
        set((state) => ({
          onboarding: { ...state.onboarding, currentStep: step },
        })),

      completeOnboarding: () =>
        set({
          onboarding: { completed: true, currentStep: 'done' },
        }),

      reset: () => set(initialState),
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
