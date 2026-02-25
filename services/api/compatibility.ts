import { apiClient } from './client';
import type { CompatibilityResult } from '@/types/compatibility';
import type { PageResponse, PaginatedResult } from '@/types/api';

export const compatibilityApi = {
  async getToday(connectionId: number): Promise<CompatibilityResult> {
    const response = await apiClient.get<CompatibilityResult>(
      `/api/connections/${connectionId}/compatibility`
    );
    return response.data;
  },

  async getHistory(
    connectionId: number,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResult<CompatibilityResult>> {
    const response = await apiClient.get<PageResponse<CompatibilityResult>>(
      `/api/connections/${connectionId}/compatibility/history`,
      { params: { page, size } }
    );
    return {
      content: response.data.content,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      page: response.data.page,
    };
  },
};
