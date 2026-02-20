import { useMutation } from '@tanstack/react-query';
import { userApi } from '@/services/api/user';
import { useUserStore } from '@/stores/user-store';
import type { User, UserUpdateRequest } from '@/types/user';

export function useUpdateUser() {
  return useMutation({
    mutationFn: (data: UserUpdateRequest) => userApi.updateMe(data),
    onMutate: (data) => {
      const previousUser = useUserStore.getState().user;
      if (previousUser) {
        const updates: Partial<User> = { name: data.name };
        if (data.birthDate !== undefined) updates.birthDate = data.birthDate;
        if (data.birthTime !== undefined) updates.birthTime = data.birthTime;
        if (data.gender !== undefined) updates.gender = data.gender;
        if (data.calendarType !== undefined) updates.calendarType = data.calendarType;
        if (data.occupation !== undefined) updates.occupation = data.occupation;
        if (data.mbti !== undefined) updates.mbti = data.mbti;
        if (data.bloodType !== undefined) updates.bloodType = data.bloodType;
        if (data.interests !== undefined) updates.interests = data.interests;
        useUserStore.getState().updateUser(updates);
      }
      return { previousUser };
    },
    onError: (_err, _data, context) => {
      if (context?.previousUser) {
        useUserStore.getState().setUser(context.previousUser);
      }
    },
  });
}
