import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '@/services/api/group';
import { queryKeys } from '@/services/query-keys';
import type { CreateGroupRequest } from '@/types/group';

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupRequest) => groupApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.list() });
    },
  });
}
