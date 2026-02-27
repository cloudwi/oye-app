import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';
import { authService } from '@/services/auth';
import { userApi } from '@/services/api/user';
import { notificationService } from '@/services/notification';
import { BrandColors } from '@/constants/theme';

export default function AuthCallback() {
  const { setToken } = useAuthStore();
  const { setUser, completeOnboarding } = useUserStore();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAuth = async () => {
      const url = window.location.href;
      const token = authService.parseTokenFromUrl(url);

      // 보안: URL에서 토큰 정보 제거
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      if (token) {
        setToken(token);

        try {
          const user = await userApi.getMe();
          setUser(user);

          if (token.isNewUser === false) {
            // 기존 회원: 온보딩 스킵
            completeOnboarding();
            notificationService.registerPushTokenToServer();
          }
          // 신규 회원: user 정보(이름 등)를 store에 저장 → 온보딩에서 활용
        } catch {
          // getMe 실패 시 온보딩 진행
        }
      }

      setDone(true);
    };

    handleAuth();
  }, []);

  if (done) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={BrandColors.primary} />
      <Text style={styles.text}>로그인 처리 중...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  text: {
    fontSize: 16,
    color: '#6B7280',
  },
});
