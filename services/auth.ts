import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthToken } from '@/types/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.yegam.today';
const KAKAO_LOGIN_PATH = '/api/v1/auth/login/kakao';
const KAKAO_NATIVE_LOGIN_PATH = '/api/v1/auth/login/kakao/native';
const APPLE_LOGIN_PATH = '/api/v1/auth/login/apple';
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
   * 네이티브: 카카오 SDK로 로그인 → 백엔드에서 JWT 발급
   */
  async loginWithKakaoNative(): Promise<AuthToken | null> {
    try {
      let kakaoLogin: (() => Promise<{ accessToken: string }>) | null = null;
      try {
        const kakaoModule = require('@react-native-seoul/kakao-login');
        kakaoLogin = kakaoModule?.login ?? kakaoModule?.default?.login ?? null;
      } catch {}
      if (!kakaoLogin) {
        return this.loginWithKakaoBrowser();
      }
      const result = await kakaoLogin();

      const response = await fetch(`${API_BASE_URL}${KAKAO_NATIVE_LOGIN_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: result.accessToken }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const token: AuthToken = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        isNewUser: data.isNewUser,
      };

      useAuthStore.getState().setToken(token);
      return token;
    } catch (error) {
      console.error('Kakao native login error, falling back to browser:', error);
      return this.loginWithKakaoBrowser();
    }
  },

  /**
   * 네이티브 폴백: 브라우저로 OAuth 수행 (stateless, 세션 불필요)
   */
  async loginWithKakaoBrowser(): Promise<AuthToken | null> {
    try {
      const callbackUri = NATIVE_CALLBACK_SCHEME;
      const loginUrl = `${API_BASE_URL}/api/v1/auth/login/kakao/browser?callback_uri=${encodeURIComponent(callbackUri)}`;

      const result = await WebBrowser.openAuthSessionAsync(loginUrl, callbackUri);

      if (result.type === 'success' && result.url) {
        const token = this.parseTokenFromUrl(result.url);
        if (token) {
          useAuthStore.getState().setToken(token);
          return token;
        }
      }

      return null;
    } catch (error) {
      console.error('Kakao browser login error:', error);
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
      // 웹: 표준 URL API 사용, 네이티브: expo-linking 사용
      let token: string | null = null;
      let refreshToken: string | null = null;
      let expiresAt: string | null = null;
      let isNewUser: string | null = null;

      if (Platform.OS === 'web' && typeof URL !== 'undefined') {
        const parsed = new URL(url);
        // fragment(#) 우선, query(?) 폴백 (보안: fragment는 서버로 전송되지 않음)
        const hashParams = new URLSearchParams(parsed.hash.replace('#', ''));
        token = hashParams.get('token') || parsed.searchParams.get('token');
        refreshToken = hashParams.get('refresh_token') || parsed.searchParams.get('refresh_token');
        expiresAt = hashParams.get('expires_at') || parsed.searchParams.get('expires_at');
        isNewUser = hashParams.get('is_new_user') || parsed.searchParams.get('is_new_user');
      } else {
        // 네이티브: expo-linking은 fragment를 queryParams로 파싱하지 않으므로 직접 처리
        const fragmentIndex = url.indexOf('#');
        if (fragmentIndex !== -1) {
          const fragment = url.substring(fragmentIndex + 1);
          const params = new URLSearchParams(fragment);
          token = params.get('token');
          refreshToken = params.get('refresh_token');
          expiresAt = params.get('expires_at');
          isNewUser = params.get('is_new_user');
        }
        if (!token) {
          const parsed = Linking.parse(url);
          const params = parsed.queryParams;
          token = (params?.token as string) || null;
          refreshToken = (params?.refresh_token as string) || null;
          expiresAt = (params?.expires_at as string) || null;
          isNewUser = (params?.is_new_user as string) || null;
        }
      }

      if (!token) {
        return null;
      }

      return {
        accessToken: token,
        refreshToken: refreshToken || undefined,
        expiresAt: expiresAt ? Number(expiresAt) : undefined,
        isNewUser: isNewUser === 'true',
      };
    } catch (error) {
      console.error('Token parsing error:', error);
      return null;
    }
  },

  /**
   * Apple 로그인 가능 여부 확인 (iOS만 지원)
   */
  async isAppleSignInAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    return await AppleAuthentication.isAvailableAsync();
  },

  /**
   * Apple 로그인
   * - 사용자 취소: null 반환
   * - 실패: 예외 throw
   */
  async loginWithApple(): Promise<AuthToken | null> {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('Apple 인증에서 identityToken을 받지 못했습니다.');
    }

    const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
      .filter(Boolean)
      .join(' ') || null;

    const response = await fetch(`${API_BASE_URL}${APPLE_LOGIN_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identityToken: credential.identityToken,
        fullName,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Apple 로그인 서버 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const token: AuthToken = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      isNewUser: data.isNewUser,
    };

    useAuthStore.getState().setToken(token);
    return token;
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

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
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
