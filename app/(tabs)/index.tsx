import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFortuneStore } from '@/stores/fortune-store';
import { useUserStore } from '@/stores/user-store';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { shareService } from '@/services/share';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  BrandColors,
  CategoryColors,
  ScoreColors,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '@/constants/theme';
import type { Fortune, FortuneCategory } from '@/types/fortune';
import { CATEGORY_LABELS } from '@/types/fortune';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCORE_RING_SIZE = 180;

// Mock fortune data for testing
function generateMockFortune(): Fortune {
  const today = new Date();
  return {
    id: format(today, 'yyyy-MM-dd'),
    date: today.toISOString(),
    overallScore: Math.floor(Math.random() * 30) + 70,
    overallMessage: '새로운 시작에 좋은 날이에요. 평소 미뤄왔던 일을 시작해보세요.',
    luckyColor: '파란색',
    luckyNumber: Math.floor(Math.random() * 9) + 1,
    luckyItem: '은반지',
    categories: [
      {
        category: 'love',
        score: Math.floor(Math.random() * 30) + 70,
        title: '설레는 만남',
        description: '새로운 인연을 만날 수 있는 좋은 날입니다.',
        advice: '마음을 열고 새로운 만남에 적극적으로 임해보세요.',
      },
      {
        category: 'money',
        score: Math.floor(Math.random() * 30) + 60,
        title: '안정적인 재정',
        description: '저축에 집중하면 좋은 결과가 있을 것입니다.',
        advice: '큰 금액의 결정은 내일로 미루세요.',
      },
      {
        category: 'health',
        score: Math.floor(Math.random() * 30) + 70,
        title: '활력 넘치는 하루',
        description: '에너지가 넘치는 하루입니다.',
        advice: '충분한 수분 섭취를 잊지 마세요.',
      },
      {
        category: 'work',
        score: Math.floor(Math.random() * 30) + 65,
        title: '집중력 UP',
        description: '업무 처리 능력이 높아지는 날입니다.',
        advice: '오전에 중요한 업무를 처리하세요.',
      },
      {
        category: 'study',
        score: Math.floor(Math.random() * 30) + 70,
        title: '학습 효율 상승',
        description: '새로운 것을 배우기에 적합한 날입니다.',
        advice: '조용한 환경에서 공부하세요.',
      },
    ],
    createdAt: today.toISOString(),
  };
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

const categoryIcons: Record<FortuneCategory, string> = {
  love: 'heart.fill',
  money: 'wonsign.circle.fill',
  health: 'leaf.fill',
  work: 'briefcase.fill',
  study: 'book.fill',
};

export default function TodayFortuneScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');
  const dividerColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'divider');

  const { user } = useUserStore();
  const { todayFortune, setTodayFortune, isLoading, setLoading } = useFortuneStore();
  const [refreshing, setRefreshing] = useState(false);

  const fetchTodayFortune = async () => {
    setLoading(true);
    try {
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
          <ActivityIndicator size="large" color={BrandColors.primary} />
          <Text style={[styles.loadingText, { color: textSecondary }]}>
            운세를 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const scoreColor = todayFortune ? getScoreColor(todayFortune.overallScore) : BrandColors.primary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={BrandColors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.dateText, { color: textSecondary }]}>{today}</Text>
          <Text style={[styles.title, { color: textColor }]}>오늘의 운세</Text>
        </View>

        {todayFortune && (
          <>
            {/* Main Score Card */}
            <View style={[styles.scoreCard, { backgroundColor: surfaceColor }, Shadows.lg]}>
              {/* Score Ring */}
              <View style={styles.scoreRingContainer}>
                <View style={[styles.scoreRingOuter, { borderColor: scoreColor + '30' }]}>
                  <View style={[styles.scoreRingInner, { borderColor: scoreColor }]}>
                    <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                      {todayFortune.overallScore}
                    </Text>
                    <Text style={[styles.scoreLabel, { color: scoreColor }]}>
                      {getScoreLabel(todayFortune.overallScore)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Message */}
              <Text style={[styles.fortuneMessage, { color: textColor }]}>
                {todayFortune.overallMessage}
              </Text>

              {/* Lucky Items */}
              <View style={[styles.luckySection, { borderTopColor: dividerColor }]}>
                <View style={styles.luckyItem}>
                  <View style={[styles.luckyIcon, { backgroundColor: BrandColors.primary + '15' }]}>
                    <IconSymbol name="paintpalette.fill" size={16} color={BrandColors.primary} />
                  </View>
                  <Text style={[styles.luckyValue, { color: textColor }]}>
                    {todayFortune.luckyColor}
                  </Text>
                </View>
                <View style={styles.luckyDivider} />
                <View style={styles.luckyItem}>
                  <View style={[styles.luckyIcon, { backgroundColor: BrandColors.secondary + '15' }]}>
                    <IconSymbol name="number" size={16} color={BrandColors.secondary} />
                  </View>
                  <Text style={[styles.luckyValue, { color: textColor }]}>
                    {todayFortune.luckyNumber}
                  </Text>
                </View>
                <View style={styles.luckyDivider} />
                <View style={styles.luckyItem}>
                  <View style={[styles.luckyIcon, { backgroundColor: BrandColors.accent + '15' }]}>
                    <IconSymbol name="star.fill" size={16} color={BrandColors.accent} />
                  </View>
                  <Text style={[styles.luckyValue, { color: textColor }]}>
                    {todayFortune.luckyItem}
                  </Text>
                </View>
              </View>

              {/* Share Button */}
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[BrandColors.primary, BrandColors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.shareGradient}
                >
                  <IconSymbol name="square.and.arrow.up" size={18} color="#FFF" />
                  <Text style={styles.shareText}>공유하기</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Category Grid */}
            <View style={styles.categorySection}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>카테고리별 운세</Text>
              <View style={styles.categoryGrid}>
                {todayFortune.categories.map((cat, index) => {
                  const catColor = CategoryColors[cat.category as keyof typeof CategoryColors];
                  return (
                    <TouchableOpacity
                      key={cat.category}
                      style={[styles.categoryCard, { backgroundColor: surfaceColor }, Shadows.sm]}
                      onPress={() => handleCategoryPress(index)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.categoryIconBg, { backgroundColor: catColor + '15' }]}>
                        <IconSymbol
                          name={categoryIcons[cat.category as FortuneCategory] as any}
                          size={20}
                          color={catColor}
                        />
                      </View>
                      <Text style={[styles.categoryName, { color: textSecondary }]}>
                        {CATEGORY_LABELS[cat.category as FortuneCategory]}
                      </Text>
                      <Text style={[styles.categoryScore, { color: catColor }]}>
                        {cat.score}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSizes.md,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  dateText: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },

  // Score Card
  scoreCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  scoreRingContainer: {
    marginBottom: Spacing.lg,
  },
  scoreRingOuter: {
    width: SCORE_RING_SIZE,
    height: SCORE_RING_SIZE,
    borderRadius: SCORE_RING_SIZE / 2,
    borderWidth: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingInner: {
    width: SCORE_RING_SIZE - 32,
    height: SCORE_RING_SIZE - 32,
    borderRadius: (SCORE_RING_SIZE - 32) / 2,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: FontSizes.display,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginTop: -4,
  },
  fortuneMessage: {
    fontSize: FontSizes.lg,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },

  // Lucky Section
  luckySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  luckyItem: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  luckyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  luckyValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  luckyDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },

  // Share Button
  shareButton: {
    width: '100%',
  },
  shareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  shareText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },

  // Category Section
  categorySection: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * 2) / 3,
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  categoryIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  categoryName: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },
  categoryScore: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
});
