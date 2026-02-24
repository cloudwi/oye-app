import { useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionApi } from '@/services/api/connection';
import { queryKeys } from '@/services/query-keys';

export function useDeleteConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => connectionApi.deleteConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.connection.list() });
    },
  });
}
