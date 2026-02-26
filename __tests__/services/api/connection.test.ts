import { apiClient } from '@/services/api/client';
import { connectionApi } from '@/services/api/connection';
import type { ConnectRequest } from '@/types/connection';

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

const mockConnection = {
  id: 1,
  partnerName: 'Partner',
  relationType: 'LOVER' as const,
  latestScore: 85,
  createdAt: '2025-01-01T00:00:00Z',
};

describe('connectionApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyCode', () => {
    it('should call GET /api/connections/my-code and return code', async () => {
      const mockResponse = { code: 'ABC123' };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await connectionApi.getMyCode();

      expect(apiClient.get).toHaveBeenCalledWith('/api/connections/my-code');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('connect', () => {
    it('should call POST /api/connections with connect request', async () => {
      const request: ConnectRequest = {
        code: 'XYZ789',
        relationType: 'FRIEND',
      };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockConnection });

      const result = await connectionApi.connect(request);

      expect(apiClient.post).toHaveBeenCalledWith('/api/connections', request);
      expect(result).toEqual(mockConnection);
    });
  });

  describe('getList', () => {
    it('should call GET /api/connections and return list', async () => {
      const connections = [mockConnection];
      (apiClient.get as jest.Mock).mockResolvedValue({ data: connections });

      const result = await connectionApi.getList();

      expect(apiClient.get).toHaveBeenCalledWith('/api/connections');
      expect(result).toEqual(connections);
    });

    it('should return empty array when no connections', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await connectionApi.getList();

      expect(result).toEqual([]);
    });
  });

  describe('deleteConnection', () => {
    it('should call DELETE /api/connections/:id', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({});

      await connectionApi.deleteConnection(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/api/connections/1');
    });
  });
});
