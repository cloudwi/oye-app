import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthToken } from '@/types/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.226.225:8080';
const KAKAO_LOGIN_PATH = '/api/auth/login/kakao';
const NATIVE_CALLBACK_SCHEME = 'oyeapp://auth/callback';

export const authService = {
  /**
   * 카카오 로그인 시작 (플랫폼별 분기)
   */
  async loginWithKakao(): Promise<AuthToken | null> {
    if (Platform.OS === 'web') {
      return this.loginWithKakaoWeb();
    }
    return this.loginWithKakaoNative();
  },

  /**
   * 네이티브: expo-web-browser로 OAuth 수행
   */
  async loginWithKakaoNative(): Promise<AuthToken | null> {
    try {
      const redirectUri = NATIVE_CALLBACK_SCHEME;
      const loginUrl = `${API_BASE_URL}${KAKAO_LOGIN_PATH}?redirect_uri=${encodeURIComponent(redirectUri)}&platform=native`;

      const result = await WebBrowser.openAuthSessionAsync(loginUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const token = this.parseTokenFromUrl(result.url);
        if (token) {
          useAuthStore.getState().setToken(token);
          return token;
        }
      }

      return null;
    } catch (error) {
      console.error('Kakao native login error:', error);
      return null;
    }
  },

  /**
   * 웹: 백엔드 OAuth URL로 리다이렉트
   */
  async loginWithKakaoWeb(): Promise<null> {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const redirectUri = `${origin}/auth/callback`;
    const loginUrl = `${API_BASE_URL}${KAKAO_LOGIN_PATH}?redirect_uri=${encodeURIComponent(redirectUri)}&platform=web`;

    if (typeof window !== 'undefined') {
      window.location.href = loginUrl;
    }

    // 웹에서는 페이지 리다이렉트이므로 null 반환 (콜백 페이지에서 토큰 처리)
    return null;
  },

  /**
   * URL에서 토큰 파라미터 추출
   */
  parseTokenFromUrl(url: string): AuthToken | null {
    try {
      const parsed = Linking.parse(url);
      const params = parsed.queryParams;

      if (!params?.token) {
        return null;
      }

      return {
        accessToken: params.token as string,
        refreshToken: (params.refresh_token as string) || undefined,
        expiresAt: params.expires_at ? Number(params.expires_at) : undefined,
      };
    } catch (error) {
      console.error('Token parsing error:', error);
      return null;
    }
  },

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<AuthToken | null> {
    try {
      const currentToken = useAuthStore.getState().token;
      if (!currentToken?.refreshToken) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentToken.refreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const newToken: AuthToken = {
        accessToken: data.accessToken || data.token,
        refreshToken: data.refreshToken || currentToken.refreshToken,
        expiresAt: data.expiresAt,
      };

      useAuthStore.getState().setToken(newToken);
      return newToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  },
};
