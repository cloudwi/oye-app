import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { authService } from '@/services/auth';
import { userApi } from '@/services/api/user';
import { notificationService } from '@/services/notification';
import { Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import type { AuthToken } from '@/types/auth';
import { KakaoSymbol } from '@/components/ui/kakao-symbol';

export default function OnboardingWelcome() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const [loadingProvider, setLoadingProvider] = useState<'kakao' | 'apple' | null>(null);
  const [appleSignInAvailable, setAppleSignInAvailable] = useState(false);
  const { setUser, completeOnboarding } = useUserStore();

  useEffect(() => {
    authService.isAppleSignInAvailable().then(setAppleSignInAvailable);
  }, []);

  const handleLoginSuccess = async (token: AuthToken) => {
    if (!token) return;

    // 기존 회원: 서버에서 유저 데이터 복원 후 메인으로 이동
    if (token.isNewUser === false) {
      try {
        const userData = await userApi.getMe();
        setUser(userData);
        completeOnboarding();
        notificationService.registerPushTokenToServer();
        router.replace('/(tabs)');
        return;
      } catch {
        // getMe 실패 시 온보딩 진행
      }
    }

    router.push('/(onboarding)/name');
  };

  const handleKakaoLogin = async () => {
    setLoadingProvider('kakao');
    try {
      const token = await authService.loginWithKakao();

      // 웹에서는 페이지 리다이렉트이므로 여기에 도달하지 않음
      if (Platform.OS === 'web') return;

      if (token) {
        await handleLoginSuccess(token);
      } else {
        Alert.alert('로그인 실패', '카카오 로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('로그인 오류', '로그인 중 문제가 발생했습니다.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleAppleLogin = async () => {
    setLoadingProvider('apple');
    try {
      const token = await authService.loginWithApple();

      if (token) {
        await handleLoginSuccess(token);
      }
    } catch (error: unknown) {
      // 사용자 취소는 무시
      if (error instanceof Error && (error as Error & { code?: string }).code === 'ERR_REQUEST_CANCELED') return;

      console.error('Apple login error:', error);
      Alert.alert('로그인 실패', 'Apple 로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* Logo/Icon Area */}
        <View style={styles.logoArea}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="오늘의 예감 앱 로고"
          />
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={[styles.title, { color: textColor }]}>오늘의 예감</Text>
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            매일 아침, 당신만을 위한{'\n'}특별한 예감을 만나보세요
          </Text>
        </View>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        {appleSignInAvailable && Platform.OS !== 'web' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={BorderRadius.lg}
            style={styles.appleButton}
            onPress={handleAppleLogin}
          />
        )}
        <TouchableOpacity
          onPress={handleKakaoLogin}
          activeOpacity={0.9}
          disabled={loadingProvider !== null}
          style={styles.kakaoButton}
          accessibilityRole="button"
          accessibilityLabel="카카오로 시작하기"
        >
          {loadingProvider === 'kakao' ? (
            <ActivityIndicator size="small" color="#3C1E1E" />
          ) : (
            <>
              <KakaoSymbol size={20} color="#000000" />
              <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoArea: {
    marginBottom: Spacing.xxl,
  },
  logoImage: {
    width: 140,
    height: 140,
    borderRadius: 32,
  },
  textContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  appleButton: {
    height: 50,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  kakaoIcon: {
    width: 20,
    height: 20,
  },
  kakaoButtonText: {
    color: '#3C1E1E',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
});
