import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';
import { authService } from '@/services/auth';
import { BrandColors } from '@/constants/theme';

export default function AuthCallback() {
  const { setToken } = useAuthStore();
  const { onboarding } = useUserStore();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = () => {
    if (typeof window === 'undefined') return;

    const url = window.location.href;
    const token = authService.parseTokenFromUrl(url);

    if (token) {
      setToken(token);

      if (onboarding.completed) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(onboarding)/birthdate');
      }
    } else {
      // 토큰 파싱 실패 시 로그인 화면으로
      router.replace('/(onboarding)');
    }
  };

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
