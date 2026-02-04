import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFortuneStore } from '@/stores/fortune-store';
import { useUserStore } from '@/stores/user-store';
import { FortuneCard } from '@/components/fortune/fortune-card';
import { CategoryCard } from '@/components/fortune/category-card';
import { shareService } from '@/services/share';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Fortune } from '@/types/fortune';

// Mock fortune data for testing
function generateMockFortune(): Fortune {
  const today = new Date();
  return {
    id: format(today, 'yyyy-MM-dd'),
    date: today.toISOString(),
    overallScore: Math.floor(Math.random() * 30) + 70,
    overallMessage: '오늘은 새로운 시작에 좋은 날입니다. 평소 미뤄왔던 일을 시작해보세요. 예상치 못한 좋은 소식이 찾아올 수 있습니다.',
    luckyColor: '파란색',
    luckyNumber: Math.floor(Math.random() * 9) + 1,
    luckyItem: '은반지',
    categories: [
      {
        category: 'love',
        score: Math.floor(Math.random() * 30) + 70,
        title: '설레는 만남이 기다려요',
        description: '오늘은 새로운 인연을 만날 수 있는 좋은 날입니다. 평소와 다른 장소에서 특별한 만남이 기다리고 있을지도 몰라요.',
        advice: '마음을 열고 새로운 만남에 적극적으로 임해보세요.',
      },
      {
        category: 'money',
        score: Math.floor(Math.random() * 30) + 60,
        title: '안정적인 재정 운',
        description: '큰 지출은 피하고 저축에 집중하면 좋은 결과가 있을 것입니다. 충동구매는 자제하세요.',
        advice: '오늘은 큰 금액의 결정은 내일로 미루세요.',
      },
      {
        category: 'health',
        score: Math.floor(Math.random() * 30) + 70,
        title: '활력 넘치는 하루',
        description: '에너지가 넘치는 하루입니다. 가벼운 운동으로 하루를 시작하면 더욱 좋습니다.',
        advice: '충분한 수분 섭취를 잊지 마세요.',
      },
      {
        category: 'work',
        score: Math.floor(Math.random() * 30) + 65,
        title: '집중력이 높아지는 날',
        description: '업무 처리 능력이 높아지는 날입니다. 중요한 프로젝트나 회의가 있다면 좋은 성과를 기대할 수 있어요.',
        advice: '오전 시간대에 중요한 업무를 처리하세요.',
      },
      {
        category: 'study',
        score: Math.floor(Math.random() * 30) + 70,
        title: '학습 효율이 좋은 날',
        description: '새로운 것을 배우기에 적합한 날입니다. 집중력이 높아져 있으니 어려운 과목도 도전해보세요.',
        advice: '조용한 환경에서 공부하면 효과가 배가됩니다.',
      },
    ],
    createdAt: today.toISOString(),
  };
}

export default function TodayFortuneScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const subtextColor = useThemeColor({ light: '#666', dark: '#999' }, 'icon');

  const { user } = useUserStore();
  const { todayFortune, setTodayFortune, isLoading, setLoading } = useFortuneStore();
  const [refreshing, setRefreshing] = useState(false);

  const fetchTodayFortune = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const fortune = await fortuneApi.getToday();
      const fortune = generateMockFortune();
      setTodayFortune(fortune);
    } catch (error) {
      console.error('Error fetching fortune:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!todayFortune) {
      fetchTodayFortune();
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTodayFortune();
    setRefreshing(false);
  };

  const handleShare = async () => {
    if (todayFortune) {
      await shareService.shareFortune(todayFortune);
    }
  };

  const handleViewDetail = () => {
    if (todayFortune) {
      router.push(`/fortune/${todayFortune.id}`);
    }
  };

  const handleCategoryPress = (categoryIndex: number) => {
    if (todayFortune) {
      router.push(`/fortune/${todayFortune.id}?category=${categoryIndex}`);
    }
  };

  const today = format(new Date(), 'M월 d일 EEEE', { locale: ko });

  if (isLoading && !todayFortune) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={[styles.loadingText, { color: subtextColor }]}>
            오늘의 운세를 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: subtextColor }]}>
            {user?.birthDate ? '당신을 위한' : '오늘의'}
          </Text>
          <Text style={[styles.title, { color: textColor }]}>오늘의 운세</Text>
          <Text style={[styles.date, { color: subtextColor }]}>{today}</Text>
        </View>

        {todayFortune && (
          <>
            <FortuneCard
              fortune={todayFortune}
              onPress={handleViewDetail}
              onShare={handleShare}
              showDate={false}
            />

            <View style={styles.categoriesSection}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                카테고리별 운세
              </Text>
              <View style={styles.categoriesGrid}>
                {todayFortune.categories.map((category, index) => (
                  <CategoryCard
                    key={category.category}
                    category={category}
                    onPress={() => handleCategoryPress(index)}
                  />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
  categoriesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoriesGrid: {
    gap: 12,
  },
});
