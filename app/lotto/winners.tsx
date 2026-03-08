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
import { useLottoWinners } from '@/hooks/queries/use-lotto-winners';
import { Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import type { LottoWinner } from '@/types/lotto';

export default function LottoWinnersScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const cardBorderColor = useThemeColor({}, 'cardBorder');
  const tintColor = useThemeColor({}, 'tint');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useLottoWinners();

  const [refreshing, setRefreshing] = useState(false);

  const allWinners = data?.pages.flatMap((p) => p.content) ?? [];

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

  const renderItem = useCallback(
    ({ item, index }: { item: LottoWinner; index: number }) => (
      <View
        style={[
          styles.card,
          { backgroundColor: surfaceColor, borderColor: cardBorderColor },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={[styles.roundLabel, { color: tintColor }]}>
              {item.round}회차
            </Text>
            <Text style={[styles.nickname, { color: textSecondary }]}>
              @{item.nickname}
            </Text>
          </View>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{item.rank}</Text>
          </View>
        </View>
        <View style={styles.ballsRow}>
          {item.numbers.map((num, i) => (
            <LottoBall key={i} number={num} size={36} />
          ))}
        </View>
        <Text style={[styles.matchText, { color: textSecondary }]}>
          {item.matchCount}개 일치{item.bonusMatch ? ' +보너스' : ''}
          {item.drawDate ? ` · ${item.drawDate}` : ''}
        </Text>
      </View>
    ),
    [surfaceColor, cardBorderColor, tintColor, textSecondary],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>당첨자 현황</Text>
        <View style={styles.headerRight} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={tintColor} />
      ) : allWinners.length === 0 ? (
        <EmptyState
          icon="trophy.fill"
          title="아직 당첨자가 없어요"
          message="번호를 생성하고 당첨을 확인해보세요"
        />
      ) : (
        <FlatList
          data={allWinners}
          keyExtractor={(item, idx) => `${item.round}-${item.rank}-${idx}`}
          renderItem={renderItem}
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
              <ActivityIndicator style={styles.footerLoader} color={tintColor} />
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
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    gap: 2,
  },
  nickname: {
    fontSize: FontSizes.xs,
  },
  roundLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  rankBadge: {
    borderWidth: 1,
    borderColor: '#888',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
  },
  ballsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  matchText: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
  },
});
