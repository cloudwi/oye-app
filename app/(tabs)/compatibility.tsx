import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useConnections } from '@/hooks/queries/use-connections';
import { useGroups } from '@/hooks/queries/use-groups';
import { useSetLover, useUnsetLover } from '@/hooks/queries/use-set-lover';
import { useRefresh } from '@/hooks/use-refresh';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { TabHeader } from '@/components/ui/tab-header';
import { router } from 'expo-router';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
  RelationConfig,
} from '@/constants/theme';
import { getScoreColor } from '@/utils/score';
import type { Connection } from '@/types/connection';
import type { GroupSummary } from '@/types/group';

type Tab = 'lover' | 'group';

export default function CompatibilityScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const { contentStyle } = useResponsiveLayout();

  const [activeTab, setActiveTab] = useState<Tab>('lover');

  const { data: connections, isLoading: isConnectionsLoading, refetch: refetchConnections } = useConnections();
  const { data: groups, isLoading: isGroupsLoading, refetch: refetchGroups } = useGroups();

  const setLover = useSetLover();
  const unsetLover = useUnsetLover();

  const { refreshing, onRefresh } = useRefresh(refetchConnections, refetchGroups);

  const handleConnectionPress = useCallback((connection: Connection) => {
    router.push({ pathname: '/connection/[id]', params: { id: connection.id } });
  }, []);

  const handleGroupPress = useCallback((group: GroupSummary) => {
    router.push({ pathname: '/group/[id]', params: { id: group.id } });
  }, []);

  const isLoading = isConnectionsLoading || isGroupsLoading;

  if (isLoading && !connections && !groups) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <TabHeader title="궁합" />
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

  const loverConnection = connections?.find((c) => c.relationType === 'LOVER') ?? null;
  const friendConnections = connections?.filter((c) => c.relationType === 'FRIEND') ?? [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <TabHeader title="궁합" />
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

        {/* Segment Tabs */}
        <View style={[styles.segmentContainer, { backgroundColor: surfaceColor }]}>
          <TouchableOpacity
            style={[styles.segmentTab, activeTab === 'lover' && { backgroundColor }]}
            onPress={() => setActiveTab('lover')}
            activeOpacity={0.7}
          >
            <Text style={[styles.segmentText, { color: activeTab === 'lover' ? tintColor : textSecondary }]}>
              연인 궁합
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentTab, activeTab === 'group' && { backgroundColor }]}
            onPress={() => setActiveTab('group')}
            activeOpacity={0.7}
          >
            <Text style={[styles.segmentText, { color: activeTab === 'group' ? tintColor : textSecondary }]}>
              그룹 궁합
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── 연인 궁합 Tab ── */}
        {activeTab === 'lover' && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <View style={[styles.sectionHeader, { marginTop: Spacing.md }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>연인 궁합</Text>
            </View>

            {loverConnection ? (
              <>
                <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                  <TouchableOpacity
                    style={[styles.connectionItem, { backgroundColor: surfaceColor }, Shadows.sm]}
                    onPress={() => handleConnectionPress(loverConnection)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`${loverConnection.partnerName}, 연인 궁합 확인하기`}
                  >
                    <View style={styles.connectionInfo}>
                      <View style={styles.connectionNameRow}>
                        <Text style={[styles.connectionName, { color: textColor }]}>
                          {loverConnection.partnerName}
                        </Text>
                        <View style={[styles.relationBadge, { backgroundColor: RelationConfig.LOVER.color + '15' }]}>
                          <Text style={[styles.relationText, { color: RelationConfig.LOVER.color }]}>
                            연인
                          </Text>
                        </View>
                      </View>
                      {loverConnection.latestScore !== null ? (
                        <Text style={[styles.latestScore, { color: getScoreColor(loverConnection.latestScore) }]}>
                          최근 궁합 {loverConnection.latestScore}점
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
                <TouchableOpacity
                  style={styles.changeLoverButton}
                  onPress={() => unsetLover.mutate(loverConnection.id)}
                  disabled={unsetLover.isPending}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.changeLoverText, { color: textSecondary }]}>
                    {unsetLover.isPending ? '변경 중...' : '연인 변경하기'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : friendConnections.length > 0 ? (
              <>
                <Text style={[styles.pickerDescription, { color: textSecondary }]}>
                  친구 중 1명을 연인으로 선택하세요
                </Text>
                {friendConnections.map((connection, index) => (
                  <Animated.View
                    key={connection.id}
                    entering={FadeInDown.duration(400).delay(100 + index * 60)}
                  >
                    <TouchableOpacity
                      style={[styles.connectionItem, { backgroundColor: surfaceColor }, Shadows.sm]}
                      onPress={() => setLover.mutate(connection.id)}
                      disabled={setLover.isPending}
                      activeOpacity={0.7}
                    >
                      <View style={styles.connectionInfo}>
                        <Text style={[styles.connectionName, { color: textColor }]}>
                          {connection.partnerName}
                        </Text>
                        {connection.partnerNickname && (
                          <Text style={[styles.latestScore, { color: textSecondary }]}>
                            @{connection.partnerNickname}
                          </Text>
                        )}
                      </View>
                      {setLover.isPending && setLover.variables === connection.id ? (
                        <ActivityIndicator size="small" color={tintColor} />
                      ) : (
                        <IconSymbol name="heart" size={18} color={RelationConfig.LOVER.color} />
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </>
            ) : (
              <EmptyState
                icon="heart.fill"
                title="아직 연인 궁합이 없어요"
                message="먼저 친구를 추가한 후 연인으로 선택해보세요"
              />
            )}
          </Animated.View>
        )}

        {/* ── 그룹 궁합 Tab ── */}
        {activeTab === 'group' && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <View style={[styles.sectionHeader, { marginTop: Spacing.md }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>그룹 궁합</Text>
              {groups && groups.length > 0 && (
                <Text style={[styles.sectionCount, { color: textSecondary }]}>
                  {groups.length}개
                </Text>
              )}
            </View>

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
            </View>

            {groups && groups.length > 0 ? (
              groups.map((group, index) => (
                <Animated.View
                  key={group.id}
                  entering={FadeInDown.duration(400).delay(100 + index * 80)}
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
                message="그룹을 만들고 친구를 초대해보세요"
              />
            )}
          </Animated.View>
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
  skeletonContainer: {
    paddingHorizontal: Spacing.lg,
  },

  // Segment Tabs
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    borderRadius: BorderRadius.sm + 2,
  },
  segmentText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
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
    marginTop: Spacing.md,
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

  // Lover picker
  pickerDescription: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
  },
  changeLoverButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  changeLoverText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
});
