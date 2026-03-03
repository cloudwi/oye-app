import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useGroupDetail } from '@/hooks/queries/use-group-detail';
import { useGroupCompatibility } from '@/hooks/queries/use-group-compatibility';
import { useRefresh } from '@/hooks/use-refresh';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { InviteCodeCard } from '@/components/ui/invite-code-card';
import { ScreenHeader } from '@/components/ui/screen-header';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '@/constants/theme';
import { getScoreColor } from '@/utils/score';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRewardedAd } from '@/hooks/use-rewarded-ad';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = Number(id);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const { contentStyle } = useResponsiveLayout();

  const { data: group, isLoading: isGroupLoading, refetch: refetchGroup } = useGroupDetail(groupId);
  const { data: compatibility, refetch: refetchCompatibility } = useGroupCompatibility(groupId);

  const { refreshing, onRefresh } = useRefresh(refetchGroup, refetchCompatibility);

  // Rewarded ad for unlocking group compatibility
  const { isLoaded: isAdLoaded, isEarned, show: showAd, reset: resetAd } = useRewardedAd();
  const [isUnlocked, setIsUnlocked] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (Platform.OS === 'web') return;
    AsyncStorage.getItem('group_compat_ad_unlocked').then((val) => {
      const today = new Date().toISOString().split('T')[0];
      if (val === today) setIsUnlocked(true);
    });
  }, []);

  useEffect(() => {
    if (isEarned) {
      const today = new Date().toISOString().split('T')[0];
      AsyncStorage.setItem('group_compat_ad_unlocked', today);
      setIsUnlocked(true);
      resetAd();
    }
  }, [isEarned, resetAd]);

  const handleWatchAd = useCallback(() => {
    if (isAdLoaded) showAd();
  }, [isAdLoaded, showAd]);

  if (isGroupLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ScreenHeader title="그룹" />
        <View style={styles.skeletonContainer}>
          <Skeleton height={120} borderRadius={BorderRadius.xl} />
          <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
            <Skeleton height={60} borderRadius={BorderRadius.lg} />
            <Skeleton height={60} borderRadius={BorderRadius.lg} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ScreenHeader title="그룹" />
        <EmptyState
          icon="person.2.fill"
          title="그룹을 찾을 수 없어요"
          message="그룹이 삭제되었거나 접근 권한이 없습니다"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScreenHeader
        title={group.name}
        rightAction={
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/group/settings/[id]', params: { id: groupId } })}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="그룹 설정"
          >
            <IconSymbol name="gearshape.fill" size={20} color={textColor} />
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
        {/* Invite Code Card */}
        <InviteCodeCard
          code={group.inviteCode}
          label="그룹 초대 코드"
          shareTitle="오늘의 예감 - 그룹 초대"
          shareMessage={`[오늘의 예감] 그룹 초대\n\n"${group.name}" 그룹에 초대합니다!\n초대 코드: ${group.inviteCode}\n\n오늘의 예감 앱에서 코드를 입력하고 그룹 궁합을 확인해보세요!`}
        />

        {/* Members Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>멤버</Text>
            <Text style={[styles.sectionCount, { color: textSecondary }]}>
              {group.members.length}명
            </Text>
          </View>

          {group.members.map((member) => (
            <View
              key={member.userId}
              style={[styles.memberItem, { backgroundColor: surfaceColor }, Shadows.sm]}
            >
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: textColor }]}>
                  {member.name ?? '이름 없음'}
                </Text>
                {member.isOwner && (
                  <View style={[styles.ownerBadge, { backgroundColor: tintColor + '15' }]}>
                    <Text style={[styles.ownerBadgeText, { color: tintColor }]}>관리자</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Compatibility Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>오늘의 궁합</Text>
            {compatibility?.compatibility && isUnlocked && (
              <Text style={[styles.compatibilityScore, { color: getScoreColor(compatibility.compatibility.score) }]}>
                {compatibility.compatibility.score}점
              </Text>
            )}
          </View>

          {compatibility?.compatibility ? (
            isUnlocked ? (
              <View style={[styles.compatibilityCard, { backgroundColor: surfaceColor }, Shadows.sm]}>
                <Text style={[styles.compatibilityContent, { color: textSecondary }]}>
                  {compatibility.compatibility.content}
                </Text>
              </View>
            ) : (
              <>
                <View style={[styles.compatibilityCard, { backgroundColor: surfaceColor, overflow: 'hidden' }, Shadows.sm]}>
                  <Text
                    numberOfLines={3}
                    style={[styles.compatibilityContent, { color: textSecondary, opacity: 0.12 }]}
                  >
                    {compatibility.compatibility.content}
                  </Text>
                </View>
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
            )
          ) : (
            <EmptyState
              icon="heart"
              title="아직 궁합 결과가 없어요"
              message="멤버가 2명 이상이면 매일 궁합이 생성됩니다"
            />
          )}
        </Animated.View>
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
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  sectionCount: {
    fontSize: FontSizes.sm,
  },
  compatibilityScore: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },

  // Member Item
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  memberName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  ownerBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  ownerBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },

  // Compatibility Card
  compatibilityCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  compatibilityContent: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
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
