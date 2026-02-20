import { useQuery } from '@tanstack/react-query';
import { inquiryApi } from '@/services/api/inquiry';
import { queryKeys } from '@/services/query-keys';

export function useInquiryDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.inquiry.detail(id),
    queryFn: () => inquiryApi.getDetail(id),
    enabled: !!id,
  });
}
