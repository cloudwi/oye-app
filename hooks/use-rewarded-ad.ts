import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { initializeMobileAds } from '@/services/ads';

let RewardedAd: typeof import('react-native-google-mobile-ads').RewardedAd | null = null;
let RewardedAdEventType: typeof import('react-native-google-mobile-ads').RewardedAdEventType | null = null;
let AdEventType: typeof import('react-native-google-mobile-ads').AdEventType | null = null;
let TestIds: typeof import('react-native-google-mobile-ads').TestIds | null = null;

try {
  const ads = require('react-native-google-mobile-ads');
  RewardedAd = ads.RewardedAd;
  RewardedAdEventType = ads.RewardedAdEventType;
  AdEventType = ads.AdEventType;
  TestIds = ads.TestIds;
} catch {
  // Native module not available (e.g. Expo Go, simulator without native build)
}

const IOS_AD_UNIT = 'ca-app-pub-8460185175778038/5994905859';

// TODO: 앱스토어 게시 후 아래 줄을 원래대로 변경
// const adUnitId = __DEV__ ? TestIds.REWARDED : IOS_AD_UNIT;
const adUnitId = TestIds?.REWARDED ?? IOS_AD_UNIT; // TestFlight 테스트용 (항상 테스트 광고)

/**
 * Hook for loading and showing a rewarded ad.
 * Returns { isLoaded, isEarned, show, reset }
 *
 * Usage:
 *   const { isLoaded, isEarned, show, reset } = useRewardedAd();
 *   // show() displays the ad; isEarned becomes true when user earns the reward
 */
export function useRewardedAd() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEarned, setIsEarned] = useState(false);
  const adRef = useRef<any>(null);

  const loadAd = useCallback(() => {
    if (Platform.OS === 'web' || !RewardedAd || !RewardedAdEventType || !AdEventType) return;

    // SDK 초기화 완료 후 광고 로드
    initializeMobileAds().then(() => {
      if (!RewardedAd || !RewardedAdEventType || !AdEventType) return;

      const ad = RewardedAd.createForAdRequest(adUnitId);

      const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        setIsLoaded(true);
      });

      const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        setIsEarned(true);
      });

      const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        // Reload for next use
        setIsLoaded(false);
        ad.load();
      });

      const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
        setIsLoaded(false);
        // Retry after delay
        setTimeout(() => ad.load(), 5000);
      });

      adRef.current = ad;
      adRef.current._cleanup = () => {
        unsubLoaded();
        unsubEarned();
        unsubClosed();
        unsubError();
      };
      ad.load();
    });
  }, []);

  useEffect(() => {
    loadAd();
    return () => {
      adRef.current?._cleanup?.();
    };
  }, [loadAd]);

  const show = useCallback(() => {
    if (adRef.current?.loaded) {
      adRef.current.show();
    }
  }, []);

  const reset = useCallback(() => {
    setIsEarned(false);
  }, []);

  return { isLoaded, isEarned, show, reset };
}
