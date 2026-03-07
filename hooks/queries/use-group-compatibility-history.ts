import { useQuery } from '@tanstack/react-query';
import { groupApi } from '@/services/api/group';
import { queryKeys } from '@/services/query-keys';

export function useGroupCompatibilityHistory(id: number) {
  return useQuery({
    queryKey: queryKeys.group.compatibilityHistory(id),
    queryFn: () => groupApi.getCompatibilityHistory(id),
    staleTime: 5 * 60 * 1000,
  });
}
