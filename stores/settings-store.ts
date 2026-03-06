import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserSettings } from '@/types/user';

interface SettingsState extends UserSettings {
  // Actions
  setDarkMode: (mode: UserSettings['darkMode']) => void;
  setNotificationEnabled: (enabled: boolean) => void;
  reset: () => void;
}

const defaultSettings: UserSettings = {
  darkMode: 'system',
  notificationEnabled: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setDarkMode: (darkMode) => set({ darkMode }),
      setNotificationEnabled: (notificationEnabled) => set({ notificationEnabled }),

      reset: () => set(defaultSettings),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
