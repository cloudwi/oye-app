import { apiClient } from './client';
import type { Inquiry, InquiryCreateRequest } from '@/types/inquiry';
import type { ApiResponse, PageResponse } from '@/types/fortune';

interface InquiryListResult {
  content: Inquiry[];
  totalElements: number;
  totalPages: number;
  page: number;
}

export const inquiryApi = {
  async create(data: InquiryCreateRequest): Promise<Inquiry> {
    const response = await apiClient.post<Inquiry>('/api/inquiries', data);
    return response.data;
  },

  async getList(page: number = 0, size: number = 20): Promise<InquiryListResult> {
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
