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
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { LottoBall } from '@/components/lotto/lotto-ball';
import { useLottoHistory } from '@/hooks/queries/use-lotto-history';
import {
  Spacing,
  BorderRadius,
  FontSizes,
} from '@/constants/theme';
import { lottoStyles } from '@/components/lotto/styles';

export default function LottoScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const cardBorderColor = useThemeColor({}, 'cardBorder');
  const tintColor = useThemeColor({}, 'tint');
  const { contentStyle } = useResponsiveLayout();

  const { data: historyData, refetch: refetchHistory } = useLottoHistory();

  const latestSets = historyData?.pages[0]?.content ?? [];

  const latestRound = useMemo(() => {
    if (latestSets.length === 0) return undefined;
    return latestSets[0].round;
  }, [latestSets]);

  const winningNumbers = useMemo(() => {
    const set = latestSets.find((s) => s.drawNumbers && s.drawBonusNumber != null);
    if (!set || !set.drawNumbers || set.drawBonusNumber == null) return undefined;
    return { numbers: new Set(set.drawNumbers), bonus: set.drawBonusNumber, raw: set.drawNumbers };
  }, [latestSets]);

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

  const isEvaluated = displaySets.length > 0 && displaySets[0].evaluated;
  const hasData = displaySets.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Animated.View style={styles.header} entering={FadeIn.duration(300)}>
        <Text style={[styles.title, { color: textColor }]}>로또 번호 추천</Text>
        {latestRound && (
          <View style={[styles.roundBadge, { backgroundColor: tintColor + '15' }]}>
            <Text style={[styles.roundBadgeText, { color: tintColor }]}>
              {latestRound}회
            </Text>
          </View>
        )}
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
      >
        {/* Empty State */}
        {!hasData && (
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <EmptyState
              icon="ticket"
              title="아직 추천 번호가 없어요"
              message={'매주 자동으로 행운의 번호가 생성됩니다'}
            />
          </Animated.View>
        )}

        {/* Winning Numbers - compact inline row when evaluated */}
        {hasData && isEvaluated && winningNumbers && (
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <View style={[styles.winningRow, { backgroundColor: surfaceColor, borderColor: cardBorderColor }]}>
              <Text style={[styles.winningLabel, { color: textSecondary }]}>당첨번호</Text>
              <View style={styles.winningBalls}>
                {winningNumbers.raw.map((num, i) => (
                  <LottoBall key={i} number={num} size={28} />
                ))}
                <Text style={[styles.plus, { color: textSecondary }]}>+</Text>
                <LottoBall number={winningNumbers.bonus} size={28} isBonus />
              </View>
            </View>
          </Animated.View>
        )}

        {/* Recommended Numbers with inline results */}
        {hasData && (
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <View style={[styles.card, { backgroundColor: surfaceColor, borderColor: cardBorderColor }]}>
              {displaySets.map((set, idx) => {
                const matchCount = winningNumbers
                  ? set.numbers.filter((n) => winningNumbers.numbers.has(n)).length
                  : 0;

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
                          size={32}
                          isMatched={isEvaluated && winningNumbers ? winningNumbers.numbers.has(num) : false}
                        />
                      ))}
                    </View>
                    {/* Inline result badge */}
                    {set.rank ? (
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankText}>{set.rank}</Text>
                      </View>
                    ) : isEvaluated ? (
                      <View style={styles.loseBadge}>
                        <Text style={styles.loseBadgeText}>낙첨</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Navigation */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: surfaceColor, borderColor: cardBorderColor }]}
              onPress={() => router.push('/lotto/history')}
              activeOpacity={0.7}
            >
              <IconSymbol name="clock.arrow.circlepath" size={18} color={tintColor} />
              <Text style={[styles.navText, { color: textColor }]}>추천 기록</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: surfaceColor, borderColor: cardBorderColor }]}
              onPress={() => router.push('/lotto/winners')}
              activeOpacity={0.7}
            >
              <IconSymbol name="trophy.fill" size={18} color="#B8860B" />
              <Text style={[styles.navText, { color: textColor }]}>당첨자 현황</Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  roundBadge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  roundBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  // Winning numbers compact row
  winningRow: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  winningLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    width: 44,
  },
  winningBalls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  plus: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginHorizontal: 1,
  },
  // Main card
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  rankBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  rankText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
  },
  loseBadge: {
    backgroundColor: '#9398A7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  loseBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  // Navigation
  navRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  navText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
