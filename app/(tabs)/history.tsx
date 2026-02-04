import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFortuneStore } from '@/stores/fortune-store';
import { FortuneCard } from '@/components/fortune/fortune-card';
import { format, subDays } from 'date-fns';
import type { Fortune } from '@/types/fortune';

// Mock history data for testing
function generateMockHistory(): Fortune[] {
  const history: Fortune[] = [];
  for (let i = 1; i <= 14; i++) {
    const date = subDays(new Date(), i);
    history.push({
      id: format(date, 'yyyy-MM-dd'),
      date: date.toISOString(),
      overallScore: Math.floor(Math.random() * 40) + 60,
      overallMessage: '하루를 돌아보며 감사함을 느껴보세요. 작은 것에서 큰 행복을 발견할 수 있습니다.',
      luckyColor: ['빨간색', '파란색', '노란색', '초록색'][Math.floor(Math.random() * 4)],
      luckyNumber: Math.floor(Math.random() * 9) + 1,
      luckyItem: ['열쇠', '반지', '우산', '책'][Math.floor(Math.random() * 4)],
      categories: [
        { category: 'love', score: Math.floor(Math.random() * 40) + 60, title: '사랑운', description: '', advice: '' },
        { category: 'money', score: Math.floor(Math.random() * 40) + 60, title: '금전운', description: '', advice: '' },
        { category: 'health', score: Math.floor(Math.random() * 40) + 60, title: '건강운', description: '', advice: '' },
        { category: 'work', score: Math.floor(Math.random() * 40) + 60, title: '직장운', description: '', advice: '' },
        { category: 'study', score: Math.floor(Math.random() * 40) + 60, title: '학업운', description: '', advice: '' },
      ],
      createdAt: date.toISOString(),
    });
  }
  return history;
}

export default function HistoryScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const subtextColor = useThemeColor({ light: '#666', dark: '#999' }, 'icon');

  const { history, setHistory, isLoadingHistory, setLoadingHistory } = useFortuneStore();
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      // TODO: Replace with actual API call
      // const data = await fortuneApi.getHistory();
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

  const renderItem = ({ item }: { item: Fortune }) => (
    <FortuneCard
      fortune={item}
      onPress={() => handleItemPress(item)}
      variant="compact"
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: subtextColor }]}>
        아직 운세 기록이 없어요
      </Text>
      <Text style={[styles.emptySubtext, { color: subtextColor }]}>
        매일 운세를 확인하면 이곳에 기록됩니다
      </Text>
    </View>
  );

  if (isLoadingHistory && history.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>히스토리</Text>
          <Text style={[styles.subtitle, { color: subtextColor }]}>지난 운세 기록</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>히스토리</Text>
        <Text style={[styles.subtitle, { color: subtextColor }]}>지난 운세 기록</Text>
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
});
