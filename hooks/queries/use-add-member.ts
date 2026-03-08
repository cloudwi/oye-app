import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '@/services/api/group';
import { queryKeys } from '@/services/query-keys';

export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { groupId: number; userId: number }) =>
      groupApi.addMember(data.groupId, data.userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.detail(variables.groupId) });
    },
  });
}
