import { useQuery } from '@tanstack/react-query';
import { compatibilityApi } from '@/services/api/compatibility';
import { queryKeys } from '@/services/query-keys';

function getStaleTimeUntilEndOfDay() {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return endOfDay.getTime() - now.getTime();
}

export function useCompatibility(connectionId: number) {
  return useQuery({
    queryKey: queryKeys.compatibility.today(connectionId),
    queryFn: () => compatibilityApi.getToday(connectionId),
    staleTime: getStaleTimeUntilEndOfDay(),
  });
}
