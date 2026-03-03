// Web에서는 AdSense를 사용하므로 SDK 초기화 불필요
let _initialized = true;

export function isAdsInitialized() {
  return _initialized;
}

export function initializeMobileAds(): Promise<void> {
  return Promise.resolve();
}
