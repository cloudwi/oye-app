import { apiClient } from '@/services/api/client';
import { lottoApi } from '@/services/api/lotto';

jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), handlers: [] },
      response: { use: jest.fn(), handlers: [] },
    },
    defaults: { headers: { common: {} } },
  },
}));

const mockRecommendation = {
  id: 1,
  round: 1100,
  setNumber: 1,
  numbers: [3, 12, 18, 27, 35, 42],
  rank: null,
  matchCount: 0,
  bonusMatch: false,
  createdAt: '2025-06-15T00:00:00Z',
};

const mockWinner = {
  round: 1100,
  rank: '1등',
  numbers: [3, 12, 18, 27, 35, 42],
  matchCount: 6,
  bonusMatch: false,
  drawDate: '2025-06-14',
};

const mockRound = {
  round: 1100,
  numbers: [3, 12, 18, 27, 35, 42],
  bonusNumber: 7,
  drawDate: '2025-06-14',
};

describe('lottoApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHistory', () => {
    it('should call GET /api/lotto/recommendations with default pagination', async () => {
      const pageResponse = {
        content: [mockRecommendation],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: pageResponse });

      const result = await lottoApi.getHistory();

      expect(apiClient.get).toHaveBeenCalledWith('/api/lotto/recommendations', {
        params: { page: 0, size: 20 },
      });
      expect(result).toEqual(pageResponse);
    });

    it('should call with custom pagination', async () => {
      const pageResponse = {
        content: [],
        page: 3,
        size: 5,
        totalElements: 20,
        totalPages: 4,
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: pageResponse });

      const result = await lottoApi.getHistory(3, 5);

      expect(apiClient.get).toHaveBeenCalledWith('/api/lotto/recommendations', {
        params: { page: 3, size: 5 },
      });
    });
  });

  describe('getWinners', () => {
    it('should call GET /api/lotto/winners with default pagination', async () => {
      const pageResponse = {
        content: [mockWinner],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: pageResponse });

      const result = await lottoApi.getWinners();

      expect(apiClient.get).toHaveBeenCalledWith('/api/lotto/winners', {
        params: { page: 0, size: 20 },
      });
      expect(result).toEqual(pageResponse);
    });
  });

  describe('getRound', () => {
    it('should call GET /api/lotto/rounds/:round and return round data', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRound });

      const result = await lottoApi.getRound(1100);

      expect(apiClient.get).toHaveBeenCalledWith('/api/lotto/rounds/1100');
      expect(result).toEqual(mockRound);
    });
  });
});
