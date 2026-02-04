import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserSettings } from '@/types/user';

interface SettingsState extends UserSettings {
  // Actions
  setDarkMode: (mode: UserSettings['darkMode']) => void;
  setNotificationEnabled: (enabled: boolean) => void;
  setNotificationTime: (time: string) => void;
  reset: () => void;
}

const defaultSettings: UserSettings = {
  darkMode: 'system',
  notificationEnabled: false,
  notificationTime: '08:00',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setDarkMode: (darkMode) => set({ darkMode }),
      setNotificationEnabled: (notificationEnabled) => set({ notificationEnabled }),
      setNotificationTime: (notificationTime) => set({ notificationTime }),

      reset: () => set(defaultSettings),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
