import { Stack } from 'expo-router';

export default function GroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="create" />
      <Stack.Screen name="join" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="settings/[id]" />
    </Stack>
  );
}
