import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useSettingsStore } from '@/stores/settings-store';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const systemColorScheme = useRNColorScheme();
  const { darkMode } = useSettingsStore();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return 'light';
  }

  if (darkMode === 'system') {
    return systemColorScheme;
  }
  return darkMode;
}