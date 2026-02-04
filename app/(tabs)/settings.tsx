import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { useSettingsStore } from '@/stores/settings-store';
import { useFortuneStore } from '@/stores/fortune-store';
import { notificationService } from '@/services/notification';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { router } from 'expo-router';

interface SettingItemProps {
  icon: string;
  title: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingItem({ icon, title, value, onPress, rightElement }: SettingItemProps) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#666', dark: '#999' }, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingLeft}>
        <IconSymbol name={icon as any} size={22} color={tintColor} />
        <Text style={[styles.settingTitle, { color: textColor }]}>{title}</Text>
      </View>
      {value && (
        <Text style={[styles.settingValue, { color: subtextColor }]}>{value}</Text>
      )}
      {rightElement}
      {onPress && !rightElement && (
        <IconSymbol name="chevron.right" size={16} color={subtextColor} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const subtextColor = useThemeColor({ light: '#666', dark: '#999' }, 'icon');
  const cardColor = useThemeColor({ light: '#F5F5F5', dark: '#2A2A2A' }, 'background');

  const { user, reset: resetUser } = useUserStore();
  const {
    darkMode,
    notificationEnabled,
    notificationTime,
    setDarkMode,
    setNotificationEnabled,
    reset: resetSettings,
  } = useSettingsStore();
  const { reset: resetFortune } = useFortuneStore();

  const formattedBirthDate = user?.birthDate
    ? format(new Date(user.birthDate), 'yyyy년 M월 d일', { locale: ko })
    : '설정되지 않음';

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await notificationService.requestPermissions();
      if (granted) {
        await notificationService.getExpoPushToken();
        const [hour, minute] = notificationTime.split(':').map(Number);
        await notificationService.scheduleDailyNotification(hour, minute);
        setNotificationEnabled(true);
      } else {
        Alert.alert('알림 권한', '설정에서 알림 권한을 허용해주세요.');
      }
    } else {
      await notificationService.cancelAllScheduledNotifications();
      setNotificationEnabled(false);
    }
  };

  const handleDarkModeChange = () => {
    const modes: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];
    const currentIndex = modes.indexOf(darkMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setDarkMode(nextMode);
  };

  const getDarkModeLabel = () => {
    switch (darkMode) {
      case 'system':
        return '시스템 설정';
      case 'light':
        return '라이트 모드';
      case 'dark':
        return '다크 모드';
    }
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      '온보딩 초기화',
      '온보딩을 다시 진행하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          style: 'destructive',
          onPress: () => {
            resetUser();
            router.replace('/(onboarding)');
          },
        },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      '데이터 초기화',
      '모든 데이터가 삭제됩니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            resetUser();
            resetSettings();
            resetFortune();
            router.replace('/(onboarding)');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>설정</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: subtextColor }]}>프로필</Text>
          <Card variant="outlined" style={{ backgroundColor: cardColor }}>
            <SettingItem
              icon="calendar"
              title="생년월일"
              value={formattedBirthDate}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: subtextColor }]}>알림</Text>
          <Card variant="outlined" style={{ backgroundColor: cardColor }}>
            <SettingItem
              icon="bell.fill"
              title="푸시 알림"
              rightElement={
                <Switch
                  value={notificationEnabled}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: '#ccc', true: '#FF6B6B' }}
                />
              }
            />
            {notificationEnabled && (
              <SettingItem
                icon="clock.fill"
                title="알림 시간"
                value={notificationTime}
              />
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: subtextColor }]}>앱 설정</Text>
          <Card variant="outlined" style={{ backgroundColor: cardColor }}>
            <SettingItem
              icon="moon.fill"
              title="다크 모드"
              value={getDarkModeLabel()}
              onPress={handleDarkModeChange}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: subtextColor }]}>기타</Text>
          <Card variant="outlined" style={{ backgroundColor: cardColor }}>
            <SettingItem
              icon="arrow.counterclockwise"
              title="온보딩 다시 보기"
              onPress={handleResetOnboarding}
            />
            <SettingItem
              icon="trash.fill"
              title="데이터 초기화"
              onPress={handleResetData}
            />
          </Card>
        </View>

        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: subtextColor }]}>오늘의 운세</Text>
          <Text style={[styles.appVersion, { color: subtextColor }]}>버전 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  appName: {
    fontSize: 14,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 12,
  },
});
