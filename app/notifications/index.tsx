import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useUnreadCount } from '@/hooks/queries/use-notifications';
import { useAcceptConnection } from '@/hooks/queries/use-accept-connection';
import { useRejectConnection } from '@/hooks/queries/use-reject-connection';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Spacing,
  BorderRadius,
  FontSizes,
} from '@/constants/theme';
import type { UserNotification, NotificationType } from '@/types/notification';

const NOTIFICATION_ICON: Record<NotificationType, { name: IconSymbolName; color: string }> = {
  GENERAL: { name: 'bell.fill', color: '#6B7280' },
  FORTUNE: { name: 'sparkles', color: '#A78BFA' },
  COMPATIBILITY: { name: 'heart.fill', color: '#D47C9A' },
  CONNECTION: { name: 'person.2.fill', color: '#5B8EC9' },
  GROUP: { name: 'person.3.fill', color: '#4CAF82' },
  LOTTO: { name: 'dice.fill', color: '#E8944E' },
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function parseMetadata(metadata: string | null): Record<string, unknown> | null {
  if (!metadata) return null;
  try {
    return JSON.parse(metadata);
  } catch {
    return null;
  }
}

export default function NotificationsScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');

  const { contentStyle } = useResponsiveLayout();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useNotifications();

  const { data: unreadData } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const acceptConnection = useAcceptConnection();
  const rejectConnection = useRejectConnection();

  const notifications = data?.pages.flatMap((p) => p.content) ?? [];
  const hasUnread = (unreadData?.count ?? 0) > 0;

  const [refreshing, setRefreshing] = React.useState(false);
  const [processedIds, setProcessedIds] = useState<Set<number>>(new Set());

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handlePress = useCallback((notification: UserNotification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  const handleAccept = useCallback((connectionId: number, notificationId: number) => {
    acceptConnection.mutate(connectionId, {
      onSuccess: () => {
        setProcessedIds((prev) => new Set(prev).add(notificationId));
        if (!notifications.find((n) => n.id === notificationId)?.isRead) {
          markAsRead.mutate(notificationId);
        }
      },
    });
  }, [acceptConnection, markAsRead, notifications]);

  const handleReject = useCallback((connectionId: number, notificationId: number) => {
    rejectConnection.mutate(connectionId, {
      onSuccess: () => {
        setProcessedIds((prev) => new Set(prev).add(notificationId));
        if (!notifications.find((n) => n.id === notificationId)?.isRead) {
          markAsRead.mutate(notificationId);
        }
      },
    });
  }, [rejectConnection, markAsRead, notifications]);

  const renderItem = useCallback(({ item }: { item: UserNotification }) => {
    const iconConfig = NOTIFICATION_ICON[item.type] ?? NOTIFICATION_ICON.GENERAL;
    const meta = parseMetadata(item.metadata);
    const isConnectionRequest = item.type === 'CONNECTION' && meta?.action === 'CONNECTION_REQUEST';
    const connectionId = meta?.connectionId as number | undefined;
    const isProcessed = processedIds.has(item.id);
    const isActioning = (acceptConnection.isPending || rejectConnection.isPending);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { backgroundColor: item.isRead ? 'transparent' : tintColor + '06' },
        ]}
        onPress={() => handlePress(item)}
        activeOpacity={0.6}
      >
        <View style={[styles.iconCircle, { backgroundColor: iconConfig.color + '15' }]}>
          <IconSymbol name={iconConfig.name} size={18} color={iconConfig.color} />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.notificationTitle,
                { color: textColor },
                !item.isRead && { fontWeight: '700' },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.isRead && (
              <View style={[styles.unreadDot, { backgroundColor: tintColor }]} />
            )}
          </View>
          <Text
            style={[styles.notificationBody, { color: textSecondary }]}
            numberOfLines={2}
          >
            {item.body}
          </Text>

          {isConnectionRequest && connectionId && !isProcessed && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: tintColor }]}
                onPress={() => handleAccept(connectionId, item.id)}
                disabled={isActioning}
                activeOpacity={0.7}
              >
                {acceptConnection.isPending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.actionButtonText}>수락</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleReject(connectionId, item.id)}
                disabled={isActioning}
                activeOpacity={0.7}
              >
                {rejectConnection.isPending ? (
                  <ActivityIndicator size="small" color="#6B7280" />
                ) : (
                  <Text style={[styles.actionButtonText, styles.rejectButtonText]}>거절</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {isConnectionRequest && isProcessed && (
            <Text style={[styles.processedText, { color: textSecondary }]}>처리 완료</Text>
          )}

          <Text style={[styles.timeText, { color: textSecondary }]}>
            {formatTimeAgo(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [textColor, textSecondary, tintColor, handlePress, handleAccept, handleReject, processedIds, acceptConnection.isPending, rejectConnection.isPending]);

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
        <IconSymbol name="chevron.left" size={24} color={textColor} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: textColor }]}>알림</Text>
      <View style={styles.headerRight}>
        {hasUnread && (
          <TouchableOpacity onPress={handleMarkAllAsRead} activeOpacity={0.6}>
            <Text style={[styles.markAllText, { color: tintColor }]}>모두 읽음</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (isLoading && notifications.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        {renderHeader()}
        <View style={styles.skeletonContainer}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height={72} borderRadius={BorderRadius.lg} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {renderHeader()}

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          contentStyle,
          notifications.length === 0 && styles.emptyContainer,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            icon="bell"
            title="알림이 없어요"
            message="새로운 소식이 있으면 여기에 표시됩니다"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  skeletonContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notificationTitle: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    flex: 1,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  notificationBody: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  timeText: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#F3F4F6',
  },
  rejectButtonText: {
    color: '#6B7280',
  },
  processedText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginTop: Spacing.xs,
  },
});
