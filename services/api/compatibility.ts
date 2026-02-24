import { apiClient } from './client';
import type { CompatibilityResult } from '@/types/compatibility';
import type { ApiResponse, PageResponse, PaginatedResult } from '@/types/api';

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
    const response = await apiClient.get<ApiResponse<PageResponse<CompatibilityResult>>>(
      `/api/connections/${connectionId}/compatibility/history`,
      { params: { page, size } }
    );
    const pageData = response.data.data!;
    return {
      content: pageData.content,
      totalElements: pageData.totalElements,
      totalPages: pageData.totalPages,
      page: pageData.page,
    };
  },
};
