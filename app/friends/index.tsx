import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useConnections } from '@/hooks/queries/use-connections';
import { useDeleteConnection } from '@/hooks/queries/use-delete-connection';
import { useRefresh } from '@/hooks/use-refresh';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsHeader } from '@/components/ui/settings-header';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
  RelationConfig,
} from '@/constants/theme';
import type { Connection } from '@/types/connection';

export default function FriendsScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const { contentStyle } = useResponsiveLayout();

  const { data: connections, isLoading, refetch } = useConnections();
  const deleteConnection = useDeleteConnection();
  const { refreshing, onRefresh } = useRefresh(refetch);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = useCallback((connection: Connection) => {
    const name = connection.partnerNickname || connection.partnerName;
    Alert.alert(
      '연결 해제',
      `${name}님과의 연결을 해제하시겠습니까?\n궁합 기록이 모두 삭제됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '해제',
          style: 'destructive',
          onPress: () => {
            setDeletingId(connection.id);
            deleteConnection.mutate(connection.id, {
              onSettled: () => setDeletingId(null),
            });
          },
        },
      ],
    );
  }, [deleteConnection]);

  const handleConnectionPress = useCallback((connection: Connection) => {
    router.push({ pathname: '/connection/[id]', params: { id: connection.id } });
  }, []);

  if (isLoading && !connections) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <SettingsHeader title="친구" />
        <View style={styles.skeletonContainer}>
          <Skeleton height={72} borderRadius={BorderRadius.lg} />
          <Skeleton height={72} borderRadius={BorderRadius.lg} />
          <Skeleton height={72} borderRadius={BorderRadius.lg} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <SettingsHeader title="친구" />

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
        {/* Add friend button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: tintColor + '10' }]}
          onPress={() => router.push('/connection/connect')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="친구 추가"
        >
          <IconSymbol name="plus" size={18} color={tintColor} />
          <Text style={[styles.addButtonText, { color: tintColor }]}>친구 추가</Text>
        </TouchableOpacity>

        {/* Connection list */}
        {connections && connections.length > 0 ? (
          connections.map((connection, index) => {
            const config = RelationConfig[connection.relationType];
            const isDeleting = deletingId === connection.id;

            return (
              <Animated.View
                key={connection.id}
                entering={FadeInDown.duration(300).delay(index * 60)}
              >
                <TouchableOpacity
                  style={[
                    styles.connectionCard,
                    { backgroundColor: surfaceColor },
                    Shadows.sm,
                    isDeleting && { opacity: 0.5 },
                  ]}
                  onPress={() => handleConnectionPress(connection)}
                  activeOpacity={0.7}
                  disabled={isDeleting}
                  accessibilityRole="button"
                  accessibilityLabel={`${connection.partnerName}, ${config.label}`}
                >
                  <View style={[styles.avatar, { backgroundColor: config.color + '15' }]}>
                    <IconSymbol name="person.fill" size={20} color={config.color} />
                  </View>

                  <View style={styles.connectionInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
                        {connection.partnerName}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: config.color + '15' }]}>
                        <Text style={[styles.badgeText, { color: config.color }]}>
                          {config.label}
                        </Text>
                      </View>
                    </View>
                    {connection.partnerNickname && (
                      <Text style={[styles.nickname, { color: textSecondary }]} numberOfLines={1}>
                        @{connection.partnerNickname}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(connection)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    disabled={isDeleting}
                  >
                    <IconSymbol name="trash" size={16} color={textSecondary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Animated.View>
            );
          })
        ) : (
          <EmptyState
            icon="person.2.fill"
            title="아직 연결된 친구가 없어요"
            message="닉네임 또는 코드로 친구를 추가해보세요"
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
  skeletonContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
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
  connectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  nickname: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  deleteButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
});
