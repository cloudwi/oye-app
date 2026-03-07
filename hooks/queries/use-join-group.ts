import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '@/services/api/group';
import { queryKeys } from '@/services/query-keys';
import type { JoinGroupRequest } from '@/types/group';

export function useJoinGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JoinGroupRequest) => groupApi.join(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.all() });
    },
  });
}
