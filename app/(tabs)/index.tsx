import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  FadeIn,
} from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFortuneStore } from '@/stores/fortune-store';
import { fortuneApi } from '@/services/api/fortune';
import { shareService } from '@/services/share';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { FortuneCardSkeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  BrandColors,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
  TimeTheme,
} from '@/constants/theme';

type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

function getTimePeriod(): TimePeriod {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function TodayFortuneScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { todayFortune, setTodayFortune, isLoading, setLoading, setError } = useFortuneStore();
  const [refreshing, setRefreshing] = useState(false);
  const isFetching = useRef(false);

  const timePeriod = useMemo(() => getTimePeriod(), []);
  const timeConfig = TimeTheme[timePeriod];
  const gradientColors = isDark ? timeConfig.gradient.dark : timeConfig.gradient.light;

  // Card entrance animation
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.95);

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const fetchTodayFortune = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    setError(null);
    try {
      const fortune = await fortuneApi.getToday();
      setTodayFortune(fortune);
    } catch (error: any) {
      console.error('Error fetching fortune:', error);
      setError(error.message || '예감을 불러오는데 실패했습니다.');
    }
    setLoading(false);
    isFetching.current = false;
  };

  useEffect(() => {
    fetchTodayFortune();
  }, []);

  useEffect(() => {
    if (todayFortune) {
      cardOpacity.value = withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(200, withTiming(1, { duration: 400 })),
      );
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 0 }),
        withDelay(200, withTiming(1, { duration: 400 })),
      );
    }
  }, [todayFortune]);

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

  const today = format(new Date(), 'M월 d일 EEEE', { locale: ko });

  const backgroundGradient = (
    <LinearGradient
      colors={[gradientColors[0], gradientColors[1]]}
      style={styles.backgroundGradient}
    />
  );

  if (isLoading && !todayFortune) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        {backgroundGradient}
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[styles.greetingText, { color: textSecondary }]}>
                {timeConfig.greeting} {timeConfig.emoji}
              </Text>
              <Text style={[styles.dateText, { color: textSecondary }]}>{today}</Text>
              <Text style={[styles.title, { color: textColor }]}>오늘의 예감</Text>
            </View>
            <FortuneCardSkeleton />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {backgroundGradient}
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={BrandColors.accent}
            />
          }
        >
          {/* Header */}
          <Animated.View style={styles.header} entering={FadeIn.duration(300)}>
            <Text style={[styles.greetingText, { color: textSecondary }]}>
              {timeConfig.greeting} {timeConfig.emoji}
            </Text>
            <Text style={[styles.dateText, { color: textSecondary }]}>{today}</Text>
            <Text style={[styles.title, { color: textColor }]}>오늘의 예감</Text>
          </Animated.View>

          {todayFortune ? (
            <>
              {/* Fortune Card */}
              <Animated.View
                style={[
                  styles.fortuneCard,
                  { backgroundColor: surfaceColor },
                  Shadows.lg,
                  cardAnimStyle,
                ]}
                accessibilityLabel="오늘의 운세 카드"
              >
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={[timeConfig.iconGradient[0], timeConfig.iconGradient[1]]}
                    style={styles.iconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <IconSymbol name="sparkles" size={32} color="#FFF" />
                  </LinearGradient>
                </View>

                <Text
                  style={[styles.fortuneContent, { color: textColor }]}
                  accessibilityLabel={`오늘의 운세: ${todayFortune.content}`}
                >
                  {todayFortune.content}
                </Text>
              </Animated.View>

              {/* Share Button */}
              <Animated.View style={cardAnimStyle}>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleShare}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="운세 공유하기"
                >
                  <LinearGradient
                    colors={[timeConfig.iconGradient[0], timeConfig.iconGradient[1]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.shareGradient}
                  >
                    <IconSymbol name="square.and.arrow.up" size={18} color="#FFF" />
                    <Text style={styles.shareText}>공유하기</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </>
          ) : (
            <EmptyState
              icon="exclamationmark.circle"
              iconColor={BrandColors.error}
              title="예감을 불러올 수 없어요"
              message="아래로 당겨서 다시 시도해주세요"
              actionLabel="다시 시도"
              onAction={fetchTodayFortune}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.45,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  greetingText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  dateText: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },

  // Fortune Card
  fortuneCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fortuneContent: {
    fontSize: 20,
    lineHeight: 32,
    textAlign: 'center',
  },

  // Share Button
  shareButton: {
    marginTop: Spacing.md,
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
});
