import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  BrandColors,
  Spacing,
  BorderRadius,
  FontSizes,
} from '@/constants/theme';
import type { SymbolViewProps } from 'expo-symbols';

interface EmptyStateProps {
  icon: SymbolViewProps['name'];
  iconColor?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  iconColor = BrandColors.primary,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor(
    { light: '#6B7280', dark: '#9CA3AF' },
    'textSecondary'
  );

  return (
    <View style={styles.container}>
      <View style={[styles.iconBg, { backgroundColor: iconColor + '15' }]}>
        <IconSymbol name={icon} size={32} color={iconColor} />
      </View>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, { color: textSecondary }]}>{message}</Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButton: {
    marginTop: Spacing.lg,
    backgroundColor: BrandColors.primary,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  actionText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
