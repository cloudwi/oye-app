import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, FontSizes } from '@/constants/theme';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, rightAction }: ScreenHeaderProps) {
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack ?? (() => router.back())}
        style={styles.headerButton}
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
      >
        <IconSymbol name="chevron.left" size={20} color={textColor} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
        {title}
      </Text>
      {rightAction ?? <View style={styles.headerButton} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
});
