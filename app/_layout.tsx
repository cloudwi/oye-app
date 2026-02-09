import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
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
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!navigationState?.key) return;

    const inOnboarding = segments[0] === '(onboarding)';
    const inAuth = segments[0] === 'auth';

    // /auth/callback 경로는 보호에서 제외
    if (inAuth) return;

    const navigate = () => {
      try {
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
        hasNavigated.current = true;
      } catch (e) {
        // 마운트 전이면 다음 프레임에서 재시도
        if (!hasNavigated.current) {
          requestAnimationFrame(navigate);
        }
      }
    };

    // 첫 렌더 후 다음 프레임에서 네비게이션 실행
    const rafId = requestAnimationFrame(navigate);
    return () => cancelAnimationFrame(rafId);
  }, [segments, isAuthenticated, onboarding.completed, navigationState?.key]);
}

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const { darkMode } = useSettingsStore();

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
