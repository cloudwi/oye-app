import { apiClient } from '@/services/api/client';
import { appApi } from '@/services/api/app';

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

describe('appApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkUpdate', () => {
    it('should call GET /api/app/check-update with platform and version params', async () => {
      const mockResponse = {
        forceUpdate: true,
        minVersion: '2.0.0',
        storeUrl: 'https://apps.apple.com/app/id000000000',
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await appApi.checkUpdate('ios', '1.0.0');

      expect(apiClient.get).toHaveBeenCalledWith('/api/app/check-update', {
        params: { platform: 'ios', version: '1.0.0' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return forceUpdate false when version is up to date', async () => {
      const mockResponse = {
        forceUpdate: false,
        minVersion: '1.0.0',
        storeUrl: 'https://apps.apple.com/app/id000000000',
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await appApi.checkUpdate('ios', '2.0.0');

      expect(result.forceUpdate).toBe(false);
    });

    it('should work with android platform', async () => {
      const mockResponse = {
        forceUpdate: true,
        minVersion: '1.5.0',
        storeUrl: 'https://play.google.com/store/apps/details?id=com.oyeapp.fortune',
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await appApi.checkUpdate('android', '1.0.0');

      expect(apiClient.get).toHaveBeenCalledWith('/api/app/check-update', {
        params: { platform: 'android', version: '1.0.0' },
      });
      expect(result.forceUpdate).toBe(true);
      expect(result.storeUrl).toContain('play.google.com');
    });
  });
});
