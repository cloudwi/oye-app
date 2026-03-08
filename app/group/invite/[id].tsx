import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useConnections } from '@/hooks/queries/use-connections';
import { useGroupDetail } from '@/hooks/queries/use-group-detail';
import { useAddMember } from '@/hooks/queries/use-add-member';
import { ScreenHeader } from '@/components/ui/screen-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalSearchParams } from 'expo-router';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '@/constants/theme';
import type { Connection } from '@/types/connection';

export default function GroupInviteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = Number(id);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const { contentStyle } = useResponsiveLayout();

  const { data: connections, isLoading: isConnectionsLoading } = useConnections();
  const { data: group, isLoading: isGroupLoading } = useGroupDetail(groupId);
  const addMember = useAddMember();

  const [invitingId, setInvitingId] = useState<number | null>(null);

  const availableFriends = useMemo(() => {
    if (!connections || !group) return [];
    const memberIds = new Set(group.members.map((m) => m.userId));
    return connections.filter(
      (c) => c.relationType === 'FRIEND' && !memberIds.has(c.partnerId)
    );
  }, [connections, group]);

  const handleInvite = useCallback(
    async (connection: Connection) => {
      setInvitingId(connection.partnerId);
      try {
        await addMember.mutateAsync({ groupId, userId: connection.partnerId });
        const msg = `${connection.partnerName}님을 초대했습니다.`;
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('초대 완료', msg);
        }
      } catch {
        const errMsg = '초대에 실패했습니다.';
        if (Platform.OS === 'web') {
          window.alert(errMsg);
        } else {
          Alert.alert('오류', errMsg);
        }
      } finally {
        setInvitingId(null);
      }
    },
    [groupId, addMember],
  );

  const isLoading = isConnectionsLoading || isGroupLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ScreenHeader title="친구 초대" />
        <View style={styles.skeletonContainer}>
          <Skeleton height={60} borderRadius={BorderRadius.lg} />
          <Skeleton height={60} borderRadius={BorderRadius.lg} />
          <Skeleton height={60} borderRadius={BorderRadius.lg} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScreenHeader title="친구 초대" />

      <FlatList
        data={availableFriends}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.content, contentStyle]}
        ListEmptyComponent={
          <EmptyState
            icon="person.2.fill"
            title="초대할 친구가 없어요"
            message="모든 친구가 이미 그룹에 참여 중이거나, 아직 친구가 없습니다"
          />
        }
        renderItem={({ item }) => {
          const isInviting = invitingId === item.partnerId;
          return (
            <View style={[styles.friendItem, { backgroundColor: surfaceColor }, Shadows.sm]}>
              <View style={styles.friendInfo}>
                <Text style={[styles.friendName, { color: textColor }]}>
                  {item.partnerName}
                </Text>
                {item.partnerNickname && (
                  <Text style={[styles.friendNickname, { color: textSecondary }]}>
                    @{item.partnerNickname}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.inviteButton, { backgroundColor: tintColor }]}
                onPress={() => handleInvite(item)}
                disabled={isInviting}
                activeOpacity={0.7}
              >
                {isInviting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.inviteButtonText}>초대</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  skeletonContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  friendNickname: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  inviteButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  inviteButtonText: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
