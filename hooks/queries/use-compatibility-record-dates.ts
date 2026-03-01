import { useQuery } from '@tanstack/react-query';
import { compatibilityApi } from '@/services/api/compatibility';
import { queryKeys } from '@/services/query-keys';

export function useCompatibilityRecordDates(connectionId: number, year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.compatibility.recordDates(connectionId, year, month),
    queryFn: () => compatibilityApi.getRecordDates(connectionId, year, month),
    enabled: !!connectionId,
    staleTime: 30 * 60 * 1000,
  });
}
