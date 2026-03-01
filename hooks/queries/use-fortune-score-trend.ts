import { useQuery } from '@tanstack/react-query';
import { fortuneApi } from '@/services/api/fortune';
import { queryKeys } from '@/services/query-keys';

export function useFortuneScoreTrend(days: number = 30) {
  return useQuery({
    queryKey: queryKeys.fortune.scoreTrend(days),
    queryFn: () => fortuneApi.getScoreTrend(days),
    staleTime: 30 * 60 * 1000,
  });
}
