import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useGroupDetail } from '@/hooks/queries/use-group-detail';
import { useLeaveGroup } from '@/hooks/queries/use-leave-group';
import { useDeleteGroup } from '@/hooks/queries/use-delete-group';
import { useKickMember } from '@/hooks/queries/use-kick-member';
import { useUserStore } from '@/stores/user-store';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Skeleton } from '@/components/ui/skeleton';
import { ScreenHeader } from '@/components/ui/screen-header';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
  Semantic,
} from '@/constants/theme';

export default function GroupSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = Number(id);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const { contentStyle } = useResponsiveLayout();

  const { data: group, isLoading } = useGroupDetail(groupId);
  const leaveGroup = useLeaveGroup();
  const deleteGroup = useDeleteGroup();
  const kickMember = useKickMember();

  const currentUserId = useUserStore((s) => s.user?.id);
  const isOwner = group ? group.ownerId === currentUserId : false;

  const handleKickMember = useCallback((userId: number, name: string) => {
    const doKick = () => {
      kickMember.mutate({ groupId, userId });
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`${name}님을 내보내시겠습니까?`)) {
        doKick();
      }
      return;
    }
    Alert.alert(
      '멤버 내보내기',
      `${name}님을 그룹에서 내보내시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '내보내기', style: 'destructive', onPress: doKick },
      ]
    );
  }, [groupId, kickMember]);

  const handleLeaveGroup = useCallback(() => {
    const doLeave = () => {
      leaveGroup.mutate(groupId, {
        onSuccess: () => {
          router.dismiss(2);
        },
      });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('그룹을 나가시겠습니까?')) {
        doLeave();
      }
      return;
    }
    Alert.alert(
      '그룹 나가기',
      '그룹을 나가시겠습니까?\n나간 후에는 궁합 기록이 사라집니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '나가기', style: 'destructive', onPress: doLeave },
      ]
    );
  }, [groupId, leaveGroup]);

  const handleDeleteGroup = useCallback(() => {
    const doDelete = () => {
      deleteGroup.mutate(groupId, {
        onSuccess: () => {
          router.dismiss(2);
        },
      });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('그룹을 삭제하시겠습니까? 모든 멤버가 자동으로 나가게 됩니다.')) {
        doDelete();
      }
      return;
    }
    Alert.alert(
      '그룹 삭제',
      '그룹을 삭제하시겠습니까?\n모든 멤버가 자동으로 나가게 되며, 궁합 기록도 모두 사라집니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: doDelete },
      ]
    );
  }, [groupId, deleteGroup]);

  const handleMemberPress = useCallback((userId: number, name: string, memberIsOwner: boolean) => {
    if (!isOwner || memberIsOwner) return;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '내보내기'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleKickMember(userId, name);
        },
      );
    } else {
      handleKickMember(userId, name);
    }
  }, [isOwner, handleKickMember]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ScreenHeader title="그룹 설정" />
        <View style={styles.skeletonContainer}>
          <Skeleton height={60} borderRadius={BorderRadius.lg} />
          <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
            <Skeleton height={50} borderRadius={BorderRadius.lg} />
            <Skeleton height={50} borderRadius={BorderRadius.lg} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!group) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScreenHeader title="그룹 설정" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        {/* Group Info */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={[styles.infoCard, { backgroundColor: surfaceColor }, Shadows.sm]}
        >
          <Text style={[styles.groupName, { color: textColor }]}>{group.name}</Text>
          <Text style={[styles.groupMeta, { color: textSecondary }]}>
            멤버 {group.members.length}명
          </Text>
        </Animated.View>

        {/* Members */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>멤버 관리</Text>

          {group.members.map((member) => (
            <TouchableOpacity
              key={member.userId}
              style={[styles.memberItem, { backgroundColor: surfaceColor }, Shadows.sm]}
              onPress={() => handleMemberPress(member.userId, member.name ?? '이름 없음', member.isOwner)}
              disabled={!isOwner || member.isOwner}
              activeOpacity={isOwner && !member.isOwner ? 0.7 : 1}
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
              {isOwner && !member.isOwner && (
                <IconSymbol name="chevron.right" size={14} color={textSecondary} />
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.dangerZone}>
          {!isOwner && (
            <TouchableOpacity
              style={[styles.dangerButton, { borderColor: Semantic.error + '40' }]}
              onPress={handleLeaveGroup}
              activeOpacity={0.7}
            >
              <Text style={[styles.dangerButtonText, { color: Semantic.error }]}>그룹 나가기</Text>
            </TouchableOpacity>
          )}
          {isOwner && (
            <TouchableOpacity
              style={[styles.dangerButton, { borderColor: Semantic.error + '40' }]}
              onPress={handleDeleteGroup}
              activeOpacity={0.7}
            >
              <Text style={[styles.dangerButtonText, { color: Semantic.error }]}>그룹 삭제</Text>
            </TouchableOpacity>
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

  // Info Card
  infoCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  groupName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  groupMeta: {
    fontSize: FontSizes.sm,
  },

  // Section
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
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

  // Danger Zone
  dangerZone: {
    marginTop: Spacing.xl,
  },
  dangerButton: {
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  dangerButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
