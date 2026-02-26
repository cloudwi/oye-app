import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthToken } from '@/types/auth';

// Mock auth service
jest.mock('@/services/auth', () => ({
  authService: {
    refreshToken: jest.fn(),
  },
}));

import { authService } from '@/services/auth';
import { apiClient } from '@/services/api/client';

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset auth store
    useAuthStore.setState({
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  describe('request interceptor', () => {
    it('should add Bearer token when token exists', async () => {
      const token: AuthToken = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };
      useAuthStore.getState().setToken(token);

      // Intercept the request before it's sent
      const requestInterceptor = (apiClient.interceptors.request as any).handlers[0];
      const config = {
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      const result = requestInterceptor.fulfilled(config);
      expect(result.headers.Authorization).toBe('Bearer test-access-token');
    });

    it('should not add Authorization header when no token', () => {
      const requestInterceptor = (apiClient.interceptors.request as any).handlers[0];
      const config = {
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      const result = requestInterceptor.fulfilled(config);
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor - data unwrapping', () => {
    it('should unwrap API response with success/data structure', () => {
      const responseInterceptor = (apiClient.interceptors.response as any).handlers[0];
      const response = {
        data: {
          success: true,
          data: { id: 1, name: 'test' },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const result = responseInterceptor.fulfilled(response);
      expect(result.data).toEqual({ id: 1, name: 'test' });
    });

    it('should pass through non-wrapped responses', () => {
      const responseInterceptor = (apiClient.interceptors.response as any).handlers[0];
      const response = {
        data: 'plain string',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const result = responseInterceptor.fulfilled(response);
      expect(result.data).toBe('plain string');
    });
  });

  describe('response interceptor - 401 handling', () => {
    it('should attempt token refresh on 401', async () => {
      const newToken: AuthToken = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      (authService.refreshToken as jest.Mock).mockResolvedValue(newToken);

      // Set initial token
      useAuthStore.getState().setToken({
        accessToken: 'old-token',
        refreshToken: 'old-refresh',
      });

      const responseInterceptor = (apiClient.interceptors.response as any).handlers[0];
      const error = new AxiosError(
        'Unauthorized',
        '401',
        undefined,
        {},
        {
          status: 401,
          data: { code: 'TOKEN_EXPIRED' },
          statusText: 'Unauthorized',
          headers: {},
          config: {
            headers: new AxiosHeaders(),
            url: '/api/users/me',
          } as InternalAxiosRequestConfig,
        }
      );
      (error.config as any) = {
        headers: new AxiosHeaders(),
        url: '/api/users/me',
        _retry: false,
      };

      // The interceptor calls apiClient with the retried config, so we mock it
      const originalRequest = jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: 'ok' });

      try {
        await responseInterceptor.rejected(error);
      } catch {
        // May reject depending on mock setup
      }

      expect(authService.refreshToken).toHaveBeenCalled();
    });

    it('should logout when refresh token endpoint itself fails', async () => {
      const logoutSpy = jest.fn();
      useAuthStore.setState({
        token: { accessToken: 'test', refreshToken: 'refresh' },
        isAuthenticated: true,
        isLoading: false,
        logout: logoutSpy,
        setToken: useAuthStore.getState().setToken,
        setLoading: useAuthStore.getState().setLoading,
      });

      const responseInterceptor = (apiClient.interceptors.response as any).handlers[0];
      const error = new AxiosError(
        'Unauthorized',
        '401',
        undefined,
        {},
        {
          status: 401,
          data: {},
          statusText: 'Unauthorized',
          headers: {},
          config: {
            headers: new AxiosHeaders(),
            url: '/api/auth/refresh',
          } as InternalAxiosRequestConfig,
        }
      );
      (error.config as any) = {
        headers: new AxiosHeaders(),
        url: '/api/auth/refresh',
      };

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
      expect(logoutSpy).toHaveBeenCalled();
    });

    it('should logout when refreshToken returns null', async () => {
      (authService.refreshToken as jest.Mock).mockResolvedValue(null);

      const logoutSpy = jest.fn();
      useAuthStore.setState({
        token: { accessToken: 'test', refreshToken: 'refresh' },
        isAuthenticated: true,
        isLoading: false,
        logout: logoutSpy,
        setToken: useAuthStore.getState().setToken,
        setLoading: useAuthStore.getState().setLoading,
      });

      const responseInterceptor = (apiClient.interceptors.response as any).handlers[0];
      const error = new AxiosError(
        'Unauthorized',
        '401',
        undefined,
        {},
        {
          status: 401,
          data: {},
          statusText: 'Unauthorized',
          headers: {},
          config: {
            headers: new AxiosHeaders(),
            url: '/api/users/me',
          } as InternalAxiosRequestConfig,
        }
      );
      (error.config as any) = {
        headers: new AxiosHeaders(),
        url: '/api/users/me',
        _retry: false,
      };

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
      expect(authService.refreshToken).toHaveBeenCalled();
      expect(logoutSpy).toHaveBeenCalled();
    });
  });

  describe('response interceptor - error code handling', () => {
    it('should logout on USER_NOT_FOUND (404)', async () => {
      const logoutSpy = jest.fn();
      useAuthStore.setState({
        token: { accessToken: 'test' },
        isAuthenticated: true,
        isLoading: false,
        logout: logoutSpy,
        setToken: useAuthStore.getState().setToken,
        setLoading: useAuthStore.getState().setLoading,
      });

      const responseInterceptor = (apiClient.interceptors.response as any).handlers[0];
      const error = new AxiosError(
        'Not Found',
        '404',
        undefined,
        {},
        {
          status: 404,
          data: { code: 'USER_NOT_FOUND', message: 'User not found' },
          statusText: 'Not Found',
          headers: {},
          config: {
            headers: new AxiosHeaders(),
            url: '/api/users/me',
            _retry: true,
          } as InternalAxiosRequestConfig,
        }
      );
      (error.config as any) = {
        headers: new AxiosHeaders(),
        url: '/api/users/me',
        _retry: true,
      };

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
      expect(logoutSpy).toHaveBeenCalled();
    });

    it('should not logout on regular 404', async () => {
      const logoutSpy = jest.fn();
      useAuthStore.setState({
        token: { accessToken: 'test' },
        isAuthenticated: true,
        isLoading: false,
        logout: logoutSpy,
        setToken: useAuthStore.getState().setToken,
        setLoading: useAuthStore.getState().setLoading,
      });

      const responseInterceptor = (apiClient.interceptors.response as any).handlers[0];
      const error = new AxiosError(
        'Not Found',
        '404',
        undefined,
        {},
        {
          status: 404,
          data: { code: 'RESOURCE_NOT_FOUND', message: 'Not found' },
          statusText: 'Not Found',
          headers: {},
          config: {
            headers: new AxiosHeaders(),
            url: '/api/fortune/today',
            _retry: true,
          } as InternalAxiosRequestConfig,
        }
      );
      (error.config as any) = {
        headers: new AxiosHeaders(),
        url: '/api/fortune/today',
        _retry: true,
      };

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
      expect(logoutSpy).not.toHaveBeenCalled();
    });
  });
});
