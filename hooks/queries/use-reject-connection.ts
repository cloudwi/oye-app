import { useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionApi } from '@/services/api/connection';
import { queryKeys } from '@/services/query-keys';

export function useRejectConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => connectionApi.rejectConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.connection.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notification.all() });
    },
  });
}
