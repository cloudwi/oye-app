import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserStore } from '@/stores/user-store';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';

// Custom themes for the fortune app
const FortuneDefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6B6B',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#11181C',
    border: '#E5E5E5',
    notification: '#FF6B6B',
  },
};

const FortuneDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#FF6B6B',
    background: '#151718',
    card: '#1E2022',
    text: '#ECEDEE',
    border: '#333333',
    notification: '#FF6B6B',
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

function useProtectedRoute() {
  const segments = useSegments();
  const { onboarding } = useUserStore();
  const { isAuthenticated } = useAuthStore();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const inOnboarding = segments[0] === '(onboarding)';
    const inAuth = segments[0] === 'auth';

    // /auth/callback 경로는 보호에서 제외
    if (inAuth) return;

    const navigate = () => {
      if (!isAuthenticated) {
        if (!inOnboarding) {
          router.replace('/(onboarding)');
        }
      } else if (!onboarding.completed) {
        if (!inOnboarding) {
          router.replace('/(onboarding)/birthdate');
        }
      } else if (inOnboarding) {
        router.replace('/(tabs)');
      }
    };

    // 레이아웃 마운트 완료 후 네비게이션 실행
    const timeout = setTimeout(navigate, 0);
    return () => clearTimeout(timeout);
  }, [segments, isAuthenticated, onboarding.completed, navigationState?.key]);
}

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const { darkMode } = useSettingsStore();

  // Determine the effective color scheme
  const effectiveColorScheme =
    darkMode === 'system' ? systemColorScheme : darkMode;

  useProtectedRoute();

  return (
    <ThemeProvider
      value={effectiveColorScheme === 'dark' ? FortuneDarkTheme : FortuneDefaultTheme}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
      </Stack>
      <StatusBar style={effectiveColorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
