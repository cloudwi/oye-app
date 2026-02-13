import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BorderRadius, Spacing } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const baseColor = useThemeColor(
    { light: '#E5E7EB', dark: '#374151' },
    'surfaceSecondary'
  );

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: baseColor,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function FortuneCardSkeleton() {
  const surfaceColor = useThemeColor(
    { light: '#FFFFFF', dark: '#1A1A1A' },
    'surface'
  );

  return (
    <View style={[skeletonStyles.fortuneCard, { backgroundColor: surfaceColor }]}>
      <Skeleton width={72} height={72} borderRadius={36} style={{ alignSelf: 'center' }} />
      <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
        <Skeleton height={18} />
        <Skeleton height={18} />
        <Skeleton height={18} width="70%" />
      </View>
      <Skeleton
        height={48}
        borderRadius={BorderRadius.lg}
        style={{ marginTop: Spacing.xl }}
      />
    </View>
  );
}

export function HistoryItemSkeleton() {
  const surfaceColor = useThemeColor(
    { light: '#FFFFFF', dark: '#1A1A1A' },
    'surface'
  );

  return (
    <View style={[skeletonStyles.historyItem, { backgroundColor: surfaceColor }]}>
      <View style={skeletonStyles.historyRow}>
        <View style={{ flex: 1, gap: Spacing.xs }}>
          <Skeleton height={18} width={100} />
          <Skeleton height={14} width={60} />
        </View>
        <Skeleton width={16} height={16} borderRadius={8} />
      </View>
    </View>
  );
}

export function HistoryListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={skeletonStyles.historyList}>
      {Array.from({ length: count }).map((_, i) => (
        <HistoryItemSkeleton key={i} />
      ))}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  fortuneCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  historyItem: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyList: {
    gap: Spacing.sm,
  },
});
