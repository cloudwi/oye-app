import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

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
  const bgColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;

  const content = (
    <ThemeProvider
      value={colorScheme === 'dark' ? FortuneDarkTheme : FortuneDefaultTheme}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={[webStyles.outer, { backgroundColor: bgColor }]}>
        <View style={[webStyles.inner, { backgroundColor: bgColor }]}>
          {content}
        </View>
      </View>
    );
  }

  return content;
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
