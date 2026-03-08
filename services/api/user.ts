import { apiClient } from './client';
import type { User, UserUpdateRequest } from '@/types/user';

export const userApi = {
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/api/v1/users/me');
    return response.data;
  },

  async updateMe(data: UserUpdateRequest): Promise<User> {
    const response = await apiClient.put<User>('/api/v1/users/me', data);
    return response.data;
  },

  async deleteMe(): Promise<void> {
    await apiClient.delete('/api/v1/users/me');
  },

  async registerPushToken(token: string | null): Promise<void> {
    await apiClient.put('/api/v1/users/push-token', { token });
  },

  async setNickname(nickname: string): Promise<User> {
    const response = await apiClient.patch<User>('/api/v1/users/me/nickname', { nickname });
    return response.data;
  },

  async checkNickname(nickname: string): Promise<{ available: boolean }> {
    const response = await apiClient.get<{ available: boolean }>('/api/v1/users/nickname-check', {
      params: { nickname },
    });
    return response.data;
  },
};