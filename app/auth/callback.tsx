import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/auth';
import { BrandColors } from '@/constants/theme';

export default function AuthCallback() {
  const { setToken } = useAuthStore();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = window.location.href;
    const token = authService.parseTokenFromUrl(url);

    if (token) {
      setToken(token);
    }

    setDone(true);
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
