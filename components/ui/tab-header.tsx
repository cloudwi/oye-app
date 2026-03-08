import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUnreadCount } from '@/hooks/queries/use-notifications';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';

interface TabHeaderProps {
  title: string;
  badge?: React.ReactNode;
}

export function TabHeader({ title, badge }: TabHeaderProps) {
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const tintColor = useThemeColor({}, 'tint');

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {badge}
      </View>
      <View style={styles.right}>
        <TouchableOpacity
          onPress={() => router.push('/notifications')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel="알림"
          style={styles.iconButton}
        >
          <IconSymbol name="bell.fill" size={21} color={textSecondary} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: tintColor }]}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
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
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  iconButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
