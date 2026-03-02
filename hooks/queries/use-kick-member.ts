import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '@/services/api/group';
import { queryKeys } from '@/services/query-keys';
import type { KickMemberRequest } from '@/types/group';

export function useKickMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: KickMemberRequest) => groupApi.kickMember(data.groupId, data.userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.detail(variables.groupId) });
    },
  });
}
