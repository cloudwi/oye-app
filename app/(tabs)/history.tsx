import React, { useEffect, useState } from 'react';
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
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFortuneStore } from '@/stores/fortune-store';
import { fortuneApi } from '@/services/api/fortune';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  BrandColors,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '@/constants/theme';
import type { Fortune } from '@/types/fortune';

export default function HistoryScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { history, setHistory, isLoadingHistory, setLoadingHistory } = useFortuneStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const fortunes = await fortuneApi.getHistory();
      setHistory(fortunes);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const handleItemPress = (fortune: Fortune) => {
    setSelectedId(selectedId === fortune.id ? null : fortune.id);
  };

  const renderItem = ({ item }: { item: Fortune }) => {
    const formattedDate = format(new Date(item.date), 'M월 d일', { locale: ko });
    const dayOfWeek = format(new Date(item.date), 'EEEE', { locale: ko });
    const isExpanded = selectedId === item.id;

    return (
      <TouchableOpacity
        style={[styles.historyItem, { backgroundColor: surfaceColor }, Shadows.sm]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
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
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconBg, { backgroundColor: BrandColors.primary + '15' }]}>
        <IconSymbol name="clock" size={32} color={BrandColors.primary} />
      </View>
      <Text style={[styles.emptyText, { color: textColor }]}>
        아직 기록이 없어요
      </Text>
      <Text style={[styles.emptySubtext, { color: textSecondary }]}>
        매일 운세를 확인하면 이곳에 기록됩니다
      </Text>
    </View>
  );

  if (isLoadingHistory && history.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>히스토리</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>히스토리</Text>
        {history.length > 0 && (
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            총 {history.length}개의 기록
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={BrandColors.primary}
          />
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
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
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

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: FontSizes.md,
  },
});