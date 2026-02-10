import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="gender" />
      <Stack.Screen name="birthdate" />
      <Stack.Screen name="notification-time" />
    </Stack>
  );
}
