import { Platform } from 'react-native';

let _initialized = false;
let _initPromise: Promise<void> | null = null;

export function isAdsInitialized() {
  return _initialized;
}

export function initializeMobileAds(): Promise<void> {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    try {
      const { default: mobileAds } = require('react-native-google-mobile-ads');

      try {
        const { requestTrackingPermissionsAsync } = require('expo-tracking-transparency');
        const status = await requestTrackingPermissionsAsync();
        if (!status.granted) {
          mobileAds().setRequestConfiguration({
            testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
          });
        }
      } catch {
        // ATT not available
      }

      await mobileAds().initialize();
      _initialized = true;
    } catch {
      // Native module not available
      _initialized = false;
    }
  })();

  return _initPromise;
}
