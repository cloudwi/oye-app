import { useQuery } from '@tanstack/react-query';
import { fortuneApi } from '@/services/api/fortune';
import { queryKeys } from '@/services/query-keys';

export function useFortuneRecordDates(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.fortune.recordDates(year, month),
    queryFn: () => fortuneApi.getRecordDates(year, month),
  });
}
