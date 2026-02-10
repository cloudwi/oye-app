import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';

export default function OnboardingLayout() {
  const { isAuthenticated } = useAuthStore();
  const { onboarding } = useUserStore();

  if (isAuthenticated && onboarding.completed) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="birthdate" />
      <Stack.Screen name="calendartype" />
      <Stack.Screen name="notification" />
    </Stack>
  );
}
