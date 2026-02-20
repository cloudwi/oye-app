import { useQuery } from '@tanstack/react-query';
import { fortuneApi } from '@/services/api/fortune';
import { queryKeys } from '@/services/query-keys';

function getStaleTimeUntilEndOfDay() {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return endOfDay.getTime() - now.getTime();
}

export function useTodayFortune() {
  return useQuery({
    queryKey: queryKeys.fortune.today(),
    queryFn: () => fortuneApi.getToday(),
    staleTime: getStaleTimeUntilEndOfDay(),
  });
}
