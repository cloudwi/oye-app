import { apiClient } from './client';
import type { Fortune, ApiResponse, PageResponse } from '@/types/fortune';

interface HistoryResult {
  content: Fortune[];
  totalElements: number;
  totalPages: number;
  page: number;
}

export const fortuneApi = {
  async getToday(): Promise<Fortune> {
    const response = await apiClient.get<Fortune>('/api/fortune/today');
    return response.data;
  },

  async getHistory(page: number = 0, size: number = 20): Promise<HistoryResult> {
    const response = await apiClient.get<ApiResponse<PageResponse<Fortune>>>('/api/fortune/history', {
      params: { page, size },
    });
    const pageData = response.data.data!;
    return {
      content: pageData.content,
      totalElements: pageData.totalElements,
      totalPages: pageData.totalPages,
      page: pageData.page,
    };
  },
};