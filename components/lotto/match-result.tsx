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

function formatPrize(amount: number): string {
  if (amount >= 100_000_000) {
    const eok = Math.floor(amount / 100_000_000);
    const remainder = amount % 100_000_000;
    if (remainder >= 10_000) {
      const man = Math.floor(remainder / 10_000);
      return `${eok}억 ${man.toLocaleString()}만원`;
    }
    return `${eok}억원`;
  }
  if (amount >= 10_000) {
    const man = Math.floor(amount / 10_000);
    return `${man.toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
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
        const isWinner = !!set.rank;
        const isEvaluated = set.evaluated;

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
              {isWinner ? (
                <>
                  <View style={styles.winBadge}>
                    <Text style={styles.winBadgeText}>{set.rank}!</Text>
                  </View>
                  {set.prizeAmount != null && (
                    <Text style={styles.prizeText}>{formatPrize(set.prizeAmount)}</Text>
                  )}
                </>
              ) : isEvaluated ? (
                <>
                  <View style={styles.loseBadge}>
                    <Text style={styles.loseBadgeText}>낙첨</Text>
                  </View>
                  <Text style={[lottoStyles.matchCountText, { color: getMatchColor(matchCount) }]}>
                    {matchCount}개 일치
                  </Text>
                </>
              ) : (
                <Text style={[lottoStyles.matchCountText, { color: getMatchColor(matchCount) }]}>
                  {matchCount}개 일치
                </Text>
              )}
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
  winBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  winBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
  },
  loseBadge: {
    backgroundColor: '#9398A7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  loseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  prizeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B8860B',
  },
});
