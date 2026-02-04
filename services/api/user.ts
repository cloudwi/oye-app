import { apiClient, ApiResponse } from './client';
import type { User } from '@/types/user';

export interface RegisterUserRequest {
  birthDate: string;
  deviceToken?: string;
}

export interface UpdateUserRequest {
  notificationEnabled?: boolean;
  notificationTime?: string;
}

export const userApi = {
  async register(data: RegisterUserRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/users/register', data);
    return response.data.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  },

  async update(data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>('/users/me', data);
    return response.data.data;
  },

  async updateDeviceToken(token: string): Promise<void> {
    await apiClient.post('/users/device-token', { token });
  },
};
