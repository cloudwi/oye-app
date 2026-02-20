import { useInfiniteQuery } from '@tanstack/react-query';
import { inquiryApi } from '@/services/api/inquiry';
import { queryKeys } from '@/services/query-keys';

const PAGE_SIZE = 20;

export function useInquiryList() {
  return useInfiniteQuery({
    queryKey: queryKeys.inquiry.list(),
    queryFn: ({ pageParam }) => inquiryApi.getList(pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined,
  });
}
