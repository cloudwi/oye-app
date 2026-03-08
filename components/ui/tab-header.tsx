import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, FontSizes } from '@/constants/theme';

interface TabHeaderProps {
  title: string;
  badge?: React.ReactNode;
}

export function TabHeader({ title, badge }: TabHeaderProps) {
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {badge}
      </View>
      <TouchableOpacity
        onPress={() => router.push('/friends')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel="친구"
      >
        <IconSymbol name="person.2.fill" size={22} color={textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
});
