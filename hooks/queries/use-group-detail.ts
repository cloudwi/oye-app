import { useQuery } from '@tanstack/react-query';
import { groupApi } from '@/services/api/group';
import { queryKeys } from '@/services/query-keys';

export function useGroupDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.group.detail(id),
    queryFn: () => groupApi.getDetail(id),
    staleTime: 5 * 60 * 1000,
  });
}
