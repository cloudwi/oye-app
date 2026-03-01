import { useQuery } from '@tanstack/react-query';
import { compatibilityApi } from '@/services/api/compatibility';
import { queryKeys } from '@/services/query-keys';

export function useCompatibilityScoreTrend(connectionId: number, days: number = 30) {
  return useQuery({
    queryKey: queryKeys.compatibility.scoreTrend(connectionId, days),
    queryFn: () => compatibilityApi.getScoreTrend(connectionId, days),
    enabled: !!connectionId,
    staleTime: 30 * 60 * 1000,
  });
}
