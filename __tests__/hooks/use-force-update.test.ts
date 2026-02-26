import { Platform } from 'react-native';
import { appApi } from '@/services/api/app';
import { getAppVersion, getAppPlatform } from '@/utils/version';

jest.mock('@/services/api/app', () => ({
  appApi: {
    checkUpdate: jest.fn(),
  },
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: '1.2.3',
    },
  },
}));

describe('version utils', () => {
  describe('getAppVersion', () => {
    it('should return version from expo config', () => {
      expect(getAppVersion()).toBe('1.2.3');
    });
  });

  describe('getAppPlatform', () => {
    const originalOS = Platform.OS;

    afterEach(() => {
      Object.defineProperty(Platform, 'OS', { value: originalOS });
    });

    it('should return ios for iOS platform', () => {
      Object.defineProperty(Platform, 'OS', { value: 'ios' });
      expect(getAppPlatform()).toBe('ios');
    });

    it('should return android for Android platform', () => {
      Object.defineProperty(Platform, 'OS', { value: 'android' });
      expect(getAppPlatform()).toBe('android');
    });

    it('should return null for web platform', () => {
      Object.defineProperty(Platform, 'OS', { value: 'web' });
      expect(getAppPlatform()).toBeNull();
    });
  });
});

describe('appApi.checkUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be callable and return force update response', async () => {
    (appApi.checkUpdate as jest.Mock).mockResolvedValue({
      forceUpdate: true,
      minVersion: '2.0.0',
      storeUrl: 'https://apps.apple.com/app/id000000000',
    });

    const result = await appApi.checkUpdate('ios', '1.0.0');

    expect(appApi.checkUpdate).toHaveBeenCalledWith('ios', '1.0.0');
    expect(result.forceUpdate).toBe(true);
    expect(result.minVersion).toBe('2.0.0');
    expect(result.storeUrl).toBe('https://apps.apple.com/app/id000000000');
  });

  it('should handle API failure gracefully', async () => {
    (appApi.checkUpdate as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(appApi.checkUpdate('ios', '1.0.0')).rejects.toThrow('Network error');
  });
});
