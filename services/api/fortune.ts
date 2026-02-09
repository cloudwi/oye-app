import { apiClient } from './client';
import type { Fortune } from '@/types/fortune';

export const fortuneApi = {
  async getToday(): Promise<Fortune> {
    const response = await apiClient.get<Fortune>('/api/fortune/today');
    return response.data;
  },

  async getHistory(): Promise<Fortune[]> {
    const response = await apiClient.get<Fortune[]>('/api/fortune/history');
    return response.data;
  },
};