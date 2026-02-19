import { Stack } from 'expo-router';

export default function InquiryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="write" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
