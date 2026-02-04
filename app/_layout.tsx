import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserStore } from '@/stores/user-store';
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
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const inOnboarding = segments[0] === '(onboarding)';
    const onboardingComplete = onboarding.completed;

    if (!onboardingComplete && !inOnboarding) {
      // User hasn't completed onboarding, redirect to onboarding
      router.replace('/(onboarding)');
    } else if (onboardingComplete && inOnboarding) {
      // User has completed onboarding but is in onboarding, redirect to main
      router.replace('/(tabs)');
    }
  }, [segments, onboarding.completed, navigationState?.key]);
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
        <Stack.Screen
          name="fortune/[id]"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
      </Stack>
      <StatusBar style={effectiveColorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
