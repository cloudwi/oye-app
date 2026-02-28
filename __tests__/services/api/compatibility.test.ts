import { apiClient } from '@/services/api/client';
import { compatibilityApi } from '@/services/api/compatibility';

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

const mockCompatibility = {
  id: 1,
  score: 85,
  content: 'Great compatibility today!',
  date: '2025-06-15',
  createdAt: '2025-06-15T00:00:00Z',
};

describe('compatibilityApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getToday', () => {
    it('should call GET /api/connections/:id/compatibility', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockCompatibility });

      const result = await compatibilityApi.getToday(5);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/connections/5/compatibility');
      expect(result).toEqual(mockCompatibility);
    });
  });

  describe('getHistory', () => {
    it('should call GET /api/connections/:id/compatibility/history with default pagination', async () => {
      const pageResponse = {
        content: [mockCompatibility],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: pageResponse });

      const result = await compatibilityApi.getHistory(5);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/connections/5/compatibility/history',
        { params: { page: 0, size: 20 } }
      );
      expect(result).toEqual({
        content: [mockCompatibility],
        totalElements: 1,
        totalPages: 1,
        page: 0,
      });
    });

    it('should call with custom pagination', async () => {
      const pageResponse = {
        content: [],
        page: 1,
        size: 10,
        totalElements: 15,
        totalPages: 2,
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: pageResponse });

      const result = await compatibilityApi.getHistory(3, 1, 10);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/connections/3/compatibility/history',
        { params: { page: 1, size: 10 } }
      );
      expect(result).toEqual({
        content: [],
        totalElements: 15,
        totalPages: 2,
        page: 1,
      });
    });
  });
});
