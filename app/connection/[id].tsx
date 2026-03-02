import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
  Share,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  withSequence,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useCompatibility } from '@/hooks/queries/use-compatibility';
import { useConnections } from '@/hooks/queries/use-connections';
import { useDeleteConnection } from '@/hooks/queries/use-delete-connection';
import { useRefresh } from '@/hooks/use-refresh';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { router, useLocalSearchParams } from 'expo-router';
import {
  BrandColors,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
  RelationConfig,
} from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getScoreColor } from '@/utils/score';
import { useRewardedAd } from '@/hooks/use-rewarded-ad';
import type { RelationType } from '@/types/connection';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const GAUGE_SIZE = 160;
const STROKE_WIDTH = 12;
const RADIUS = (GAUGE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ConnectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const connectionId = Number(id);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const { contentStyle } = useResponsiveLayout();

  const { data: connections } = useConnections();
  const { data: compatibility, isLoading, refetch } = useCompatibility(connectionId);
  const deleteConnection = useDeleteConnection();

  const connection = connections?.find((c) => c.id === connectionId);
  const config = connection ? RelationConfig[connection.relationType] : null;

  const { refreshing, onRefresh } = useRefresh(refetch);

  // Rewarded ad for unlocking compatibility
  const { isLoaded: isAdLoaded, isEarned, show: showAd, reset: resetAd } = useRewardedAd();
  const [isUnlocked, setIsUnlocked] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (Platform.OS === 'web') return;
    AsyncStorage.getItem('compat_ad_unlocked').then((val) => {
      const today = new Date().toISOString().split('T')[0];
      if (val === today) setIsUnlocked(true);
    });
  }, []);

  useEffect(() => {
    if (isEarned) {
      const today = new Date().toISOString().split('T')[0];
      AsyncStorage.setItem('compat_ad_unlocked', today);
      setIsUnlocked(true);
      resetAd();
    }
  }, [isEarned, resetAd]);

  const handleWatchAd = useCallback(() => {
    if (isAdLoaded) showAd();
  }, [isAdLoaded, showAd]);

  // Score animation
  const scoreProgress = useSharedValue(0);

  useEffect(() => {
    if (compatibility?.score !== undefined && isUnlocked) {
      scoreProgress.value = withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(300, withTiming(compatibility.score / 100, { duration: 800 })),
      );
    }
  }, [compatibility?.score, isUnlocked]);

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - scoreProgress.value),
  }));

  const handleShare = useCallback(async () => {
    if (!compatibility || !connection) return;
    const message = `[오늘의 예감] ${connection.partnerName}님과의 궁합\n\n오늘의 궁합 점수: ${compatibility.score}점\n\n${compatibility.content}\n\nhttps://apps.apple.com/app/id6759439435`;

    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ title: '오늘의 예감 - 궁합', text: message });
        } else {
          await navigator.clipboard.writeText(message);
        }
      } else {
        await Share.share({ message, title: '오늘의 예감 - 궁합' });
      }
    } catch {
      // User cancelled
    }
  }, [compatibility, connection]);

  const handleDelete = useCallback(() => {
    const doDelete = () => {
      deleteConnection.mutate(connectionId, {
        onSuccess: () => {
          router.back();
        },
      });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('이 연결을 삭제하시겠습니까?')) {
        doDelete();
      }
      return;
    }
    Alert.alert(
      '연결 삭제',
      '이 연결을 삭제하시겠습니까?\n삭제 후에는 궁합 기록도 사라집니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: doDelete },
      ]
    );
  }, [connectionId, deleteConnection]);

  const handleMore = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '연결 삭제'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleDelete();
        },
      );
    } else {
      handleDelete();
    }
  }, [handleDelete]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ScreenHeader title="궁합 결과" />
        <View style={styles.skeletonContainer}>
          <Skeleton height={40} width={200} borderRadius={BorderRadius.sm} style={{ alignSelf: 'center' }} />
          <Skeleton height={GAUGE_SIZE} width={GAUGE_SIZE} borderRadius={GAUGE_SIZE / 2} style={{ alignSelf: 'center', marginTop: Spacing.xl }} />
          <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
            <Skeleton height={18} />
            <Skeleton height={18} />
            <Skeleton height={18} width="70%" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const scoreColor = compatibility ? getScoreColor(compatibility.score) : tintColor;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScreenHeader
        title="궁합 결과"
        rightAction={
          <TouchableOpacity
            onPress={handleMore}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="더보기"
          >
            <IconSymbol name="ellipsis" size={20} color={textColor} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tintColor}
          />
        }
      >
        {/* Partner Info */}
        {connection && config && (
          <Animated.View style={styles.partnerInfo} entering={FadeIn.duration(300)}>
            <Text style={[styles.partnerName, { color: textColor }]}>
              {connection.partnerName}
            </Text>
            <View style={[styles.relationBadge, { backgroundColor: config.color + '15' }]}>
              <Text style={[styles.relationText, { color: config.color }]}>
                {config.label}
              </Text>
            </View>
          </Animated.View>
        )}

        {compatibility ? (
          <>
            {/* Score Gauge */}
            <Animated.View
              style={[styles.gaugeContainer, { backgroundColor: surfaceColor }, Shadows.lg]}
              entering={FadeInDown.duration(400).delay(100)}
            >
              <View style={styles.gauge}>
                <Svg width={GAUGE_SIZE} height={GAUGE_SIZE}>
                  {/* Background circle */}
                  <Circle
                    cx={GAUGE_SIZE / 2}
                    cy={GAUGE_SIZE / 2}
                    r={RADIUS}
                    stroke={(isUnlocked ? scoreColor : tintColor) + '20'}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                  />
                  {/* Score circle - only when unlocked */}
                  {isUnlocked && (
                    <AnimatedCircle
                      cx={GAUGE_SIZE / 2}
                      cy={GAUGE_SIZE / 2}
                      r={RADIUS}
                      stroke={scoreColor}
                      strokeWidth={STROKE_WIDTH}
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${CIRCUMFERENCE}`}
                      // @ts-ignore - animatedProps type mismatch between reanimated and react-native-svg
                      animatedProps={animatedCircleProps}
                      rotation={-90}
                      origin={`${GAUGE_SIZE / 2}, ${GAUGE_SIZE / 2}`}
                    />
                  )}
                </Svg>
                <View style={styles.scoreOverlay}>
                  <Text style={[styles.scoreNumber, { color: isUnlocked ? scoreColor : tintColor }]}>
                    {isUnlocked ? compatibility.score : '?'}
                  </Text>
                  {isUnlocked && (
                    <Text style={[styles.scoreUnit, { color: textSecondary }]}>점</Text>
                  )}
                </View>
              </View>
            </Animated.View>

            {isUnlocked ? (
              <>
                {/* Analysis Content */}
                <Animated.View
                  style={[styles.analysisCard, { backgroundColor: surfaceColor }, Shadows.sm]}
                  entering={FadeInDown.duration(400).delay(200)}
                >
                  <Text
                    style={[styles.analysisText, { color: textColor }]}
                    accessibilityLabel={`궁합 분석: ${compatibility.content}`}
                  >
                    {compatibility.content}
                  </Text>
                </Animated.View>

                {/* Action Buttons */}
                <Animated.View style={styles.actions} entering={FadeInDown.duration(400).delay(300)}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: tintColor }]}
                    onPress={handleShare}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="궁합 결과 공유하기"
                  >
                    <IconSymbol name="square.and.arrow.up" size={18} color="#FFF" />
                    <Text style={styles.actionButtonText}>공유하기</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.outlineButton, { borderColor: tintColor }]}
                    onPress={() => router.push({ pathname: '/connection/history/[id]', params: { id: connectionId } })}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="궁합 기록 보기"
                  >
                    <IconSymbol name="clock" size={18} color={tintColor} />
                    <Text style={[styles.actionButtonText, { color: tintColor }]}>기록 보기</Text>
                  </TouchableOpacity>
                </Animated.View>
              </>
            ) : (
              <>
                {/* Locked Analysis Teaser */}
                <View
                  style={[styles.analysisCard, { backgroundColor: surfaceColor, overflow: 'hidden' }, Shadows.sm]}
                >
                  <Text
                    numberOfLines={3}
                    style={[styles.analysisText, { color: textColor, opacity: 0.12 }]}
                  >
                    {compatibility.content}
                  </Text>
                </View>

                {/* Ad CTA */}
                <TouchableOpacity
                  style={[styles.adButton, { backgroundColor: tintColor, opacity: isAdLoaded ? 1 : 0.5 }]}
                  onPress={handleWatchAd}
                  disabled={!isAdLoaded}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="sparkles" size={20} color="#FFF" />
                  <Text style={styles.adButtonText}>
                    {isAdLoaded ? '광고 보고 결과 확인하기' : '광고 준비 중...'}
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.adSubtext, { color: textSecondary }]}>
                  짧은 광고 시청 후 오늘의 궁합 결과를 확인할 수 있어요
                </Text>
              </>
            )}
          </>
        ) : (
          <EmptyState
            icon="heart"
            title="궁합을 불러올 수 없어요"
            message="아래로 당겨서 다시 시도해주세요"
            actionLabel="다시 시도"
            onAction={() => refetch()}
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
  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  skeletonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },

  // Partner Info
  partnerInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  partnerName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  relationBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  relationText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },

  // Gauge
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
  },
  gauge: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '700',
  },
  scoreUnit: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    marginTop: -4,
  },

  // Analysis
  analysisCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  analysisText: {
    fontSize: FontSizes.md,
    lineHeight: 26,
  },

  // Actions
  actions: {
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    height: 52,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },

  // Ad lock
  adButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    height: 52,
    marginBottom: Spacing.sm,
  },
  adButtonText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  adSubtext: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
});
