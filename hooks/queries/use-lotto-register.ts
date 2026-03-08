import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lottoApi } from '@/services/api/lotto';
import { queryKeys } from '@/services/query-keys';
import type { LottoRegisterRequest } from '@/types/lotto';

export function useLottoRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LottoRegisterRequest) => lottoApi.registerNumbers(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lotto.all() });
    },
  });
}
