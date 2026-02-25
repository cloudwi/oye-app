import { useInfiniteQuery } from '@tanstack/react-query';
import { lottoApi } from '@/services/api/lotto';
import { queryKeys } from '@/services/query-keys';

export function useLottoHistory() {
  return useInfiniteQuery({
    queryKey: queryKeys.lotto.history(),
    queryFn: ({ pageParam = 0 }) => lottoApi.getHistory(pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined,
  });
}
