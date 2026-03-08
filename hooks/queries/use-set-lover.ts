import { useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionApi } from '@/services/api/connection';
import { queryKeys } from '@/services/query-keys';

export function useSetLover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: number) => connectionApi.setLover(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.connection.list() });
    },
  });
}

export function useUnsetLover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: number) => connectionApi.unsetLover(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.connection.list() });
    },
  });
}
