import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';
import { userApi } from '@/services/api/user';
import { queryClient } from '@/services/query-client';
import { notificationService } from '@/services/notification';
import { IconSymbol } from '@/components/ui/icon-symbol';
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

const SettingRow = React.memo(function SettingRow({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  rightElement,
  isLast = false,
  destructive = false,
}: SettingRowProps) {
  const defaultIconColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const dividerColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'divider');
  const effectiveIconColor = iconColor || defaultIconColor;

  return (
    <TouchableOpacity
      style={[
        styles.settingRow,
        !isLast && { borderBottomWidth: 1, borderBottomColor: dividerColor },
      ]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ''}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: effectiveIconColor + '15' }]}>
        <IconSymbol name={icon as any} size={18} color={effectiveIconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: destructive ? BrandColors.error : textColor }]}>
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
});

export default function SettingsScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const switchFalseTrack = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'divider');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { user, reset: resetUser } = useUserStore();
  const { logout: authLogout } = useAuthStore();
  const {
    darkMode,
    notificationEnabled,
    notificationTime,
    setDarkMode,
    setNotificationEnabled,
    reset: resetSettings,
  } = useSettingsStore();
  const profileSummary = [user?.gender === 'MALE' ? '남성' : user?.gender === 'FEMALE' ? '여성' : null, user?.mbti, user?.occupation].filter(Boolean).join(' · ') || '프로필을 설정해보세요';

  const formatNotificationTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const period = h < 12 ? '오전' : '오후';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `매일 ${period} ${displayHour}시 ${String(m).padStart(2, '0')}분`;
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await notificationService.requestPermissions();
      if (granted) {
        await notificationService.getExpoPushToken();
        const [hour, minute] = notificationTime.split(':').map(Number);
        await notificationService.scheduleDailyNotification(hour, minute);
        setNotificationEnabled(true);
      } else {
        if (Platform.OS === 'web') {
          window.alert('설정에서 알림 권한을 허용해주세요.');
        } else {
          Alert.alert('알림 권한', '설정에서 알림 권한을 허용해주세요.');
        }
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

  const performLogout = () => {
    authLogout();
    resetUser();
    resetSettings();
    queryClient.clear();
    router.replace('/(onboarding)');
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('로그아웃 하시겠습니까?')) {
        performLogout();
      }
      return;
    }
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', style: 'destructive', onPress: performLogout },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    const doDelete = async () => {
      try {
        await userApi.deleteMe();
        performLogout();
      } catch (error) {
        if (Platform.OS === 'web') {
          window.alert('계정 삭제에 실패했습니다. 다시 시도해주세요.');
        } else {
          Alert.alert('오류', '계정 삭제에 실패했습니다. 다시 시도해주세요.');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('계정을 탈퇴하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.')) {
        await doDelete();
      }
      return;
    }
    Alert.alert(
      '계정 탈퇴',
      '계정을 탈퇴하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '탈퇴', style: 'destructive', onPress: doDelete },
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
          <TouchableOpacity
            style={[styles.profileCard, { backgroundColor: surfaceColor }, Shadows.sm]}
            onPress={() => router.push('/settings/profile')}
            activeOpacity={0.6}
          >
            <View style={[styles.profileAvatar, { backgroundColor: tintColor + '15' }]}>
              <IconSymbol name="person.fill" size={28} color={tintColor} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: textColor }]}>
                {user?.name || '이름 미설정'}
              </Text>
              <Text style={[styles.profileSummary, { color: textSecondary }]}>
                {profileSummary}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Notification Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>알림</Text>
          <View style={[styles.card, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <SettingRow
              icon="bell.fill"
              iconColor="#F59E0B"
              title="푸시 알림"
              subtitle={notificationEnabled ? '켜짐' : '꺼짐'}
              rightElement={
                <Switch
                  value={notificationEnabled}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: switchFalseTrack, true: tintColor + '60' }}
                  thumbColor={notificationEnabled ? tintColor : '#F3F4F6'}
                />
              }
            />
            <SettingRow
              icon="clock.fill"
              iconColor="#F59E0B"
              title="알림 시간"
              subtitle={formatNotificationTime(notificationTime)}
              onPress={() => router.push('/settings/notification-time')}
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

        {/* Account & Data */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>계정</Text>
          <View style={[styles.card, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <SettingRow
              icon="rectangle.portrait.and.arrow.right"
              iconColor="#F59E0B"
              title="로그아웃"
              onPress={handleLogout}
            />
            <SettingRow
              icon="trash.fill"
              iconColor="#EF4444"
              title="계정 탈퇴"
              onPress={handleDeleteAccount}
              destructive
              isLast
            />
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>정보</Text>
          <View style={[styles.card, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <SettingRow
              icon="doc.text.fill"
              iconColor="#3B82F6"
              title="개인정보 처리방침"
              onPress={() => router.push('/legal/privacy')}
            />
            <SettingRow
              icon="doc.plaintext"
              iconColor="#3B82F6"
              title="이용약관"
              onPress={() => router.push('/legal/terms')}
            />
            <SettingRow
              icon="envelope.fill"
              iconColor="#10B981"
              title="문의하기"
              onPress={() => router.push('/inquiry')}
              isLast
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: textSecondary }]}>오늘의 예감</Text>
          <Text style={[styles.appVersion, { color: textSecondary }]}>
            v{Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  profileSummary: {
    fontSize: FontSizes.sm,
    marginTop: 2,
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
