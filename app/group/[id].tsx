import React, { useCallback, useState } from 'react';
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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useGroupDetail } from '@/hooks/queries/use-group-detail';
import { useGroupCompatibility } from '@/hooks/queries/use-group-compatibility';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
  Gradients,
} from '@/constants/theme';
import { getScoreColor } from '@/utils/score';

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

  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchGroup(), refetchCompatibility()]);
    setRefreshing(false);
  }, [refetchGroup, refetchCompatibility]);

  const handleCopyCode = useCallback(async () => {
    if (!group?.inviteCode) return;
    await Clipboard.setStringAsync(group.inviteCode);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [group]);

  const handleShareCode = useCallback(async () => {
    if (!group?.inviteCode) return;
    const message = `[오늘의 예감] 그룹 초대\n\n"${group.name}" 그룹에 초대합니다!\n초대 코드: ${group.inviteCode}\n\n오늘의 예감 앱에서 코드를 입력하고 그룹 궁합을 확인해보세요!`;

    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ title: '오늘의 예감 - 그룹 초대', text: message });
        } else {
          await navigator.clipboard.writeText(message);
        }
      } else {
        const { Share } = require('react-native');
        await Share.share({ message, title: '오늘의 예감 - 그룹 초대' });
      }
    } catch {
      // User cancelled
    }
  }, [group]);

  if (isGroupLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <IconSymbol name="chevron.left" size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>그룹</Text>
          <View style={styles.headerButton} />
        </View>
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <IconSymbol name="chevron.left" size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>그룹</Text>
          <View style={styles.headerButton} />
        </View>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <IconSymbol name="chevron.left" size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
          {group.name}
        </Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/group/settings/[id]', params: { id: groupId } })}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="그룹 설정"
        >
          <IconSymbol name="gearshape.fill" size={20} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
      >
        {/* Invite Code Card */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={[styles.codeCard, { backgroundColor: surfaceColor }, Shadows.lg]}
        >
          <View style={styles.codeCardHeader}>
            <View style={[styles.codeIconBg, { backgroundColor: tintColor + '15' }]}>
              <IconSymbol name="link" size={18} color={tintColor} />
            </View>
            <Text style={[styles.codeLabel, { color: textSecondary }]}>그룹 초대 코드</Text>
          </View>

          <Text style={[styles.codeText, { color: textColor }]}>
            {group.inviteCode}
          </Text>

          <View style={styles.codeActions}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={handleCopyCode}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="초대 코드 복사"
            >
              <LinearGradient
                colors={Gradients.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.codeButton}
              >
                <IconSymbol name="doc.on.doc" size={16} color="#FFF" />
                <Text style={styles.codeButtonText}>{copied ? '복사됨!' : '복사'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.codeButton, styles.shareCodeButton, { borderColor: tintColor }]}
              onPress={handleShareCode}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="초대 코드 공유"
            >
              <IconSymbol name="square.and.arrow.up" size={16} color={tintColor} />
              <Text style={[styles.codeButtonText, { color: tintColor }]}>공유</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

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
            {compatibility && compatibility.compatibilities.length > 0 && (() => {
              const avg = Math.round(
                compatibility.compatibilities.reduce((sum, c) => sum + c.score, 0) / compatibility.compatibilities.length
              );
              return (
                <Text style={[styles.averageScore, { color: getScoreColor(avg) }]}>
                  평균 {avg}점
                </Text>
              );
            })()}
          </View>

          {compatibility && compatibility.compatibilities.length > 0 ? (
            compatibility.compatibilities.map((pair, index) => (
              <View
                key={index}
                style={[styles.pairCard, { backgroundColor: surfaceColor }, Shadows.sm]}
              >
                <View style={styles.pairHeader}>
                  <Text style={[styles.pairNames, { color: textColor }]}>
                    {pair.userAName ?? '?'} & {pair.userBName ?? '?'}
                  </Text>
                  <Text style={[styles.pairScore, { color: getScoreColor(pair.score) }]}>
                    {pair.score}점
                  </Text>
                </View>
                <Text style={[styles.pairContent, { color: textSecondary }]} numberOfLines={2}>
                  {pair.content}
                </Text>
              </View>
            ))
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  headerButton: {
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
  },

  // Code Card
  codeCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  codeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  codeIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  codeText: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  codeActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  codeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  shareCodeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  codeButtonText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
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
  averageScore: {
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

  // Pair Card
  pairCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  pairHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  pairNames: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  pairScore: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  pairContent: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
});
