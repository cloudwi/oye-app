import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ErrorBoundary } from '@/components/error-boundary';
import { ForceUpdateModal } from '@/components/force-update-modal';
import { OfflineBanner } from '@/components/offline-banner';
import { AppDownloadBanner } from '@/components/web/app-download-banner';
import { useForceUpdate } from '@/hooks/use-force-update';
import { notificationService } from '@/services/notification';
import { queryClient } from '@/services/query-client';
import * as Sentry from '@sentry/react-native';

// Initialize Google Mobile Ads SDK with ATT consent
if (Platform.OS !== 'web') {
  try {
    const { default: mobileAds } = require('react-native-google-mobile-ads');
    const { requestTrackingPermissionsAsync } = require('expo-tracking-transparency');

    requestTrackingPermissionsAsync().then((status: { granted: boolean }) => {
      if (!status.granted) {
        mobileAds().setRequestConfiguration({
          testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
        });
      }
      mobileAds().initialize();
    }).catch(() => {
      // ATT not available, initialize anyway
      mobileAds().initialize();
    });
  } catch {
    // Native module not available
    try {
      const { default: mobileAds } = require('react-native-google-mobile-ads');
      mobileAds().initialize();
    } catch {
      // Completely unavailable
    }
  }
}

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: !__DEV__,
  sendDefaultPii: true,
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: Platform.OS !== 'web' ? [Sentry.mobileReplayIntegration()] : [],
});

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

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();
  const bgColor = Colors[colorScheme ?? 'light'].background;
  const [appReady, setAppReady] = useState(false);
  const { needsUpdate, storeUrl, minVersion } = useForceUpdate();

  useEffect(() => {
    const subscription = notificationService.addNotificationResponseListener(() => {
      router.navigate('/(tabs)' as Href);
    });
    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    // 앱 초기화 완료 후 스플래시 숨기기
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  const content = (
    <ThemeProvider
      value={colorScheme === 'dark' ? FortuneDarkTheme : FortuneDefaultTheme}
    >
      {needsUpdate && <ForceUpdateModal storeUrl={storeUrl} minVersion={minVersion} />}
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
        <Stack.Screen
          name="lotto"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="group"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
      {Platform.OS !== 'web' && <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />}
      {Platform.OS === 'web' && <AppDownloadBanner />}
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
});

const webStyles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
  },
});