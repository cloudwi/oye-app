import React, { useEffect, useState, useCallback } from 'react';
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
import { useFortuneStore } from '@/stores/fortune-store';
import { fortuneApi } from '@/services/api/fortune';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { HistoryListSkeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '@/constants/theme';
import type { Fortune } from '@/types/fortune';

const PAGE_SIZE = 20;

export default function HistoryScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const {
    history,
    setHistory,
    appendHistory,
    isLoadingHistory,
    setLoadingHistory,
    historyPage,
    setHistoryPage,
    hasMoreHistory,
    setHasMoreHistory,
    isLoadingMore,
    setLoadingMore,
    resetHistory,
  } = useFortuneStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [totalCount, setTotalCount] = useState(0);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const result = await fortuneApi.getHistory(0, PAGE_SIZE);
      setHistory(result.content);
      setHistoryPage(0);
      setTotalCount(result.totalElements);
      setHasMoreHistory(result.page < result.totalPages - 1);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
    setLoadingHistory(false);
  };

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMoreHistory || isLoadingHistory) return;

    setLoadingMore(true);
    try {
      const nextPage = historyPage + 1;
      const result = await fortuneApi.getHistory(nextPage, PAGE_SIZE);
      if (result.content.length > 0) {
        appendHistory(result.content);
        setHistoryPage(nextPage);
      }
      setHasMoreHistory(result.page < result.totalPages - 1);
    } catch (error) {
      console.error('Error loading more history:', error);
    }
    setLoadingMore(false);
  }, [isLoadingMore, hasMoreHistory, isLoadingHistory, historyPage]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    resetHistory();
    try {
      const result = await fortuneApi.getHistory(0, PAGE_SIZE);
      setHistory(result.content);
      setHistoryPage(0);
      setTotalCount(result.totalElements);
      setHasMoreHistory(result.page < result.totalPages - 1);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
    setRefreshing(false);
    setLoadingHistory(false);
  };

  const renderItem = ({ item, index }: { item: Fortune; index: number }) => {
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
  };

  const renderEmpty = () => (
    <EmptyState
      icon="clock"
      title="아직 기록이 없어요"
      message="매일 예감을 확인하면 이곳에 기록됩니다"
    />
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={tintColor} />
      </View>
    );
  };

  if (isLoadingHistory && history.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>히스토리</Text>
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
          <Text style={[styles.title, { color: textColor }]}>히스토리</Text>
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
        data={history}
        renderItem={renderItem}
        keyExtractor={(item, index) => String(item.id ?? index)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
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
