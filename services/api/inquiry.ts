import { apiClient } from './client';
import type { Inquiry, InquiryCreateRequest } from '@/types/inquiry';
import type { ApiResponse, PageResponse, PaginatedResult } from '@/types/api';

export const inquiryApi = {
  async create(data: InquiryCreateRequest): Promise<Inquiry> {
    const response = await apiClient.post<Inquiry>('/api/inquiries', data);
    return response.data;
  },

  async getList(page: number = 0, size: number = 20): Promise<PaginatedResult<Inquiry>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Inquiry>>>('/api/inquiries', {
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

  async getDetail(id: number): Promise<Inquiry> {
    const response = await apiClient.get<Inquiry>(`/api/inquiries/${id}`);
    return response.data;
  },
};
