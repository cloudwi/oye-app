import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/card';
import { ScoreIndicator } from './score-indicator';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { CategoryFortune, FortuneCategory } from '@/types/fortune';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/fortune';

interface CategoryCardProps {
  category: CategoryFortune;
  onPress?: () => void;
  compact?: boolean;
}

export function CategoryCard({ category, onPress, compact = false }: CategoryCardProps) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#666', dark: '#999' }, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  const iconName = CATEGORY_ICONS[category.category] as any;
  const label = CATEGORY_LABELS[category.category];

  if (compact) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
        <Card variant="outlined" style={styles.compactCard}>
          <View style={styles.compactHeader}>
            <IconSymbol name={iconName} size={20} color={tintColor} />
            <Text style={[styles.compactLabel, { color: textColor }]}>{label}</Text>
          </View>
          <ScoreIndicator score={category.score} size="small" />
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <Card variant="elevated" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.labelContainer}>
            <IconSymbol name={iconName} size={24} color={tintColor} />
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
          </View>
          <ScoreIndicator score={category.score} size="small" />
        </View>
        <Text style={[styles.title, { color: textColor }]}>{category.title}</Text>
        <Text style={[styles.description, { color: subtextColor }]} numberOfLines={2}>
          {category.description}
        </Text>
        {onPress && (
          <View style={styles.footer}>
            <Text style={[styles.moreText, { color: tintColor }]}>자세히 보기</Text>
            <IconSymbol name="chevron.right" size={16} color={tintColor} />
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  compactCard: {
    alignItems: 'center',
    padding: 12,
    width: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  compactLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 4,
  },
  moreText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
