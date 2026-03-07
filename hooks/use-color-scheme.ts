import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useSettingsStore } from '@/stores/settings-store';

export function useColorScheme(): 'light' | 'dark' {
  const systemColorScheme = useSystemColorScheme();
  const { darkMode } = useSettingsStore();

  if (darkMode === 'system') {
    return systemColorScheme === 'dark' ? 'dark' : 'light';
  }
  return darkMode;
}
