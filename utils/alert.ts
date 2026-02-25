import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert that works on both native and web.
 */
export function showAlert(title: string, message: string): void {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(title, message);
  }
}
