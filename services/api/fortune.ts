import { apiClient, ApiResponse } from './client';
import type { Fortune, FortuneHistory } from '@/types/fortune';

export interface GetHistoryParams {
  page?: number;
  limit?: number;
}

export const fortuneApi = {
  async getToday(): Promise<Fortune> {
    const response = await apiClient.get<ApiResponse<Fortune>>('/fortune/today');
    return response.data.data;
  },

  async getHistory(params: GetHistoryParams = {}): Promise<FortuneHistory> {
    const { page = 1, limit = 10 } = params;
    const response = await apiClient.get<ApiResponse<FortuneHistory>>('/fortune/history', {
      params: { page, limit },
    });
    return response.data.data;
  },

  async getById(id: string): Promise<Fortune> {
    const response = await apiClient.get<ApiResponse<Fortune>>(`/fortune/${id}`);
    return response.data.data;
  },
};
