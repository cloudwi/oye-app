import { Stack } from 'expo-router';

export default function LottoLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="history" />
      <Stack.Screen name="winners" />
      <Stack.Screen name="qr-scan" />
      <Stack.Screen name="manual-input" />
      <Stack.Screen name="register-confirm" />
    </Stack>
  );
}
