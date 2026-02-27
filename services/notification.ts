import { Platform } from 'react-native';
import { storage } from './storage';
import { userApi } from './api/user';

// Only import expo-notifications on native platforms
let Notifications: typeof import('expo-notifications') | null = null;

if (Platform.OS !== 'web') {
  const NotificationsModule = require('expo-notifications');
  Notifications = NotificationsModule;
  NotificationsModule.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web' || !Notifications) {
      // Web doesn't support push notifications the same way
      return true;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  async getExpoPushToken(): Promise<string | null> {
    if (Platform.OS === 'web' || !Notifications) {
      return null;
    }

    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('fortune', {
          name: '오늘의 예감',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B6B',
        });
      }

      const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
      if (!projectId) {
        console.warn('Push token: EXPO_PUBLIC_PROJECT_ID가 설정되지 않았습니다. `eas init`을 실행하세요.');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      await storage.set(storage.keys.DEVICE_TOKEN, token.data);
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  },

  async scheduleDailyNotification(hour: number, minute: number): Promise<string | null> {
    if (Platform.OS === 'web' || !Notifications) {
      return null;
    }

    try {
      await this.cancelAllScheduledNotifications();

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '오늘의 예감이 도착했어요!',
          body: '새로운 하루, 당신의 예감을 확인해보세요.',
          data: { type: 'daily_fortune' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  },

  async cancelAllScheduledNotifications(): Promise<void> {
    if (Platform.OS === 'web' || !Notifications) {
      return;
    }
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  addNotificationListener(
    handler: (notification: any) => void
  ): { remove: () => void } | null {
    if (Platform.OS === 'web' || !Notifications) {
      return null;
    }
    return Notifications.addNotificationReceivedListener(handler);
  },

  addNotificationResponseListener(
    handler: (response: any) => void
  ): { remove: () => void } | null {
    if (Platform.OS === 'web' || !Notifications) {
      return null;
    }
    return Notifications.addNotificationResponseReceivedListener(handler);
  },

  async registerPushTokenToServer(): Promise<void> {
    try {
      const token = await this.getExpoPushToken();
      if (token) {
        await userApi.registerPushToken(token);
      }
    } catch (error) {
      console.error('Error registering push token to server:', error);
    }
  },

  async clearPushTokenFromServer(): Promise<void> {
    try {
      await userApi.registerPushToken(null);
    } catch (error) {
      console.error('Error clearing push token from server:', error);
    }
  },
};
