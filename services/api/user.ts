import { apiClient } from './client';
import type { User, UserUpdateRequest } from '@/types/user';

export const userApi = {
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/api/users/me');
    return response.data;
  },

  async updateMe(data: UserUpdateRequest): Promise<User> {
    const response = await apiClient.put<User>('/api/users/me', data);
    return response.data;
  },

  async deleteMe(): Promise<void> {
    await apiClient.delete('/api/users/me');
  },

  async registerPushToken(token: string | null): Promise<void> {
    await apiClient.put('/api/users/push-token', { token });
  },
};