import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useSettingsStore } from '@/stores/settings-store';

export function useColorScheme() {
  const systemColorScheme = useSystemColorScheme();
  const { darkMode } = useSettingsStore();

  if (darkMode === 'system') {
    return systemColorScheme;
  }
  return darkMode;
}
