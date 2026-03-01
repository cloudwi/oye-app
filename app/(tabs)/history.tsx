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
import { useFortuneHistory } from '@/hooks/queries/use-fortune-history';
import { useFortuneScoreTrend } from '@/hooks/queries/use-fortune-score-trend';
import { useFortuneRecordDates } from '@/hooks/queries/use-fortune-record-dates';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { HistoryListSkeleton } from '@/components/ui/skeleton';
import { ScoreTrendChart } from '@/components/ui/score-trend-chart';
import { MonthlyCalendar } from '@/components/ui/monthly-calendar';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '@/constants/theme';
import type { Fortune } from '@/types/fortune';

export default function HistoryScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const { contentStyle } = useResponsiveLayout();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useFortuneHistory();

  const now = new Date();
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: scoreTrendData, isLoading: scoreTrendLoading } = useFortuneScoreTrend(30);
  const { data: recordDatesData } = useFortuneRecordDates(calendarYear, calendarMonth);

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

  const history = data?.pages.flatMap(page => page.content) ?? [];
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

  const renderItem = useCallback(({ item, index }: { item: Fortune; index: number }) => {
    const dateStr = item.date || item.createdAt;
    const date = dateStr ? parseISO(dateStr) : new Date();
    const formattedDate = format(date, 'M월 d일', { locale: ko });
    const dayOfWeek = format(date, 'EEEE', { locale: ko });
    const isExpanded = selectedId === (item.id ?? index);

    return (
      <TouchableOpacity
        style={[styles.historyItem, { backgroundColor: surfaceColor }, Shadows.sm]}
        onPress={() => setSelectedId(selectedId === (item.id ?? index) ? null : (item.id ?? index))}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${formattedDate} ${dayOfWeek} 운세 기록${isExpanded ? ', 펼쳐짐' : ', 접힘'}`}
      >
        <View style={styles.itemHeader}>
          <View style={styles.dateSection}>
            <Text style={[styles.dateDay, { color: textColor }]}>{formattedDate}</Text>
            <Text style={[styles.dateDayOfWeek, { color: textSecondary }]}>{dayOfWeek}</Text>
          </View>
          <IconSymbol
            name={isExpanded ? 'chevron.up' : 'chevron.down'}
            size={16}
            color={textSecondary}
          />
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={[styles.divider, { backgroundColor: textSecondary + '20' }]} />
            <Text style={[styles.contentText, { color: textColor }]}>{item.content}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [selectedId, surfaceColor, textColor, textSecondary]);

  const renderEmpty = () => (
    <EmptyState
      icon="clock"
      title="아직 기록이 없어요"
      message="매일 예감을 확인하면 이곳에 기록됩니다"
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
          <Text style={[styles.title, { color: textColor }]}>예감 기록</Text>
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
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: textColor }]}>예감 기록</Text>
          {Platform.OS === 'web' && (
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
              <IconSymbol name="arrow.clockwise" size={18} color={tintColor} />
            </TouchableOpacity>
          )}
        </View>
        {totalCount > 0 && (
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            총 {totalCount}개의 기록
          </Text>
        )}
      </View>

      <FlatList
        data={selectedDate ? filteredHistory : history}
        renderItem={renderItem}
        keyExtractor={(item, index) => String(item.id ?? index)}
        contentContainerStyle={[styles.listContent, contentStyle]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeaderContainer}>
            <ScoreTrendChart
              data={chartData}
              isLoading={scoreTrendLoading}
              title="점수 추이"
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  refreshButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
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
});
