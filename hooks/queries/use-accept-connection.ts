import { useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionApi } from '@/services/api/connection';
import { queryKeys } from '@/services/query-keys';

export function useAcceptConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => connectionApi.acceptConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.connection.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notification.all() });
    },
  });
}
