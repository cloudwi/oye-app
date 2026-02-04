import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/card';
import { ScoreIndicator } from './score-indicator';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Fortune } from '@/types/fortune';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface FortuneCardProps {
  fortune: Fortune;
  onPress?: () => void;
  onShare?: () => void;
  showDate?: boolean;
  variant?: 'full' | 'compact';
}

export function FortuneCard({
  fortune,
  onPress,
  onShare,
  showDate = true,
  variant = 'full',
}: FortuneCardProps) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#666', dark: '#999' }, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const accentColor = '#FF6B6B';

  const formattedDate = format(new Date(fortune.date), 'M월 d일 EEEE', { locale: ko });

  if (variant === 'compact') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
        <Card variant="outlined" style={styles.compactCard}>
          <View style={styles.compactLeft}>
            <Text style={[styles.compactDate, { color: textColor }]}>{formattedDate}</Text>
            <Text style={[styles.compactMessage, { color: subtextColor }]} numberOfLines={1}>
              {fortune.overallMessage}
            </Text>
          </View>
          <ScoreIndicator score={fortune.overallScore} size="small" />
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <Card variant="elevated" style={styles.card}>
      {showDate && (
        <Text style={[styles.date, { color: tintColor }]}>{formattedDate}</Text>
      )}

      <View style={styles.scoreSection}>
        <ScoreIndicator score={fortune.overallScore} size="large" showLabel />
        <Text style={[styles.overallTitle, { color: textColor }]}>오늘의 총운</Text>
      </View>

      <Text style={[styles.message, { color: textColor }]}>{fortune.overallMessage}</Text>

      <View style={styles.luckySection}>
        <View style={styles.luckyItem}>
          <IconSymbol name="paintpalette.fill" size={20} color={accentColor} />
          <Text style={[styles.luckyLabel, { color: subtextColor }]}>행운의 색</Text>
          <Text style={[styles.luckyValue, { color: textColor }]}>{fortune.luckyColor}</Text>
        </View>
        <View style={styles.luckyItem}>
          <IconSymbol name="number.circle.fill" size={20} color={accentColor} />
          <Text style={[styles.luckyLabel, { color: subtextColor }]}>행운의 숫자</Text>
          <Text style={[styles.luckyValue, { color: textColor }]}>{fortune.luckyNumber}</Text>
        </View>
        <View style={styles.luckyItem}>
          <IconSymbol name="star.fill" size={20} color={accentColor} />
          <Text style={[styles.luckyLabel, { color: subtextColor }]}>행운의 아이템</Text>
          <Text style={[styles.luckyValue, { color: textColor }]}>{fortune.luckyItem}</Text>
        </View>
      </View>

      {(onPress || onShare) && (
        <View style={styles.actions}>
          {onPress && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: tintColor }]}
              onPress={onPress}
            >
              <Text style={[styles.actionText, { color: tintColor }]}>상세 보기</Text>
            </TouchableOpacity>
          )}
          {onShare && (
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton, { backgroundColor: accentColor }]}
              onPress={onShare}
            >
              <IconSymbol name="square.and.arrow.up" size={18} color="#fff" />
              <Text style={styles.shareText}>공유하기</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  compactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactLeft: {
    flex: 1,
    marginRight: 12,
  },
  compactDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  compactMessage: {
    fontSize: 12,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  luckySection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  luckyItem: {
    alignItems: 'center',
    gap: 4,
  },
  luckyLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  luckyValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    borderWidth: 0,
  },
  shareText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
