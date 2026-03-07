import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { LottoBall } from '@/components/lotto/lotto-ball';
import { useLottoHistory } from '@/hooks/queries/use-lotto-history';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Spacing,
  BorderRadius,
  FontSizes,
} from '@/constants/theme';
import { lottoStyles } from '@/components/lotto/styles';
import type { LottoRecommendation } from '@/types/lotto';

interface RoundGroup {
  round: number;
  sets: LottoRecommendation[];
  date: string;
}

export default function LottoHistoryScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const cardBorderColor = useThemeColor({}, 'cardBorder');
  const tintColor = useThemeColor({}, 'tint');
  const { contentStyle } = useResponsiveLayout();

  const [winOnly, setWinOnly] = useState(false);
  const [sortByAmount, setSortByAmount] = useState(false);

  const {
    data: historyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useLottoHistory(winOnly || undefined);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const inputBgColor = useThemeColor({}, 'inputBackground');
  const placeholderColor = useThemeColor({}, 'placeholder');

  const allHistory = historyData?.pages.flatMap((p) => p.content) ?? [];

  const roundGroups: RoundGroup[] = useMemo(() => {
    const grouped: Record<number, LottoRecommendation[]> = {};
    for (const item of allHistory) {
      if (!grouped[item.round]) grouped[item.round] = [];
      grouped[item.round].push(item);
    }
    const groups = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a)
      .filter((round) => !searchQuery || String(round).includes(searchQuery))
      .map((round) => ({
        round,
        sets: grouped[round].sort((a, b) => a.setNumber - b.setNumber),
        date: format(new Date(grouped[round][0].createdAt), 'yyyy.MM.dd', { locale: ko }),
      }));
    if (sortByAmount) {
      groups.sort((a, b) => {
        const sumA = a.sets.reduce((s, set) => s + (set.prizeAmount ?? 0), 0);
        const sumB = b.sets.reduce((s, set) => s + (set.prizeAmount ?? 0), 0);
        return sumB - sumA;
      });
    }
    return groups;
  }, [allHistory, searchQuery, sortByAmount]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const CARD_HEIGHT = 300; // approximate: padding(32) + roundHeader(20) + drawRow(30) + 5 sets(~44ea) + gaps
  const getItemLayout = useCallback((_data: any, index: number) => ({
    length: CARD_HEIGHT,
    offset: CARD_HEIGHT * index,
    index,
  }), []);

  const renderRoundCard = useCallback(
    ({ item }: { item: RoundGroup }) => {
      const firstEvaluated = item.sets.find((s) => s.drawNumbers && s.drawBonusNumber != null);
      const drawNumbers = firstEvaluated?.drawNumbers ?? null;
      const drawBonus = firstEvaluated?.drawBonusNumber ?? null;
      const winningSet = drawNumbers ? new Set(drawNumbers) : null;

      return (
        <View
          style={[
            styles.historyCard,
            { backgroundColor: surfaceColor, borderColor: cardBorderColor },
          ]}
        >
          <View style={styles.roundHeader}>
            <Text style={[styles.roundLabel, { color: tintColor }]}>
              {item.round}회차
            </Text>
            <Text style={[styles.dateText, { color: textSecondary }]}>
              {item.date}
            </Text>
          </View>
          {drawNumbers && drawBonus != null && (
            <View style={styles.drawRow}>
              <Text style={[styles.drawLabel, { color: textSecondary }]}>당첨</Text>
              <View style={styles.drawBalls}>
                {drawNumbers.map((num, i) => (
                  <LottoBall key={i} number={num} size={20} />
                ))}
                <Text style={[styles.drawPlus, { color: textSecondary }]}>+</Text>
                <LottoBall number={drawBonus} size={20} isBonus />
              </View>
            </View>
          )}
          {item.sets.map((set) => (
            <View key={set.id} style={lottoStyles.numberSetRow}>
              <Text style={[lottoStyles.setLabelBase, { color: textSecondary }]}>
                {String.fromCharCode(64 + set.setNumber)}
              </Text>
              <View style={lottoStyles.ballRow}>
                {set.numbers.map((num, i) => (
                  <LottoBall
                    key={i}
                    number={num}
                    size={32}
                    isMatched={winningSet ? winningSet.has(num) : false}
                  />
                ))}
              </View>
              {set.rank ? (
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{set.rank}</Text>
                </View>
              ) : set.evaluated && !set.rank ? (
                <View style={styles.loseBadge}>
                  <Text style={styles.loseBadgeText}>낙첨</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      );
    },
    [surfaceColor, cardBorderColor, tintColor, textSecondary],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>추천 기록</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: inputBgColor }]}>
        <IconSymbol name="magnifyingglass" size={18} color={placeholderColor} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="회차 검색"
          placeholderTextColor={placeholderColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
          keyboardType="number-pad"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={18} color={placeholderColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter & Sort */}
      <View style={styles.filterRow}>
        <View style={styles.filterChips}>
          <TouchableOpacity
            style={[
              styles.chip,
              !winOnly
                ? { backgroundColor: tintColor + '15' }
                : { borderColor: cardBorderColor, borderWidth: 1 },
            ]}
            onPress={() => setWinOnly(false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, { color: !winOnly ? tintColor : textSecondary }]}>
              전체
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chip,
              winOnly
                ? { backgroundColor: tintColor + '15' }
                : { borderColor: cardBorderColor, borderWidth: 1 },
            ]}
            onPress={() => setWinOnly(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, { color: winOnly ? tintColor : textSecondary }]}>
              당첨
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterChips}>
          <TouchableOpacity
            style={[
              styles.chip,
              !sortByAmount
                ? { backgroundColor: tintColor + '15' }
                : { borderColor: cardBorderColor, borderWidth: 1 },
            ]}
            onPress={() => setSortByAmount(false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, { color: !sortByAmount ? tintColor : textSecondary }]}>
              최신순
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chip,
              sortByAmount
                ? { backgroundColor: tintColor + '15' }
                : { borderColor: cardBorderColor, borderWidth: 1 },
            ]}
            onPress={() => setSortByAmount(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, { color: sortByAmount ? tintColor : textSecondary }]}>
              금액순
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={tintColor} />
      ) : roundGroups.length === 0 && !searchQuery && !winOnly ? (
        <EmptyState
          icon="ticket"
          title="아직 추천 기록이 없어요"
          message="번호를 생성하면 기록이 쌓입니다"
        />
      ) : roundGroups.length === 0 && !searchQuery && winOnly ? (
        <EmptyState
          icon="ticket"
          title="당첨 기록이 없어요"
          message="당첨되면 여기에 표시됩니다"
        />
      ) : roundGroups.length === 0 && searchQuery ? (
        <EmptyState
          icon="magnifyingglass"
          title={`${searchQuery}회차 기록이 없어요`}
          message="다른 회차를 검색해보세요"
        />
      ) : (
        <FlatList
          data={roundGroups}
          keyExtractor={(item) => String(item.round)}
          renderItem={renderRoundCard}
          getItemLayout={getItemLayout}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          contentContainerStyle={[styles.listContent, contentStyle]}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={tintColor}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                style={styles.footerLoader}
                color={tintColor}
              />
            ) : null
          }
        />
      )}
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 42,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.sm,
    paddingVertical: 0,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterChips: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  historyCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 2,
    marginBottom: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    paddingBottom: Spacing.sm,
  },
  drawLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    width: 20,
  },
  drawBalls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  drawPlus: {
    fontSize: 10,
    fontWeight: '600',
    marginHorizontal: 1,
  },
  roundLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  dateText: {
    fontSize: FontSizes.xs,
  },
  rankBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
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
  },
  loseBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
  },
});
