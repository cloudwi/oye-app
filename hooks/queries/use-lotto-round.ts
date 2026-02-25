import { useQuery } from '@tanstack/react-query';
import { lottoApi } from '@/services/api/lotto';
import { queryKeys } from '@/services/query-keys';

export function useLottoRound(round: number | undefined) {
  return useQuery({
    queryKey: queryKeys.lotto.round(round!),
    queryFn: () => lottoApi.getRound(round!),
    enabled: !!round,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: false,
  });
}
