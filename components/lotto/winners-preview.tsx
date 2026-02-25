import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LottoBall } from './lotto-ball';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLottoWinners } from '@/hooks/queries/use-lotto-winners';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { lottoStyles } from './styles';
import type { LottoWinner } from '@/types/lotto';

export function LottoWinnersPreview() {
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const cardBorderColor = useThemeColor({}, 'cardBorder');
  const tintColor = useThemeColor({}, 'tint');

  const { data, isLoading } = useLottoWinners();

  const winners = data?.pages.flatMap((p) => p.content) ?? [];

  if (isLoading || winners.length === 0) return null;

  const renderCard = ({ item }: { item: LottoWinner }) => (
    <View style={[styles.card, { backgroundColor: surfaceColor, borderColor: cardBorderColor }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.roundLabel, { color: tintColor }]}>
          {item.round}회
        </Text>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{item.rank}</Text>
        </View>
      </View>
      <View style={styles.ballsRow}>
        {item.numbers.map((num, i) => (
          <LottoBall key={i} number={num} size={28} />
        ))}
      </View>
      <Text style={[styles.matchText, { color: textSecondary }]}>
        {item.matchCount}개 일치{item.bonusMatch ? ' +보너스' : ''}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={lottoStyles.sectionHeader}>
        <Text style={[lottoStyles.sectionTitle, { color: textColor }]}>
          당첨자 현황
        </Text>
        <TouchableOpacity
          style={lottoStyles.sectionMore}
          onPress={() => router.push('/lotto/winners' as any)}
          activeOpacity={0.7}
        >
          <Text style={[lottoStyles.sectionMoreText, { color: tintColor }]}>
            전체보기
          </Text>
          <IconSymbol name="chevron.right" size={14} color={tintColor} />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={winners.slice(0, 10)}
        keyExtractor={(item, idx) => `${item.round}-${item.rank}-${idx}`}
        renderItem={renderCard}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: Spacing.sm }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  listContent: {
    paddingVertical: Spacing.xs,
  },
  card: {
    width: 180,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  rankBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  rankText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
  },
  ballsRow: {
    flexDirection: 'row',
    gap: 3,
    flexWrap: 'wrap',
  },
  matchText: {
    fontSize: FontSizes.xs,
  },
});
