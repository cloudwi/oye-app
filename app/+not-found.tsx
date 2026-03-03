import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius, FontSizes } from '@/constants/theme';

export default function NotFoundScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <IconSymbol name="exclamationmark.triangle" size={48} color={textSecondary} />
        <Text style={[styles.title, { color: textColor }]}>페이지를 찾을 수 없어요</Text>
        <Text style={[styles.message, { color: textSecondary }]}>
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: tintColor }]}
          onPress={() => router.replace('/')}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>홈으로 이동</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  message: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  buttonText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
