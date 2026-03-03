import React, { useState } from 'react';
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

// TODO: 실제 배너 Ad Unit ID로 교체
const adUnitId = TestIds?.ADAPTIVE_BANNER ?? 'ca-app-pub-8460185175778038/BANNER_ID';

export function AdBanner() {
  const [failed, setFailed] = useState(false);

  if (!BannerAd || failed) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={() => setFailed(true)}
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
