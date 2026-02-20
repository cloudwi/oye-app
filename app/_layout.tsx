import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ErrorBoundary } from '@/components/error-boundary';
import { OfflineBanner } from '@/components/offline-banner';
import { notificationService } from '@/services/notification';
import { initSentry } from '@/services/sentry';
import { queryClient } from '@/services/query-client';

initSentry();

// Custom themes for the fortune app
const FortuneDefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.divider,
    notification: Colors.light.tint,
  },
};

const FortuneDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.divider,
    notification: Colors.dark.tint,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const bgColor = Colors[colorScheme ?? 'light'].background;

  useEffect(() => {
    const subscription = notificationService.addNotificationResponseListener(() => {
      router.navigate('/(tabs)' as any);
    });
    return () => {
      subscription?.remove();
    };
  }, []);

  const content = (
    <ThemeProvider
      value={colorScheme === 'dark' ? FortuneDarkTheme : FortuneDefaultTheme}
    >
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen
          name="settings"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="legal"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="inquiry"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
      {Platform.OS !== 'web' && <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />}
    </ThemeProvider>
  );

  if (Platform.OS === 'web') {
    return (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <View style={[webStyles.outer, { backgroundColor: bgColor }]}>
            <View style={[webStyles.inner, { backgroundColor: bgColor }]}>
              {content}
            </View>
          </View>
        </ErrorBoundary>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>{content}</ErrorBoundary>
    </QueryClientProvider>
  );
}

const webStyles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    // @ts-ignore - web only
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
  },
});
