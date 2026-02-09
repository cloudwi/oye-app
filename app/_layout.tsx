import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, Redirect, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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

function useRedirectTarget(): string | null {
  const segments = useSegments();
  const { onboarding } = useUserStore();
  const { isAuthenticated } = useAuthStore();
  const navigationState = useRootNavigationState();

  if (!navigationState?.key) return null;

  const inOnboarding = segments[0] === '(onboarding)';
  const inAuth = segments[0] === 'auth';

  if (inAuth) return null;

  if (!isAuthenticated) {
    return inOnboarding ? null : '/(onboarding)';
  } else if (!onboarding.completed) {
    return inOnboarding ? null : '/(onboarding)/birthdate';
  } else if (inOnboarding) {
    return '/(tabs)';
  }

  return null;
}

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const { darkMode } = useSettingsStore();

  const effectiveColorScheme =
    darkMode === 'system' ? systemColorScheme : darkMode;

  const redirectTarget = useRedirectTarget();

  return (
    <ThemeProvider
      value={effectiveColorScheme === 'dark' ? FortuneDarkTheme : FortuneDefaultTheme}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
      </Stack>
      {redirectTarget && <Redirect href={redirectTarget} />}
      <StatusBar style={effectiveColorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
