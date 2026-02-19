import { Stack, Redirect, useSegments } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const ONBOARDING_STEPS: Record<string, number> = {
  gender: 1,
  birthdate: 2,
  calendartype: 3,
  notification: 4,
};

const TOTAL_STEPS = 4;

export default function OnboardingLayout() {
  const { isAuthenticated } = useAuthStore();
  const { onboarding } = useUserStore();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');

  if (isAuthenticated && onboarding.completed) {
    return <Redirect href="/(tabs)" />;
  }

  // Last segment is the current screen name within (onboarding)
  const currentScreen = segments[segments.length - 1] ?? '';
  const currentStep = ONBOARDING_STEPS[currentScreen] ?? 0;
  const showProgressBar = currentStep > 0;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {showProgressBar && (
        <View style={[styles.progressWrapper, { paddingTop: insets.top + Spacing.sm }]}>
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </View>
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="gender" />
        <Stack.Screen name="birthdate" />
        <Stack.Screen name="calendartype" />
        <Stack.Screen name="notification" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingBottom: Spacing.sm,
  },
});
