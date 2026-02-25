import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuthStore();
  const { onboarding } = useUserStore();
  const insets = useSafeAreaInsets();

  if (!isAuthenticated) {
    return <Redirect href="/(onboarding)" />;
  }

  if (!onboarding.completed) {
    return <Redirect href="/(onboarding)/name" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 11,
        },
        tabBarStyle: {
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="sparkles" color={color} />,
          tabBarAccessibilityLabel: '홈 탭',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '기록',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="calendar" color={color} />,
          tabBarAccessibilityLabel: '기록 탭',
        }}
      />
      <Tabs.Screen
        name="lotto"
        options={{
          title: '로또',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="dice.fill" color={color} />,
          tabBarAccessibilityLabel: '로또 탭',
        }}
      />
      <Tabs.Screen
        name="compatibility"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="gearshape.fill" color={color} />,
          tabBarAccessibilityLabel: '설정 탭',
        }}
      />
    </Tabs>
  );
}
