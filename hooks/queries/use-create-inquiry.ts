import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inquiryApi } from '@/services/api/inquiry';
import { queryKeys } from '@/services/query-keys';
import type { InquiryCreateRequest } from '@/types/inquiry';

export function useCreateInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InquiryCreateRequest) => inquiryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inquiry.list() });
    },
  });
}
