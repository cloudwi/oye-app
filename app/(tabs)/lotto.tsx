import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LottoBall } from '@/components/lotto/lotto-ball';
import { LottoWinningNumbers } from '@/components/lotto/winning-numbers';
import { LottoMatchResult } from '@/components/lotto/match-result';
import { LottoWinnersPreview } from '@/components/lotto/winners-preview';
import { useLottoRound } from '@/hooks/queries/use-lotto-round';
import { useLottoHistory } from '@/hooks/queries/use-lotto-history';
import { useLottoStats } from '@/hooks/queries/use-lotto-stats';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
  LottoColors,
} from '@/constants/theme';
import { lottoStyles } from '@/components/lotto/styles';

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

export default function LottoScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');

  const { data: historyData, refetch: refetchHistory } = useLottoHistory();
  const { data: statsData } = useLottoStats();

  const latestSets = historyData?.pages[0]?.content ?? [];

  const latestRound = useMemo(() => {
    if (latestSets.length === 0) return undefined;
    return latestSets[0].round;
  }, [latestSets]);

  const { data: roundData } = useLottoRound(latestRound);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchHistory();
    setRefreshing(false);
  }, [refetchHistory]);

  const displaySets = useMemo(() => {
    return [...latestSets]
      .filter((set) => set.round === latestRound)
      .sort((a, b) => a.setNumber - b.setNumber);
  }, [latestSets, latestRound]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Animated.View style={styles.header} entering={FadeIn.duration(300)}>
        <Text style={[styles.title, { color: textColor }]}>로또 번호 추천</Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          행운의 번호를 받아보세요
        </Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
      >
        {/* Latest Generated Numbers */}
        {displaySets.length > 0 && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(200)}
            style={[styles.resultCard, Shadows.md]}
          >
            <Text style={styles.resultTitle}>
              이번 회차 추천 번호
            </Text>
            {displaySets.map((set, idx) => (
              <View key={set.id} style={lottoStyles.numberSetRow}>
                <Text style={[lottoStyles.setLabelBase, { color: LottoColors.setLabel }]}>
                  {String.fromCharCode(65 + idx)}
                </Text>
                <View style={lottoStyles.ballRow}>
                  {set.numbers.map((num, i) => (
                    <LottoBall key={i} number={num} size={36} />
                  ))}
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Winning Numbers Section */}
        {roundData && (
          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <LottoWinningNumbers roundData={roundData} />
          </Animated.View>
        )}

        {/* Match Result Section */}
        {roundData && displaySets.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <LottoMatchResult sets={displaySets} roundData={roundData} />
          </Animated.View>
        )}

        {/* Winners Preview Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          <LottoWinnersPreview />
        </Animated.View>

        {/* Stats Card */}
        {statsData && (
          <Animated.View entering={FadeInDown.duration(400).delay(600)}>
            <View style={[styles.statsCard, { backgroundColor: surfaceColor }]}>
              <View style={styles.statsRow}>
                <Text style={[styles.statsLabel, { color: textSecondary }]}>
                  누적 당첨 금액
                </Text>
                <Text style={[styles.statsValue, { color: tintColor }]}>
                  {statsData.totalPrize > 0
                    ? formatPrize(statsData.totalPrize)
                    : '아직 당첨 내역이 없어요'}
                </Text>
              </View>
              {statsData.winCount > 0 && (
                <View style={styles.statsRow}>
                  <Text style={[styles.statsLabel, { color: textSecondary }]}>
                    당첨 횟수
                  </Text>
                  <Text style={[styles.statsValue, { color: tintColor }]}>
                    {statsData.winCount}회
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* History Button */}
        <Animated.View entering={FadeInDown.duration(400).delay(700)}>
          <TouchableOpacity
            style={[styles.historyButton, { backgroundColor: surfaceColor }]}
            onPress={() => router.push('/lotto/history')}
            activeOpacity={0.7}
          >
            <IconSymbol name="clock.arrow.circlepath" size={20} color={tintColor} />
            <Text style={[styles.historyButtonText, { color: tintColor }]}>
              추천 기록 보기
            </Text>
            <IconSymbol name="chevron.right" size={16} color={tintColor} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  resultCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: LottoColors.cardBg,
  },
  resultTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    color: LottoColors.title,
  },
  statsCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: FontSizes.sm,
  },
  statsValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    height: 52,
  },
  historyButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
