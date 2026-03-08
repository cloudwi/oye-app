import { useMutation } from '@tanstack/react-query';
import { userApi } from '@/services/api/user';
import { useUserStore } from '@/stores/user-store';

export function useSetNickname() {
  const updateUser = useUserStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (nickname: string) => userApi.setNickname(nickname),
    onSuccess: (user) => {
      updateUser(user);
    },
  });
}
