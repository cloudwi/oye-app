import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/services/api/user';
import { queryKeys } from '@/services/query-keys';
import { useUserStore } from '@/stores/user-store';

export function useSetNickname() {
  const queryClient = useQueryClient();
  const updateUser = useUserStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (nickname: string) => userApi.setNickname(nickname),
    onSuccess: (user) => {
      updateUser(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.connection.myCode() });
    },
  });
}
