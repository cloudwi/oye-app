import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/auth';

interface ApiErrorData {
  code?: string;
  message?: string;
}

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

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
  resolve: (value: string | null) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// 로그아웃이 필요한 에러인지 판별
function shouldLogout(error: AxiosError): boolean {
  const status = error.response?.status;
  const code = (error.response?.data as ApiErrorData)?.code;

  // 토큰 관련 에러만 로그아웃
  if (status === 401 && code === 'TOKEN_EXPIRED') return true;
  if (status === 401 && code === 'INVALID_TOKEN') return true;
  // 서버에서 사용자를 찾을 수 없는 경우 (탈퇴 등)
  if (status === 404 && code === 'USER_NOT_FOUND') return true;

  return false;
}

apiClient.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      response.data = data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig;

    // 401: 토큰 갱신 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 토큰 갱신 엔드포인트 자체의 실패는 바로 로그아웃
      if (originalRequest.url?.includes('/api/v1/auth/refresh')) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

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

    // USER_NOT_FOUND만 로그아웃 (다른 404는 무시)
    if (shouldLogout(error)) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    if (error.response) {
      console.error('API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// 에러 메시지를 사람이 읽을 수 있는 한국어로 변환
export function getUserFriendlyError(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;

  const axiosError = error as AxiosError;

  // 401은 내부에서 처리 (토큰 갱신)
  if (axiosError.response?.status === 401) return null;
  // USER_NOT_FOUND는 로그아웃으로 처리
  if (
    axiosError.response?.status === 404 &&
    (axiosError.response?.data as ApiErrorData)?.code === 'USER_NOT_FOUND'
  ) return null;

  // 타임아웃
  if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
    return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
  }

  // 네트워크 없음
  if (!axiosError.response) {
    return '인터넷 연결을 확인해주세요.';
  }

  const status = axiosError.response.status;
  const serverMessage = (axiosError.response.data as ApiErrorData)?.message;
  const code = (axiosError.response.data as ApiErrorData)?.code;

  // 서버가 보낸 한국어 메시지가 있으면 그대로 사용
  if (serverMessage && typeof serverMessage === 'string') {
    return serverMessage;
  }

  // 상태 코드별 기본 메시지
  if (status === 400) return '잘못된 요청입니다. 입력 내용을 확인해주세요.';
  if (status === 403) return '권한이 없습니다.';
  if (status === 404) return '요청한 정보를 찾을 수 없습니다.';
  if (status === 409) return '이미 처리된 요청입니다.';
  if (status === 429) return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  if (status >= 500) return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';

  return null;
}
