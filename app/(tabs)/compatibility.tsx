import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useMyCode } from '@/hooks/queries/use-my-code';
import { useConnections } from '@/hooks/queries/use-connections';
import { useGroups } from '@/hooks/queries/use-groups';
import { useRefresh } from '@/hooks/use-refresh';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { InviteCodeCard } from '@/components/ui/invite-code-card';
import { router } from 'expo-router';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
  RelationConfig,
} from '@/constants/theme';
import { AdBanner } from '@/components/ads/ad-banner';
import { getScoreColor } from '@/utils/score';
import type { Connection } from '@/types/connection';
import type { GroupSummary } from '@/types/group';

export default function CompatibilityScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const { contentStyle } = useResponsiveLayout();

  const { data: myCode, isLoading: isCodeLoading, refetch: refetchCode } = useMyCode();
  const { data: connections, isLoading: isConnectionsLoading, refetch: refetchConnections } = useConnections();
  const { data: groups, isLoading: isGroupsLoading, refetch: refetchGroups } = useGroups();

  const { refreshing, onRefresh } = useRefresh(refetchCode, refetchConnections, refetchGroups);

  const handleConnectionPress = useCallback((connection: Connection) => {
    router.push({ pathname: '/connection/[id]', params: { id: connection.id } });
  }, []);

  const handleGroupPress = useCallback((group: GroupSummary) => {
    router.push({ pathname: '/group/[id]', params: { id: group.id } });
  }, []);

  const isLoading = isCodeLoading || isConnectionsLoading || isGroupsLoading;

  if (isLoading && !myCode && !connections && !groups) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>궁합</Text>
        </View>
        <View style={styles.skeletonContainer}>
          <Skeleton height={120} borderRadius={BorderRadius.xl} />
          <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
            <Skeleton height={72} borderRadius={BorderRadius.lg} />
            <Skeleton height={72} borderRadius={BorderRadius.lg} />
            <Skeleton height={72} borderRadius={BorderRadius.lg} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Filter connections to only show LOVER type in the 1:1 section
  const loverConnections = connections?.filter((c) => c.relationType === 'LOVER') ?? [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
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
        {/* Header */}
        <Animated.View style={styles.header} entering={FadeIn.duration(300)}>
          <Text style={[styles.title, { color: textColor }]}>궁합</Text>
        </Animated.View>

        {/* My Code Card */}
        <InviteCodeCard
          code={myCode?.code ?? ''}
          label="내 초대 코드"
          shareTitle="오늘의 예감 - 궁합 초대"
          shareMessage={`[오늘의 예감] 궁합 초대 코드\n\n내 코드: ${myCode?.code ?? ''}\n\n오늘의 예감 앱에서 코드를 입력하고 궁합을 확인해보세요!`}
        />

        {/* Banner Ad */}
        <AdBanner />

        {/* ── 연인 궁합 Section ── */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={{ marginTop: Spacing.md }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>연인 궁합</Text>
            {loverConnections.length > 0 && (
              <Text style={[styles.sectionCount, { color: textSecondary }]}>
                {loverConnections.length}명
              </Text>
            )}
          </View>

          {/* Add Connection Button */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: tintColor + '10' }]}
            onPress={() => router.push('/connection/connect')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="연인 코드로 연결하기"
          >
            <IconSymbol name="plus" size={18} color={tintColor} />
            <Text style={[styles.addButtonText, { color: tintColor }]}>연인 코드로 연결하기</Text>
          </TouchableOpacity>

          {loverConnections.length > 0 ? (
            loverConnections.map((connection, index) => {
              const config = RelationConfig[connection.relationType];
              return (
                <Animated.View
                  key={connection.id}
                  entering={FadeInDown.duration(400).delay(300 + index * 80)}
                >
                  <TouchableOpacity
                    style={[styles.connectionItem, { backgroundColor: surfaceColor }, Shadows.sm]}
                    onPress={() => handleConnectionPress(connection)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`${connection.partnerName}, ${config.label}, 궁합 확인하기`}
                  >
                    <View style={styles.connectionInfo}>
                      <View style={styles.connectionNameRow}>
                        <Text style={[styles.connectionName, { color: textColor }]}>
                          {connection.partnerName}
                        </Text>
                        <View style={[styles.relationBadge, { backgroundColor: config.color + '15' }]}>
                          <Text style={[styles.relationText, { color: config.color }]}>
                            {config.label}
                          </Text>
                        </View>
                      </View>
                      {connection.latestScore !== null ? (
                        <Text style={[styles.latestScore, { color: getScoreColor(connection.latestScore) }]}>
                          최근 궁합 {connection.latestScore}점
                        </Text>
                      ) : (
                        <Text style={[styles.latestScore, { color: textSecondary }]}>
                          아직 궁합을 확인하지 않았어요
                        </Text>
                      )}
                    </View>
                    <IconSymbol name="chevron.right" size={14} color={textSecondary} />
                  </TouchableOpacity>
                </Animated.View>
              );
            })
          ) : (
            <EmptyState
              icon="heart.fill"
              title="아직 연인 궁합이 없어요"
              message="초대 코드를 공유하거나 상대방의 코드를 입력해보세요"
            />
          )}
        </Animated.View>

        {/* ── 그룹 궁합 Section ── */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>그룹 궁합</Text>
            {groups && groups.length > 0 && (
              <Text style={[styles.sectionCount, { color: textSecondary }]}>
                {groups.length}개
              </Text>
            )}
          </View>

          {/* Group Action Buttons */}
          <View style={styles.groupActions}>
            <TouchableOpacity
              style={[styles.groupActionButton, { backgroundColor: tintColor + '10' }]}
              onPress={() => router.push('/group/create')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="그룹 만들기"
            >
              <IconSymbol name="plus" size={18} color={tintColor} />
              <Text style={[styles.addButtonText, { color: tintColor }]}>만들기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.groupActionButton, { backgroundColor: tintColor + '10' }]}
              onPress={() => router.push('/group/join')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="그룹 참여하기"
            >
              <IconSymbol name="person.2.fill" size={18} color={tintColor} />
              <Text style={[styles.addButtonText, { color: tintColor }]}>참여하기</Text>
            </TouchableOpacity>
          </View>

          {groups && groups.length > 0 ? (
            groups.map((group, index) => (
              <Animated.View
                key={group.id}
                entering={FadeInDown.duration(400).delay(500 + index * 80)}
              >
                <TouchableOpacity
                  style={[styles.connectionItem, { backgroundColor: surfaceColor }, Shadows.sm]}
                  onPress={() => handleGroupPress(group)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${group.name} 그룹, 궁합 확인하기`}
                >
                  <View style={styles.connectionInfo}>
                    <View style={styles.connectionNameRow}>
                      <Text style={[styles.connectionName, { color: textColor }]}>
                        {group.name}
                      </Text>
                      <View style={[styles.relationBadge, { backgroundColor: tintColor + '15' }]}>
                        <Text style={[styles.relationText, { color: tintColor }]}>
                          {group.memberCount}명
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.latestScore, { color: textSecondary }]}>
                      {group.isOwner ? '내가 관리' : RelationConfig[group.relationType]?.label ?? '그룹'}
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={textSecondary} />
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <EmptyState
              icon="person.2.fill"
              title="아직 그룹이 없어요"
              message="그룹을 만들거나 초대 코드로 참여해보세요"
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

  // Header
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  addButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },

  // Group Actions
  groupActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  groupActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  sectionCount: {
    fontSize: FontSizes.sm,
  },

  // Connection Item
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  connectionInfo: {
    flex: 1,
  },
  connectionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  connectionName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  relationBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  relationText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  latestScore: {
    fontSize: FontSizes.sm,
  },
});
