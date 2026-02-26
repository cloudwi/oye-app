import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { appApi } from '@/services/api/app';
import { getAppVersion, getAppPlatform } from '@/utils/version';

interface ForceUpdateState {
  needsUpdate: boolean;
  storeUrl: string | null;
  minVersion: string | null;
}

export function useForceUpdate(): ForceUpdateState {
  const [state, setState] = useState<ForceUpdateState>({
    needsUpdate: false,
    storeUrl: null,
    minVersion: null,
  });

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const platform = getAppPlatform();
    if (!platform) return;

    const version = getAppVersion();

    appApi
      .checkUpdate(platform, version)
      .then((result) => {
        if (result.forceUpdate) {
          setState({
            needsUpdate: true,
            storeUrl: result.storeUrl,
            minVersion: result.minVersion,
          });
        }
      })
      .catch(() => {
        // Silent fail - 앱 사용 차단 금지
      });
  }, []);

  return state;
}
