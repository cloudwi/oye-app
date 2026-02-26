import { apiClient } from '@/services/api/client';
import { fortuneApi } from '@/services/api/fortune';

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

const mockFortune = {
  id: 1,
  content: 'Today is a great day!',
  date: '2025-06-15',
  createdAt: '2025-06-15T00:00:00Z',
};

describe('fortuneApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getToday', () => {
    it('should call GET /api/fortune/today and return fortune', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockFortune });

      const result = await fortuneApi.getToday();

      expect(apiClient.get).toHaveBeenCalledWith('/api/fortune/today');
      expect(result).toEqual(mockFortune);
    });
  });

  describe('getHistory', () => {
    it('should call GET /api/fortune/history with default pagination', async () => {
      const pageResponse = {
        content: [mockFortune],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: pageResponse });

      const result = await fortuneApi.getHistory();

      expect(apiClient.get).toHaveBeenCalledWith('/api/fortune/history', {
        params: { page: 0, size: 20 },
      });
      expect(result).toEqual({
        content: [mockFortune],
        totalElements: 1,
        totalPages: 1,
        page: 0,
      });
    });

    it('should call GET /api/fortune/history with custom pagination', async () => {
      const pageResponse = {
        content: [],
        page: 2,
        size: 10,
        totalElements: 30,
        totalPages: 3,
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: pageResponse });

      const result = await fortuneApi.getHistory(2, 10);

      expect(apiClient.get).toHaveBeenCalledWith('/api/fortune/history', {
        params: { page: 2, size: 10 },
      });
      expect(result).toEqual({
        content: [],
        totalElements: 30,
        totalPages: 3,
        page: 2,
      });
    });
  });
});
