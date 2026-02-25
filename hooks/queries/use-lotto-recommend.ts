import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lottoApi } from '@/services/api/lotto';
import { queryKeys } from '@/services/query-keys';

export function useLottoRecommend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => lottoApi.recommend(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lotto.history() });
    },
  });
}
