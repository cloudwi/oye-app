import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '@/services/api/group';
import { queryKeys } from '@/services/query-keys';

export function useLeaveGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => groupApi.leave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.list() });
    },
  });
}
