import React, { useCallback, useState } from 'react';
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
import { useCompatibilityHistory } from '@/hooks/queries/use-compatibility-history';
import { useConnections } from '@/hooks/queries/use-connections';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { HistoryListSkeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '@/constants/theme';
import type { CompatibilityResult } from '@/types/compatibility';

function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#22C55E';
  if (score >= 40) return '#F59E0B';
  if (score >= 20) return '#F97316';
  return '#EF4444';
}

export default function CompatibilityHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const connectionId = Number(id);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { data: connections } = useConnections();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useCompatibilityHistory(connectionId);

  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const connection = connections?.find((c) => c.id === connectionId);
  const history = data?.pages.flatMap((page) => page.content) ?? [];
  const totalCount = data?.pages[0]?.totalElements ?? 0;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

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
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [expandedId, surfaceColor, textColor, textSecondary]
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
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
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
});
