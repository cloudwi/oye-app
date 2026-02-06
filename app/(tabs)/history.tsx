import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFortuneStore } from '@/stores/fortune-store';
import { format, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  BrandColors,
  ScoreColors,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '@/constants/theme';
import type { Fortune } from '@/types/fortune';

// Mock history data
function generateMockHistory(): Fortune[] {
  const history: Fortune[] = [];
  for (let i = 1; i <= 14; i++) {
    const date = subDays(new Date(), i);
    history.push({
      id: format(date, 'yyyy-MM-dd'),
      date: date.toISOString(),
      overallScore: Math.floor(Math.random() * 40) + 60,
      overallMessage: '하루를 돌아보며 감사함을 느껴보세요.',
      luckyColor: ['빨간색', '파란색', '노란색', '초록색'][Math.floor(Math.random() * 4)],
      luckyNumber: Math.floor(Math.random() * 9) + 1,
      luckyItem: ['열쇠', '반지', '우산', '책'][Math.floor(Math.random() * 4)],
      categories: [
        { category: 'love', score: Math.floor(Math.random() * 40) + 60, title: '', description: '', advice: '' },
        { category: 'money', score: Math.floor(Math.random() * 40) + 60, title: '', description: '', advice: '' },
        { category: 'health', score: Math.floor(Math.random() * 40) + 60, title: '', description: '', advice: '' },
        { category: 'work', score: Math.floor(Math.random() * 40) + 60, title: '', description: '', advice: '' },
        { category: 'study', score: Math.floor(Math.random() * 40) + 60, title: '', description: '', advice: '' },
      ],
      createdAt: date.toISOString(),
    });
  }
  return history;
}

function getScoreColor(score: number): string {
  if (score >= 80) return ScoreColors.excellent;
  if (score >= 60) return ScoreColors.good;
  if (score >= 40) return ScoreColors.average;
  if (score >= 20) return ScoreColors.belowAverage;
  return ScoreColors.poor;
}

function getScoreLabel(score: number): string {
  if (score >= 90) return '대길';
  if (score >= 70) return '길';
  if (score >= 50) return '보통';
  if (score >= 30) return '소흉';
  return '흉';
}

export default function HistoryScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { history, setHistory, isLoadingHistory, setLoadingHistory } = useFortuneStore();
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const mockHistory = generateMockHistory();
      setHistory({ fortunes: mockHistory, hasMore: false });
    } catch (error) {
      console.error('Error fetching history:', error);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    if (history.length === 0) {
      fetchHistory();
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const handleItemPress = (fortune: Fortune) => {
    router.push(`/fortune/${fortune.id}`);
  };

  const renderItem = ({ item, index }: { item: Fortune; index: number }) => {
    const scoreColor = getScoreColor(item.overallScore);
    const formattedDate = format(new Date(item.date), 'M월 d일', { locale: ko });
    const dayOfWeek = format(new Date(item.date), 'EEE', { locale: ko });

    return (
      <TouchableOpacity
        style={[styles.historyItem, { backgroundColor: surfaceColor }, Shadows.sm]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.dateSection}>
          <Text style={[styles.dateDay, { color: textColor }]}>{formattedDate}</Text>
          <Text style={[styles.dateDayOfWeek, { color: textSecondary }]}>{dayOfWeek}</Text>
        </View>

        <View style={styles.scoreSection}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>{item.overallScore}</Text>
          </View>
          <Text style={[styles.scoreLabel, { color: scoreColor }]}>
            {getScoreLabel(item.overallScore)}
          </Text>
        </View>

        <View style={styles.chevron}>
          <Text style={{ color: textSecondary, fontSize: 18 }}>{'>'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Text style={{ fontSize: 48 }}>{'( )'}</Text>
      </View>
      <Text style={[styles.emptyText, { color: textColor }]}>
        아직 운세 기록이 없어요
      </Text>
      <Text style={[styles.emptySubtext, { color: textSecondary }]}>
        매일 운세를 확인해보세요
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
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          지난 {history.length}일간의 운세
        </Text>
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
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
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  scoreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    marginTop: 4,
  },
  chevron: {
    marginLeft: Spacing.sm,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyIcon: {
    marginBottom: Spacing.lg,
    opacity: 0.3,
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
