import { useQuery } from '@tanstack/react-query';
import { groupApi } from '@/services/api/group';
import { queryKeys } from '@/services/query-keys';

export function useGroupCompatibility(id: number) {
  return useQuery({
    queryKey: queryKeys.group.todayCompatibility(id),
    queryFn: () => groupApi.getTodayCompatibility(id),
    staleTime: 5 * 60 * 1000,
  });
}
