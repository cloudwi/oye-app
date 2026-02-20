import { useInfiniteQuery } from '@tanstack/react-query';
import { fortuneApi } from '@/services/api/fortune';
import { queryKeys } from '@/services/query-keys';

const PAGE_SIZE = 20;

export function useFortuneHistory() {
  return useInfiniteQuery({
    queryKey: queryKeys.fortune.history(),
    queryFn: ({ pageParam }) => fortuneApi.getHistory(pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined,
  });
}
