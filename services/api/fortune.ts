import { apiClient } from './client';
import type { Fortune } from '@/types/fortune';
import type { PageResponse, PaginatedResult } from '@/types/api';

export const fortuneApi = {
  async getToday(): Promise<Fortune> {
    const response = await apiClient.get<Fortune>('/api/fortune/today');
    return response.data;
  },

  async getHistory(page: number = 0, size: number = 20): Promise<PaginatedResult<Fortune>> {
    const response = await apiClient.get<PageResponse<Fortune>>('/api/fortune/history', {
      params: { page, size },
    });
    return {
      content: response.data.content,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      page: response.data.page,
    };
  },
};