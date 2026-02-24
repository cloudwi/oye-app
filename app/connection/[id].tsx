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
import { useCompatibility } from '@/hooks/queries/use-compatibility';
import { useConnections } from '@/hooks/queries/use-connections';
import { useDeleteConnection } from '@/hooks/queries/use-delete-connection';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { router, useLocalSearchParams } from 'expo-router';
import {
  BrandColors,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
  RelationConfig,
  ScoreColors,
} from '@/constants/theme';
import type { RelationType } from '@/types/connection';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function getScoreColor(score: number): string {
  if (score >= 80) return ScoreColors.excellent;
  if (score >= 60) return ScoreColors.good;
  if (score >= 40) return ScoreColors.average;
  if (score >= 20) return ScoreColors.belowAverage;
  return ScoreColors.poor;
}

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

  const { data: connections } = useConnections();
  const { data: compatibility, isLoading, refetch } = useCompatibility(connectionId);
  const deleteConnection = useDeleteConnection();

  const connection = connections?.find((c) => c.id === connectionId);
  const config = connection ? RelationConfig[connection.relationType] : null;

  const [refreshing, setRefreshing] = useState(false);

  // Score animation
  const scoreProgress = useSharedValue(0);

  useEffect(() => {
    if (compatibility?.score !== undefined) {
      scoreProgress.value = withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(300, withTiming(compatibility.score / 100, { duration: 800 })),
      );
    }
  }, [compatibility?.score]);

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - scoreProgress.value),
  }));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>궁합 결과</Text>
          <View style={styles.backButton} />
        </View>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <IconSymbol name="chevron.left" size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>궁합 결과</Text>
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="연결 삭제"
        >
          <IconSymbol name="trash.fill" size={18} color={BrandColors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
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
                    stroke={scoreColor + '20'}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                  />
                  {/* Score circle */}
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
                </Svg>
                <View style={styles.scoreOverlay}>
                  <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                    {compatibility.score}
                  </Text>
                  <Text style={[styles.scoreUnit, { color: textSecondary }]}>점</Text>
                </View>
              </View>
            </Animated.View>

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
});
