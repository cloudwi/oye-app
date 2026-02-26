import { useAuthStore } from '@/stores/auth-store';
import type { AuthToken } from '@/types/auth';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.setState({
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('should have correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  describe('setToken', () => {
    it('should set token and mark as authenticated', () => {
      const token: AuthToken = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: Date.now() + 3600000,
      };

      useAuthStore.getState().setToken(token);

      const state = useAuthStore.getState();
      expect(state.token).toEqual(token);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should set token with isNewUser flag', () => {
      const token: AuthToken = {
        accessToken: 'test-access-token',
        isNewUser: true,
      };

      useAuthStore.getState().setToken(token);

      const state = useAuthStore.getState();
      expect(state.token?.isNewUser).toBe(true);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should overwrite previous token', () => {
      const oldToken: AuthToken = { accessToken: 'old-token' };
      const newToken: AuthToken = { accessToken: 'new-token' };

      useAuthStore.getState().setToken(oldToken);
      useAuthStore.getState().setToken(newToken);

      expect(useAuthStore.getState().token?.accessToken).toBe('new-token');
    });
  });

  describe('logout', () => {
    it('should clear token and mark as unauthenticated', () => {
      const token: AuthToken = {
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
      };
      useAuthStore.getState().setToken(token);

      // Verify authenticated
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
