import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
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

  const {
    data: historyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useLottoHistory();

  const [refreshing, setRefreshing] = useState(false);

  const allHistory = historyData?.pages.flatMap((p) => p.content) ?? [];

  const roundGroups: RoundGroup[] = (() => {
    const grouped: Record<number, LottoRecommendation[]> = {};
    for (const item of allHistory) {
      if (!grouped[item.round]) grouped[item.round] = [];
      grouped[item.round].push(item);
    }
    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a)
      .map((round) => ({
        round,
        sets: grouped[round].sort((a, b) => a.setNumber - b.setNumber),
        date: format(new Date(grouped[round][0].createdAt), 'yyyy.MM.dd', { locale: ko }),
      }));
  })();

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

  const renderRoundCard = useCallback(
    ({ item }: { item: RoundGroup }) => (
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
        {item.sets.map((set) => (
          <View key={set.id} style={styles.historySet}>
            <Text style={[styles.setLabel, { color: textSecondary }]}>
              {String.fromCharCode(64 + set.setNumber)}
            </Text>
            <View style={styles.ballRow}>
              {set.numbers.map((num, i) => (
                <LottoBall key={i} number={num} size={36} />
              ))}
            </View>
            {set.rank && (
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{set.rank}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    ),
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
        <View style={styles.headerRight}>
          {roundGroups.length > 0 && (
            <Text style={[styles.countText, { color: textSecondary }]}>
              {allHistory.length}건
            </Text>
          )}
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={tintColor} />
      ) : roundGroups.length === 0 ? (
        <EmptyState
          icon="ticket"
          title="아직 추천 기록이 없어요"
          message="번호를 생성하면 기록이 쌓입니다"
        />
      ) : (
        <FlatList
          data={roundGroups}
          keyExtractor={(item) => String(item.round)}
          renderItem={renderRoundCard}
          contentContainerStyle={styles.listContent}
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
  countText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
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
  roundLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  dateText: {
    fontSize: FontSizes.xs,
  },
  historySet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  setLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    width: 20,
  },
  ballRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    flexShrink: 1,
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
  footerLoader: {
    paddingVertical: Spacing.lg,
  },
});
