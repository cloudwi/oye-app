import { apiClient } from './client';
import type { Inquiry, InquiryCreateRequest } from '@/types/inquiry';
import type { PageResponse, PaginatedResult } from '@/types/api';

export const inquiryApi = {
  async create(data: InquiryCreateRequest): Promise<Inquiry> {
    const response = await apiClient.post<Inquiry>('/api/inquiries', data);
    return response.data;
  },

  async getList(page: number = 0, size: number = 20): Promise<PaginatedResult<Inquiry>> {
    const response = await apiClient.get<PageResponse<Inquiry>>('/api/inquiries', {
      params: { page, size },
    });
    return {
      content: response.data.content,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      page: response.data.page,
    };
  },

  async getDetail(id: number): Promise<Inquiry> {
    const response = await apiClient.get<Inquiry>(`/api/inquiries/${id}`);
    return response.data;
  },
};
