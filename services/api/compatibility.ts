import { apiClient } from './client';
import type { CompatibilityResult } from '@/types/compatibility';
import type { PageResponse, PaginatedResult } from '@/types/api';
import type { ScoreTrendPoint } from '@/types/score-trend';

export const compatibilityApi = {
  async getToday(connectionId: number): Promise<CompatibilityResult> {
    const response = await apiClient.get<CompatibilityResult>(
      `/api/v1/connections/${connectionId}/compatibility`
    );
    return response.data;
  },

  async getHistory(
    connectionId: number,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResult<CompatibilityResult>> {
    const response = await apiClient.get<PageResponse<CompatibilityResult>>(
      `/api/v1/connections/${connectionId}/compatibility/history`,
      { params: { page, size } }
    );
    return {
      content: response.data.content,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      page: response.data.page,
    };
  },

  async getScoreTrend(connectionId: number, days: number): Promise<ScoreTrendPoint[]> {
    const response = await apiClient.get<ScoreTrendPoint[]>(
      `/api/v1/connections/${connectionId}/compatibility/score-trend`,
      { params: { days } }
    );
    return response.data;
  },

  async getRecordDates(connectionId: number, year: number, month: number): Promise<string[]> {
    const response = await apiClient.get<{ yearMonth: string; dates: string[] }>(
      `/api/v1/connections/${connectionId}/compatibility/record-dates`,
      { params: { year, month } }
    );
    return response.data.dates;
  },
};
