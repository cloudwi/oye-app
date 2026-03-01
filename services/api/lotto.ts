import { apiClient } from './client';
import type { PageResponse } from '@/types/api';
import type { LottoRecommendation, LottoWinner, LottoRound, LottoMyStats } from '@/types/lotto';

export const lottoApi = {
  async getHistory(page: number = 0, size: number = 20, winOnly?: boolean): Promise<PageResponse<LottoRecommendation>> {
    const response = await apiClient.get<PageResponse<LottoRecommendation>>('/api/v1/lotto/recommendations', {
      params: { page, size, ...(winOnly ? { winOnly: true } : {}) },
    });
    return response.data;
  },

  async getMyStats(): Promise<LottoMyStats> {
    const response = await apiClient.get<LottoMyStats>('/api/v1/lotto/my-stats');
    return response.data;
  },

  async getWinners(page: number = 0, size: number = 20): Promise<PageResponse<LottoWinner>> {
    const response = await apiClient.get<PageResponse<LottoWinner>>('/api/v1/lotto/winners', {
      params: { page, size },
    });
    return response.data;
  },

  async getRound(round: number): Promise<LottoRound> {
    const response = await apiClient.get<LottoRound>(`/api/v1/lotto/rounds/${round}`);
    return response.data;
  },
};
