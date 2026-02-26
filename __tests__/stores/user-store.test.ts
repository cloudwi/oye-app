import { useUserStore } from '@/stores/user-store';
import type { User } from '@/types/user';

const mockUser: User = {
  id: 1,
  provider: 'KAKAO',
  name: 'Test User',
  birthDate: '1990-01-15',
  birthTime: '08:30',
  gender: 'MALE',
  calendarType: 'SOLAR',
  occupation: 'Developer',
  mbti: 'INTJ',
  bloodType: 'A',
  interests: 'coding',
  createdAt: '2025-01-01T00:00:00Z',
};

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      user: null,
      onboarding: { completed: false, currentStep: 'welcome' },
    });
  });

  describe('setUser', () => {
    it('should set user', () => {
      useUserStore.getState().setUser(mockUser);
      expect(useUserStore.getState().user).toEqual(mockUser);
    });

    it('should set user to null', () => {
      useUserStore.getState().setUser(mockUser);
      useUserStore.getState().setUser(null);
      expect(useUserStore.getState().user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update existing user fields', () => {
      useUserStore.getState().setUser(mockUser);
      useUserStore.getState().updateUser({ name: 'Updated Name', mbti: 'ENFP' });

      const user = useUserStore.getState().user;
      expect(user?.name).toBe('Updated Name');
      expect(user?.mbti).toBe('ENFP');
      // Other fields remain unchanged
      expect(user?.id).toBe(1);
      expect(user?.birthDate).toBe('1990-01-15');
    });

    it('should create user from defaults when no user exists', () => {
      useUserStore.getState().updateUser({ name: 'New User' });

      const user = useUserStore.getState().user;
      expect(user).not.toBeNull();
      expect(user?.name).toBe('New User');
      expect(user?.id).toBe(0); // default
    });
  });

  describe('onboarding', () => {
    it('should have initial onboarding state', () => {
      const state = useUserStore.getState();
      expect(state.onboarding.completed).toBe(false);
      expect(state.onboarding.currentStep).toBe('welcome');
    });

    it('should set onboarding step', () => {
      useUserStore.getState().setOnboardingStep('birthdate');
      expect(useUserStore.getState().onboarding.currentStep).toBe('birthdate');
      expect(useUserStore.getState().onboarding.completed).toBe(false);
    });

    it('should complete onboarding', () => {
      useUserStore.getState().completeOnboarding();
      const onboarding = useUserStore.getState().onboarding;
      expect(onboarding.completed).toBe(true);
      expect(onboarding.currentStep).toBe('done');
    });
  });

  describe('reset', () => {
    it('should reset everything to initial state', () => {
      useUserStore.getState().setUser(mockUser);
      useUserStore.getState().completeOnboarding();

      useUserStore.getState().reset();

      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.onboarding.completed).toBe(false);
      expect(state.onboarding.currentStep).toBe('welcome');
    });
  });
});
