import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LottoBall } from './lotto-ball';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { lottoStyles } from './styles';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { LottoRound } from '@/types/lotto';

interface Props {
  roundData: LottoRound;
}

export function LottoWinningNumbers({ roundData }: Props) {
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const cardBorderColor = useThemeColor({}, 'cardBorder');

  const drawDateStr = roundData.drawDate
    ? format(new Date(roundData.drawDate), 'yyyy.MM.dd', { locale: ko })
    : '';

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor, borderColor: cardBorderColor }]}>
      <View style={lottoStyles.sectionHeader}>
        <Text style={[lottoStyles.sectionTitle, { color: textColor }]}>
          당첨 번호 확인
        </Text>
      </View>

      <View style={styles.roundInfo}>
        <Text style={[styles.roundText, { color: textColor }]}>
          {roundData.round}회 당첨번호
        </Text>
        {drawDateStr ? (
          <Text style={[styles.dateText, { color: textSecondary }]}>
            {drawDateStr}
          </Text>
        ) : null}
      </View>

      <View style={styles.numbersRow}>
        {roundData.numbers.map((num, i) => (
          <LottoBall key={i} number={num} size={36} />
        ))}
        <Text style={[styles.plus, { color: textSecondary }]}>+</Text>
        <LottoBall number={roundData.bonusNumber} size={36} isBonus />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  roundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  dateText: {
    fontSize: FontSizes.xs,
  },
  numbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
  },
  plus: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginHorizontal: 2,
  },
});
