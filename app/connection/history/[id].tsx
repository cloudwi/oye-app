import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useCompatibilityHistory } from '@/hooks/queries/use-compatibility-history';
import { useCompatibilityScoreTrend } from '@/hooks/queries/use-compatibility-score-trend';
import { useCompatibilityRecordDates } from '@/hooks/queries/use-compatibility-record-dates';
import { useConnections } from '@/hooks/queries/use-connections';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { HistoryListSkeleton } from '@/components/ui/skeleton';
import { ScoreTrendChart } from '@/components/ui/score-trend-chart';
import { MonthlyCalendar } from '@/components/ui/monthly-calendar';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
  RelationConfig,
} from '@/constants/theme';
import { getScoreColor } from '@/utils/score';
import type { CompatibilityResult } from '@/types/compatibility';
import type { RelationType } from '@/types/connection';

export default function CompatibilityHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const connectionId = Number(id);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const { contentStyle } = useResponsiveLayout();

  const { data: connections } = useConnections();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useCompatibilityHistory(connectionId);

  const now = new Date();
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: scoreTrendData, isLoading: scoreTrendLoading } =
    useCompatibilityScoreTrend(connectionId, 30);
  const { data: recordDatesData } =
    useCompatibilityRecordDates(connectionId, calendarYear, calendarMonth);

  const recordDatesSet = useMemo(
    () => new Set(recordDatesData ?? []),
    [recordDatesData]
  );

  const chartData = useMemo(
    () =>
      (scoreTrendData ?? []).map((p) => ({
        date: format(parseISO(p.date), 'M/d'),
        score: p.score,
      })),
    [scoreTrendData]
  );

  const connection = connections?.find((c) => c.id === connectionId);
  const relationConfig = connection ? RelationConfig[connection.relationType as RelationType] : null;
  const history = data?.pages.flatMap((page) => page.content) ?? [];
  const totalCount = data?.pages[0]?.totalElements ?? 0;

  const filteredHistory = useMemo(() => {
    if (!selectedDate) return history;
    return history.filter((item) => {
      const dateStr = item.date || item.createdAt?.split('T')[0];
      return dateStr === selectedDate;
    });
  }, [history, selectedDate]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

  const ITEM_HEIGHT = 76;
  const getItemLayout = useCallback((_data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  const renderItem = useCallback(
    ({ item }: { item: CompatibilityResult }) => {
      const dateStr = item.date || item.createdAt;
      const date = dateStr ? parseISO(dateStr) : new Date();
      const formattedDate = format(date, 'M월 d일', { locale: ko });
      const dayOfWeek = format(date, 'EEEE', { locale: ko });
      const scoreColor = getScoreColor(item.score);
      const isExpanded = expandedId === item.id;

      return (
        <TouchableOpacity
          style={[styles.historyItem, { backgroundColor: surfaceColor }, Shadows.sm]}
          onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${formattedDate} ${dayOfWeek} 궁합 ${item.score}점${isExpanded ? ', 펼쳐짐' : ', 접힘'}`}
        >
          <View style={styles.itemHeader}>
            <View style={styles.dateSection}>
              <Text style={[styles.dateDay, { color: textColor }]}>{formattedDate}</Text>
              <Text style={[styles.dateDayOfWeek, { color: textSecondary }]}>{dayOfWeek}</Text>
            </View>
            <View style={styles.scoreSection}>
              <Text style={[styles.scoreText, { color: scoreColor }]}>{item.score}점</Text>
              <IconSymbol
                name={isExpanded ? 'chevron.up' : 'chevron.down'}
                size={16}
                color={textSecondary}
              />
            </View>
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={[styles.divider, { backgroundColor: textSecondary + '20' }]} />
              <Text style={[styles.contentText, { color: textColor }]}>{item.content}</Text>
              {item.relationFortune && relationConfig && (
                <View style={[styles.relationFortuneRow, { backgroundColor: relationConfig.color + '1F' }]}>
                  <Text style={[styles.relationFortuneLabel, { color: relationConfig.color }]}>
                    {relationConfig.fortuneLabel}
                  </Text>
                  <Text style={[styles.relationFortuneText, { color: textColor }]}>
                    {item.relationFortune}
                  </Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [expandedId, surfaceColor, textColor, textSecondary, relationConfig]
  );

  const renderEmpty = () => (
    <EmptyState
      icon="clock"
      title="아직 궁합 기록이 없어요"
      message="매일 궁합을 확인하면 이곳에 기록됩니다"
    />
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={tintColor} />
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>궁합 기록</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.skeletonContainer}>
          <HistoryListSkeleton count={6} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <IconSymbol name="chevron.left" size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          {connection ? `${connection.partnerName} 궁합 기록` : '궁합 기록'}
        </Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.countContainer}>
        {Platform.OS === 'web' && (
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <IconSymbol name="arrow.clockwise" size={16} color={tintColor} />
          </TouchableOpacity>
        )}
        {totalCount > 0 && (
          <Text style={[styles.countText, { color: textSecondary }]}>
            총 {totalCount}개의 기록
          </Text>
        )}
      </View>

      <FlatList
        data={selectedDate ? filteredHistory : history}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        contentContainerStyle={[styles.listContent, contentStyle]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeaderContainer}>
            <ScoreTrendChart
              data={chartData}
              isLoading={scoreTrendLoading}
              title="궁합 점수 추이"
            />
            <MonthlyCalendar
              currentYear={calendarYear}
              currentMonth={calendarMonth}
              recordDates={recordDatesSet}
              selectedDate={selectedDate}
              onMonthChange={(y, m) => {
                setCalendarYear(y);
                setCalendarMonth(m);
              }}
              onDateSelect={(date) =>
                setSelectedDate(selectedDate === date ? null : date)
              }
            />
            {selectedDate && (
              <TouchableOpacity
                onPress={() => setSelectedDate(null)}
                style={styles.clearFilter}
              >
                <Text style={[styles.clearFilterText, { color: tintColor }]}>
                  필터 해제
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={selectedDate ? undefined : handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          Platform.OS !== 'web' ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={tintColor}
            />
          ) : undefined
        }
      />
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  refreshButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: FontSizes.sm,
  },
  skeletonContainer: {
    paddingHorizontal: Spacing.lg,
  },
  listHeaderContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  clearFilter: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  clearFilterText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  footerLoader: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },

  // History Item
  historyItem: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateSection: {
    flex: 1,
  },
  dateDay: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  dateDayOfWeek: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scoreText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  expandedContent: {
    marginTop: Spacing.md,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.md,
  },
  contentText: {
    fontSize: FontSizes.md,
    lineHeight: 24,
  },
  relationFortuneRow: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  relationFortuneLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  relationFortuneText: {
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
});
