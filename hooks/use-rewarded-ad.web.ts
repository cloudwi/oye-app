import { useState, useCallback } from 'react';

/**
 * Web stub — AdMob is not available on web.
 * Always returns unlocked state.
 */
export function useRewardedAd() {
  const [isLoaded] = useState(false);
  const [isEarned] = useState(false);

  const show = useCallback(() => {}, []);
  const reset = useCallback(() => {}, []);

  return { isLoaded, isEarned, show, reset };
}
