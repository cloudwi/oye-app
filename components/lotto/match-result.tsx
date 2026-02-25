import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LottoBall } from './lotto-ball';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { lottoStyles } from './styles';
import type { LottoRecommendation, LottoRound } from '@/types/lotto';

interface Props {
  sets: LottoRecommendation[];
  roundData: LottoRound;
}

function getMatchColor(count: number): string {
  if (count >= 6) return '#FFD700';
  if (count >= 5) return '#FF6B6B';
  if (count >= 4) return '#4CAF82';
  if (count >= 3) return '#5B8EC9';
  return '#9398A7';
}

function getMatchLabel(count: number, bonusMatch: boolean, rank: string | null): string {
  if (rank) return rank;
  if (bonusMatch) return `${count}개+보너스`;
  return `${count}개 일치`;
}

export function LottoMatchResult({ sets, roundData }: Props) {
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const cardBorderColor = useThemeColor({}, 'cardBorder');

  const winningSet = new Set(roundData.numbers);

  const sortedSets = [...sets].sort((a, b) => a.setNumber - b.setNumber);

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor, borderColor: cardBorderColor }]}>
      <Text style={[lottoStyles.sectionTitle, { color: textColor, marginBottom: Spacing.sm }]}>
        내 번호 비교
      </Text>

      {sortedSets.map((set, idx) => {
        const matchCount = set.numbers.filter((n) => winningSet.has(n)).length;
        const color = getMatchColor(matchCount);

        return (
          <View key={set.id} style={styles.setRow}>
            <Text style={[lottoStyles.setLabelBase, { color: textSecondary }]}>
              {String.fromCharCode(65 + idx)}
            </Text>
            <View style={lottoStyles.ballRow}>
              {set.numbers.map((num, i) => (
                <LottoBall
                  key={i}
                  number={num}
                  size={36}
                  isMatched={winningSet.has(num)}
                />
              ))}
            </View>
            <View style={styles.matchInfo}>
              {set.rank && (
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{set.rank}</Text>
                </View>
              )}
              <Text style={[lottoStyles.matchCountText, { color }]}>
                {getMatchLabel(matchCount, set.bonusMatch, set.rank)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
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
});
