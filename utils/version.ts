import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '0.0.0';
}

export function getAppPlatform(): 'ios' | 'android' | null {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return Platform.OS;
  }
  return null;
}
