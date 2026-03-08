import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { notificationApi } from '@/services/api/notification';
import { queryKeys } from '@/services/query-keys';

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: queryKeys.notification.list(),
    queryFn: ({ pageParam = 0 }) => notificationApi.getList(pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
    staleTime: 60 * 1000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notification.unreadCount(),
    queryFn: () => notificationApi.getUnreadCount(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notification.all() });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notification.all() });
    },
  });
}
