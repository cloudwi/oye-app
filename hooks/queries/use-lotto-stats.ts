import { useQuery } from '@tanstack/react-query';
import { lottoApi } from '@/services/api/lotto';
import { queryKeys } from '@/services/query-keys';

export function useLottoStats() {
  return useQuery({
    queryKey: queryKeys.lotto.stats(),
    queryFn: () => lottoApi.getMyStats(),
  });
}
