import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

const MIGRATION_KEY = 'auth-storage-migrated';

const isNative = Platform.OS !== 'web';

/**
 * SecureStore 기반 zustand persist storage.
 * - iOS/Android: expo-secure-store 사용 (암호화)
 * - Web: AsyncStorage 폴백
 * - 최초 실행 시 AsyncStorage → SecureStore 마이그레이션
 */
export const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (!isNative) {
      return AsyncStorage.getItem(name);
    }

    // 최초 실행 시 마이그레이션 처리
    const migrated = await AsyncStorage.getItem(MIGRATION_KEY);
    if (!migrated) {
      const oldValue = await AsyncStorage.getItem(name);
      if (oldValue) {
        await SecureStore.setItemAsync(name, oldValue);
        await AsyncStorage.removeItem(name);
      }
      await AsyncStorage.setItem(MIGRATION_KEY, 'true');
    }

    return SecureStore.getItemAsync(name);
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (!isNative) {
      await AsyncStorage.setItem(name, value);
      return;
    }
    await SecureStore.setItemAsync(name, value);
  },

  removeItem: async (name: string): Promise<void> => {
    if (!isNative) {
      await AsyncStorage.removeItem(name);
      return;
    }
    await SecureStore.deleteItemAsync(name);
  },
};
