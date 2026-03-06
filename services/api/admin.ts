import { apiClient } from './client';

export const adminApi = {
  async triggerDailyGeneration(): Promise<void> {
    await apiClient.post('/api/v1/admin/generate-daily');
  },
};
