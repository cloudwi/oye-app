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
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { router } from 'expo-router';
import {
  BrandColors,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '@/constants/theme';

interface SettingRowProps {
  icon: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isLast?: boolean;
  destructive?: boolean;
}

function SettingRow({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  rightElement,
  isLast = false,
  destructive = false,
}: SettingRowProps) {
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const dividerColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'divider');

  return (
    <TouchableOpacity
      style={[
        styles.settingRow,
        !isLast && { borderBottomWidth: 1, borderBottomColor: dividerColor },
      ]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={0.6}
    >
      <View style={[styles.iconContainer, { backgroundColor: (iconColor || BrandColors.primary) + '15' }]}>
        <IconSymbol name={icon as any} size={18} color={iconColor || BrandColors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: destructive ? '#EF4444' : textColor }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: textSecondary }]}>{subtitle}</Text>
        )}
      </View>
      {rightElement}
      {onPress && !rightElement && (
        <IconSymbol name="chevron.right" size={14} color={textSecondary} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

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
    ? format(new Date(user.birthDate), 'yyyy.MM.dd', { locale: ko })
    : '미설정';

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
      case 'system': return '시스템';
      case 'light': return '라이트';
      case 'dark': return '다크';
    }
  };

  const handleResetData = () => {
    Alert.alert(
      '데이터 초기화',
      '모든 데이터가 삭제됩니다.\n계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
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

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>프로필</Text>
          <View style={[styles.card, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <SettingRow
              icon="calendar"
              iconColor={BrandColors.primary}
              title="생년월일"
              subtitle={formattedBirthDate}
              isLast
            />
          </View>
        </View>

        {/* Notification Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>알림</Text>
          <View style={[styles.card, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <SettingRow
              icon="bell.fill"
              iconColor="#F59E0B"
              title="푸시 알림"
              subtitle={notificationEnabled ? `매일 ${notificationTime}` : '꺼짐'}
              rightElement={
                <Switch
                  value={notificationEnabled}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: '#E5E7EB', true: BrandColors.primary + '60' }}
                  thumbColor={notificationEnabled ? BrandColors.primary : '#F3F4F6'}
                />
              }
              isLast
            />
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>화면</Text>
          <View style={[styles.card, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <SettingRow
              icon="moon.fill"
              iconColor="#8B5CF6"
              title="다크 모드"
              subtitle={getDarkModeLabel()}
              onPress={handleDarkModeChange}
              isLast
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>데이터</Text>
          <View style={[styles.card, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <SettingRow
              icon="trash.fill"
              iconColor="#EF4444"
              title="데이터 초기화"
              onPress={handleResetData}
              destructive
              isLast
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: textSecondary }]}>오늘의 운세</Text>
          <Text style={[styles.appVersion, { color: textSecondary }]}>v1.0.0</Text>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.xs,
  },
  appName: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  appVersion: {
    fontSize: FontSizes.xs,
  },
});
