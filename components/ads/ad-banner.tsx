import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';

let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  TestIds = ads.TestIds;
} catch {
  // Native module not available
}

const BANNER_AD_UNIT_ID = 'ca-app-pub-8460185175778038/9147968218';

// TODO: 앱스토어 게시 후 아래 줄을 원래대로 변경
// const adUnitId = __DEV__ ? (TestIds?.ADAPTIVE_BANNER ?? BANNER_AD_UNIT_ID) : BANNER_AD_UNIT_ID;
const adUnitId = TestIds?.ADAPTIVE_BANNER ?? BANNER_AD_UNIT_ID; // TestFlight 테스트용 (항상 테스트 광고)

export function AdBanner() {
  const [failed, setFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // 실패 시 10초 후 재시도 (최대 3회)
  useEffect(() => {
    if (failed && retryCount < 3) {
      const timer = setTimeout(() => {
        setFailed(false);
        setRetryCount((c) => c + 1);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [failed, retryCount]);

  if (!BannerAd || failed) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdFailedToLoad={(error: any) => {
          console.warn('[AdBanner] Failed to load:', error);
          setFailed(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
});
