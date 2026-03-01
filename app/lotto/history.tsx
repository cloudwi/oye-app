import React, { useCallback, useState } from 'react';
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

  const {
    data: historyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useLottoHistory();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const inputBgColor = useThemeColor({}, 'inputBackground');
  const placeholderColor = useThemeColor({}, 'placeholder');

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
      .filter((round) => !searchQuery || String(round).includes(searchQuery))
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
          <View key={set.id} style={lottoStyles.numberSetRow}>
            <Text style={[lottoStyles.setLabelBase, { color: textSecondary }]}>
              {String.fromCharCode(64 + set.setNumber)}
            </Text>
            <View style={lottoStyles.ballRow}>
              {set.numbers.map((num, i) => (
                <LottoBall key={i} number={num} size={36} />
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

      {/* Content */}
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={tintColor} />
      ) : roundGroups.length === 0 && !searchQuery ? (
        <EmptyState
          icon="ticket"
          title="아직 추천 기록이 없어요"
          message="번호를 생성하면 기록이 쌓입니다"
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
