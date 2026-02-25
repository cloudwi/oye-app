import { useInfiniteQuery } from '@tanstack/react-query';
import { lottoApi } from '@/services/api/lotto';
import { queryKeys } from '@/services/query-keys';

export function useLottoWinners() {
  return useInfiniteQuery({
    queryKey: queryKeys.lotto.winners(),
    queryFn: ({ pageParam = 0 }) => lottoApi.getWinners(pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined,
  });
}
