import { apiClient } from './client';
import type { PageResponse } from '@/types/api';
import type { LottoRecommendation, LottoWinner, LottoRound } from '@/types/lotto';

export const lottoApi = {
  async getHistory(page: number = 0, size: number = 20): Promise<PageResponse<LottoRecommendation>> {
    const response = await apiClient.get<PageResponse<LottoRecommendation>>('/api/lotto/recommendations', {
      params: { page, size },
    });
    return response.data;
  },

  async getWinners(page: number = 0, size: number = 20): Promise<PageResponse<LottoWinner>> {
    const response = await apiClient.get<PageResponse<LottoWinner>>('/api/lotto/winners', {
      params: { page, size },
    });
    return response.data;
  },

  async getRound(round: number): Promise<LottoRound> {
    const response = await apiClient.get<LottoRound>(`/api/lotto/rounds/${round}`);
    return response.data;
  },
};
