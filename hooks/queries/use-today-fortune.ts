import { useQuery } from '@tanstack/react-query';
import { fortuneApi } from '@/services/api/fortune';
import { queryKeys } from '@/services/query-keys';
import { getStaleTimeUntilEndOfDay } from '@/utils/date';

export function useTodayFortune() {
  return useQuery({
    queryKey: queryKeys.fortune.today(),
    queryFn: () => fortuneApi.getToday(),
    staleTime: getStaleTimeUntilEndOfDay(),
  });
}
