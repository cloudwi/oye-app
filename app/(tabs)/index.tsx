import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useTodayFortune } from '@/hooks/queries/use-today-fortune';
import { shareService } from '@/services/share';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { FortuneCardSkeleton } from '@/components/ui/skeleton';
import { router } from 'expo-router';
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
import { getScoreColor } from '@/utils/score';
import { AdBanner } from '@/components/ads/ad-banner';

type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

function getFortuneIcon(score: number | null | undefined): {
  name: IconSymbolName;
  gradient: readonly [string, string];
} {
  if (score == null) return { name: 'sparkles', gradient: ['#A78BFA', '#7C5CBF'] };
  if (score >= 85) return { name: 'sun.max.fill', gradient: ['#F59E0B', '#EF6C00'] };
  if (score >= 70) return { name: 'cloud.sun.fill', gradient: ['#60A5FA', '#3B82F6'] };
  if (score >= 55) return { name: 'cloud.fill', gradient: ['#94A3B8', '#64748B'] };
  return { name: 'cloud.rain.fill', gradient: ['#6B7280', '#4B5563'] };
}

function getScoreGradient(
  score: number | null | undefined,
  isDark: boolean,
): readonly [string, string] {
  if (score == null) return isDark ? ['#1C1828', '#0F0F14'] : ['#F5F0FB', '#F5F5F5'];
  if (score >= 85) return isDark ? ['#1A1810', '#0F0F14'] : ['#FFF8E8', '#F5F5F5'];
  if (score >= 70) return isDark ? ['#10181E', '#0F0F14'] : ['#EDF5FF', '#F5F5F5'];
  if (score >= 55) return isDark ? ['#161618', '#0F0F14'] : ['#F2F2F5', '#F5F5F5'];
  return isDark ? ['#141416', '#0F0F14'] : ['#EDEDF0', '#F5F5F5'];
}

function getTimePeriod(): TimePeriod {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');

  const { contentStyle } = useResponsiveLayout();

  const { data: todayFortune, isLoading, refetch } = useTodayFortune();
  const [refreshing, setRefreshing] = useState(false);

  const timePeriod = useMemo(() => getTimePeriod(), []);
  const timeConfig = TimeTheme[timePeriod];
  const scoreGradient = getScoreGradient(todayFortune?.score, isDark);
  const gradientColors = todayFortune?.score != null ? scoreGradient : (isDark ? timeConfig.gradient.dark : timeConfig.gradient.light);

  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.95);

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleShare = useCallback(async () => {
    if (todayFortune) {
      await shareService.shareFortune(todayFortune);
    }
  }, [todayFortune]);

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
                {timeConfig.greeting}
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
          contentContainerStyle={[styles.content, contentStyle]}
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
              {timeConfig.greeting}
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
                  {(() => {
                    const icon = getFortuneIcon(todayFortune.score);
                    return (
                      <LinearGradient
                        colors={[icon.gradient[0], icon.gradient[1]]}
                        style={styles.iconGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <IconSymbol name={icon.name} size={32} color="#FFF" />
                      </LinearGradient>
                    );
                  })()}
                </View>

                {todayFortune.score != null && (
                  <View style={styles.scoreContainer}>
                    <Text
                      style={[styles.scoreValue, { color: getScoreColor(todayFortune.score) }]}
                      accessibilityLabel={`오늘의 예감 점수: ${todayFortune.score}점`}
                    >
                      {todayFortune.score}
                    </Text>
                    <Text style={[styles.scoreLabel, { color: textSecondary }]}>점</Text>
                  </View>
                )}

                <Text
                  style={[styles.fortuneContent, { color: textColor }]}
                  accessibilityLabel={`오늘의 운세: ${todayFortune.content}`}
                >
                  {todayFortune.content}
                </Text>
              </Animated.View>

              {/* Action Buttons */}
              <Animated.View style={[styles.actionRow, cardAnimStyle]}>
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
                <TouchableOpacity
                  style={[styles.historyButton, { borderColor: tintColor }]}
                  onPress={() => router.push('/(tabs)/history')}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="예감 기록 보기"
                >
                  <IconSymbol name="clock" size={18} color={tintColor} />
                  <Text style={[styles.historyButtonText, { color: tintColor }]}>기록 보기</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Banner Ad */}
              <AdBanner />
            </>
          ) : (
            <EmptyState
              icon="exclamationmark.circle"
              iconColor={BrandColors.error}
              title="예감을 불러올 수 없어요"
              message="아래로 당겨서 다시 시도해주세요"
              actionLabel="다시 시도"
              onAction={() => refetch()}
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
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: FontSizes.lg,
    fontWeight: '500',
    marginLeft: 2,
  },
  fortuneContent: {
    fontSize: 20,
    lineHeight: 32,
    textAlign: 'center',
  },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  shareButton: {
    flex: 1,
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
  historyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  historyButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },

});
