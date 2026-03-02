import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '@/services/api/group';
import { queryKeys } from '@/services/query-keys';

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => groupApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.list() });
    },
  });
}
