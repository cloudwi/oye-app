import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { LottoBall } from '@/components/lotto/lotto-ball';
import { useLottoRecommend } from '@/hooks/queries/use-lotto-recommend';
import { useLottoHistory } from '@/hooks/queries/use-lotto-history';
import { getUserFriendlyError } from '@/services/api/client';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '@/constants/theme';
import type { LottoRecommendation } from '@/types/lotto';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function LottoScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const cardBorderColor = useThemeColor({}, 'cardBorder');
  const tintColor = useThemeColor({}, 'tint');

  const recommend = useLottoRecommend();
  const {
    data: historyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useLottoHistory();
  const [refreshing, setRefreshing] = useState(false);

  const allHistory = historyData?.pages.flatMap((p) => p.content) ?? [];

  const groupedByRound = allHistory.reduce<Record<number, LottoRecommendation[]>>(
    (acc, item) => {
      if (!acc[item.round]) acc[item.round] = [];
      acc[item.round].push(item);
      return acc;
    },
    {}
  );
  const rounds = Object.keys(groupedByRound)
    .map(Number)
    .sort((a, b) => b - a);

  const handleGenerate = useCallback(() => {
    if (recommend.isPending) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    recommend.mutate(undefined, {
      onSuccess: () => {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      },
      onError: (error) => {
        const msg = getUserFriendlyError(error) || '번호 생성에 실패했습니다.';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('오류', msg);
        }
      },
    });
  }, [recommend]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Animated.View style={styles.header} entering={FadeIn.duration(300)}>
        <Text style={[styles.title, { color: textColor }]}>로또 번호 추천</Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          행운의 번호를 받아보세요
        </Text>
      </Animated.View>

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
        {/* Generate Button */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: tintColor }]}
            onPress={handleGenerate}
            disabled={recommend.isPending}
            activeOpacity={0.8}
          >
            {recommend.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol name="dice.fill" size={22} color="#FFFFFF" />
                <Text style={styles.generateText}>번호 생성하기</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Latest Generated Numbers */}
        {recommend.data && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(200)}
            style={[styles.resultCard, { backgroundColor: surfaceColor }, Shadows.md]}
          >
            <Text style={[styles.resultTitle, { color: textColor }]}>
              생성된 번호
            </Text>
            {[...recommend.data]
              .sort((a, b) => a.setNumber - b.setNumber)
              .map((set, idx) => (
                <View key={set.id} style={styles.numberSet}>
                  <Text style={[styles.setLabel, { color: textSecondary }]}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                  <View style={styles.ballRow}>
                    {set.numbers.map((num, i) => (
                      <LottoBall key={i} number={num} size={36} />
                    ))}
                  </View>
                </View>
              ))}
          </Animated.View>
        )}

        {/* History */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>추천 기록</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator style={styles.loader} color={tintColor} />
        ) : rounds.length === 0 && !recommend.data ? (
          <EmptyState
            icon="ticket"
            title="아직 추천 기록이 없어요"
            message="번호를 생성하면 기록이 쌓입니다"
          />
        ) : (
          rounds.map((round) => (
            <Animated.View
              key={round}
              entering={FadeInDown.duration(300)}
              style={[
                styles.historyCard,
                { backgroundColor: surfaceColor, borderColor: cardBorderColor },
              ]}
            >
              <Text style={[styles.roundLabel, { color: tintColor }]}>
                {round}회차
              </Text>
              {groupedByRound[round]
                .sort((a, b) => a.setNumber - b.setNumber)
                .map((set) => (
                  <View key={set.id} style={styles.historySet}>
                    <Text style={[styles.setLabel, { color: textSecondary }]}>
                      {String.fromCharCode(64 + set.setNumber)}
                    </Text>
                    <View style={styles.ballRow}>
                      {set.numbers.map((num, i) => (
                        <LottoBall key={i} number={num} size={32} />
                      ))}
                    </View>
                    {set.rank && (
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankText}>{set.rank}</Text>
                      </View>
                    )}
                  </View>
                ))}
              <Text style={[styles.dateText, { color: textSecondary }]}>
                {format(new Date(groupedByRound[round][0].createdAt), 'yyyy.MM.dd', { locale: ko })}
              </Text>
            </Animated.View>
          ))
        )}

        {hasNextPage && (
          <TouchableOpacity
            style={[styles.loadMoreButton, { borderColor: cardBorderColor }]}
            onPress={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <ActivityIndicator size="small" color={tintColor} />
            ) : (
              <Text style={[styles.loadMoreText, { color: tintColor }]}>더 보기</Text>
            )}
          </TouchableOpacity>
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
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    height: 52,
  },
  generateText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  resultCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  resultTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  numberSet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  setLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    width: 20,
  },
  ballRow: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 1,
  },
  sectionHeader: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  loader: {
    marginTop: Spacing.xl,
  },
  historyCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  roundLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  historySet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rankBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
  },
  dateText: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  loadMoreText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
