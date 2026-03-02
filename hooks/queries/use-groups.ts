import { useQuery } from '@tanstack/react-query';
import { groupApi } from '@/services/api/group';
import { queryKeys } from '@/services/query-keys';

export function useGroups() {
  return useQuery({
    queryKey: queryKeys.group.list(),
    queryFn: () => groupApi.getList(),
    staleTime: 5 * 60 * 1000,
  });
}
