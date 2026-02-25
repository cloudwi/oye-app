import { useQuery } from '@tanstack/react-query';
import { compatibilityApi } from '@/services/api/compatibility';
import { queryKeys } from '@/services/query-keys';
import { getStaleTimeUntilEndOfDay } from '@/utils/date';

export function useCompatibility(connectionId: number) {
  return useQuery({
    queryKey: queryKeys.compatibility.today(connectionId),
    queryFn: () => compatibilityApi.getToday(connectionId),
    staleTime: getStaleTimeUntilEndOfDay(),
  });
}
