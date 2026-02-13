import axios, { AxiosError } from 'axios';
import { Alert, Platform } from 'react-native';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.yegam.today';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Bearer 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token?.accessToken) {
      config.headers.Authorization = `Bearer ${token.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: 401 시 토큰 갱신 시도
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await authService.refreshToken();
        if (newToken) {
          processQueue(null, newToken.accessToken);
          originalRequest.headers.Authorization = `Bearer ${newToken.accessToken}`;
          return apiClient(originalRequest);
        } else {
          processQueue(error);
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // USER_NOT_FOUND: 서버 재시작 등으로 사용자가 없는 경우 → 로그아웃
    if (error.response?.status === 404 && error.response?.data?.code === 'USER_NOT_FOUND') {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    // User-facing error messages
    const userMessage = getErrorMessage(error);
    if (userMessage) {
      if (Platform.OS === 'web') {
        // On web, use window.alert as a simple fallback
        if (typeof window !== 'undefined') window.alert(userMessage);
      } else {
        Alert.alert('오류', userMessage);
      }
    }

    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

function getErrorMessage(error: AxiosError): string | null {
  // Don't show alert for 401 (handled by token refresh / logout)
  if (error.response?.status === 401) return null;
  // Don't show alert for USER_NOT_FOUND (handled by logout)
  if (
    error.response?.status === 404 &&
    (error.response?.data as any)?.code === 'USER_NOT_FOUND'
  )
    return null;

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return '요청 시간이 초과되었습니다';
  }

  if (!error.response) {
    return '인터넷 연결을 확인해주세요';
  }

  const status = error.response.status;
  if (status >= 500) {
    return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요';
  }

  return null;
}
