import { useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionApi } from '@/services/api/connection';
import { queryKeys } from '@/services/query-keys';
import type { ConnectRequest } from '@/types/connection';

export function useConnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConnectRequest) => connectionApi.connect(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.connection.list() });
    },
  });
}
