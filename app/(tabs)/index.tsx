import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/use-theme-color';
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
} from '@/constants/theme';

export default function TodayFortuneScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { todayFortune, setTodayFortune, isLoading, setLoading, setError } = useFortuneStore();
  const [refreshing, setRefreshing] = useState(false);

  const fetchTodayFortune = async () => {
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
  };

  useEffect(() => {
    fetchTodayFortune();
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

  const today = format(new Date(), 'M월 d일 EEEE', { locale: ko });

  if (isLoading && !todayFortune) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.dateText, { color: textSecondary }]}>{today}</Text>
            <Text style={[styles.title, { color: textColor }]}>오늘의 예감</Text>
          </View>
          <FortuneCardSkeleton />
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
          <Text style={[styles.title, { color: textColor }]}>오늘의 예감</Text>
        </View>

        {todayFortune ? (
          <>
            {/* Main Fortune Card */}
            <View
              style={[styles.fortuneCard, { backgroundColor: surfaceColor }, Shadows.lg]}
              accessibilityLabel="오늘의 운세 카드"
            >
              {/* Fortune Icon */}
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[BrandColors.primary, BrandColors.secondary]}
                  style={styles.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <IconSymbol name="sparkles" size={32} color="#FFF" />
                </LinearGradient>
              </View>

              {/* Fortune Content */}
              <Text
                style={[styles.fortuneContent, { color: textColor }]}
                accessibilityLabel={`오늘의 운세: ${todayFortune.content}`}
              >
                {todayFortune.content}
              </Text>

              {/* Share Button */}
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="운세 공유하기"
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

            {/* Tips Section */}
            <View style={styles.tipsSection}>
              <Text style={[styles.tipsTitle, { color: textColor }]}>오늘의 팁</Text>
              <View style={[styles.tipCard, { backgroundColor: surfaceColor }, Shadows.sm]}>
                <View style={[styles.tipIconBg, { backgroundColor: '#F59E0B' + '15' }]}>
                  <IconSymbol name="lightbulb.fill" size={20} color="#F59E0B" />
                </View>
                <Text style={[styles.tipText, { color: textSecondary }]}>
                  예감은 참고용입니다. 긍정적인 마음으로 하루를 시작하세요!
                </Text>
              </View>
            </View>
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
    fontSize: FontSizes.lg,
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: Spacing.xl,
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

  // Tips Section
  tipsSection: {
    marginTop: Spacing.xl,
  },
  tipsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  tipIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },

});
