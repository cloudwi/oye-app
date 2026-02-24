import { useInfiniteQuery } from '@tanstack/react-query';
import { compatibilityApi } from '@/services/api/compatibility';
import { queryKeys } from '@/services/query-keys';

const PAGE_SIZE = 20;

export function useCompatibilityHistory(connectionId: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.compatibility.history(connectionId),
    queryFn: ({ pageParam }) => compatibilityApi.getHistory(connectionId, pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined,
  });
}
