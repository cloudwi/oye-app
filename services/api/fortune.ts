import { apiClient } from './client';
import type { Fortune } from '@/types/fortune';
import type { PageResponse, PaginatedResult } from '@/types/api';
import type { ScoreTrendPoint } from '@/types/score-trend';

export const fortuneApi = {
  async getToday(): Promise<Fortune> {
    const response = await apiClient.get<Fortune>('/api/v1/fortune/today');
    return response.data;
  },

  async getHistory(page: number = 0, size: number = 20): Promise<PaginatedResult<Fortune>> {
    const response = await apiClient.get<PageResponse<Fortune>>('/api/v1/fortune/history', {
      params: { page, size },
    });
    return {
      content: response.data.content,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      page: response.data.page,
    };
  },

  async getScoreTrend(days: number): Promise<ScoreTrendPoint[]> {
    const response = await apiClient.get<ScoreTrendPoint[]>('/api/v1/fortune/score-trend', {
      params: { days },
    });
    return response.data;
  },

  async getRecordDates(year: number, month: number): Promise<string[]> {
    const response = await apiClient.get<string[]>('/api/v1/fortune/record-dates', {
      params: { year, month },
    });
    return response.data;
  },
};