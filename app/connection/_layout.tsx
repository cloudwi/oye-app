import { Stack } from 'expo-router';

export default function ConnectionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="connect" />
      <Stack.Screen name="manage" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="history/[id]" />
    </Stack>
  );
}
