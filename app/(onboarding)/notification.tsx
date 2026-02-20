import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { useSettingsStore } from '@/stores/settings-store';
import { notificationService } from '@/services/notification';
import { userApi } from '@/services/api/user';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BackHeader } from '@/components/ui/back-header';
import { GradientButton } from '@/components/ui/gradient-button';
import { BrandColors, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';

export default function OnboardingNotification() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { user, completeOnboarding } = useUserStore();
  const { setNotificationEnabled } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);

  const sendUserProfile = async () => {
    try {
      await userApi.updateMe({
        name: user?.name || '사용자',
        birthDate: user?.birthDate || undefined,
        birthTime: user?.birthTime || undefined,
        gender: user?.gender || undefined,
        calendarType: user?.calendarType || undefined,
        occupation: user?.occupation || undefined,
        mbti: user?.mbti || undefined,
        bloodType: user?.bloodType || undefined,
        interests: user?.interests || undefined,
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  const handleEnableNotification = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsLoading(true);
    try {
      const granted = await notificationService.requestPermissions();
      if (granted) {
        await notificationService.getExpoPushToken();
        await notificationService.scheduleDailyNotification(8, 0);
        setNotificationEnabled(true);
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
    await sendUserProfile();
    setIsLoading(false);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    setNotificationEnabled(false);
    await sendUserProfile();
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <BackHeader />

      <View style={styles.content}>
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          style={styles.iconArea}
        >
          <View style={[styles.iconOuter, { backgroundColor: '#F59E0B' + '20' }]}>
            <View style={[styles.iconInner, { backgroundColor: '#F59E0B' + '30' }]}>
              <IconSymbol name="bell.fill" size={48} color="#F59E0B" />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <Text style={[styles.title, { color: textColor }]}>알림 설정</Text>
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            매일 아침 8시에{'\n'}오늘의 예감을 알려드릴게요
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(600).delay(400)}
          style={[styles.previewCard, { backgroundColor: surfaceColor }, Shadows.md]}
        >
          <View style={styles.previewHeader}>
            <View style={[styles.previewIcon, { backgroundColor: BrandColors.primary + '15' }]}>
              <Text style={styles.previewIconText}>OYE</Text>
            </View>
            <View style={styles.previewHeaderText}>
              <Text style={[styles.previewApp, { color: textColor }]}>오늘의 예감</Text>
              <Text style={[styles.previewTime, { color: textSecondary }]}>오전 8:00</Text>
            </View>
          </View>
          <Text style={[styles.previewMessage, { color: textColor }]}>
            좋은 아침이에요! 오늘의 예감이 도착했어요
          </Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <GradientButton
          label="알림 받기"
          onPress={handleEnableNotification}
          loading={isLoading}
          disabled={isLoading}
        />

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.7} disabled={isLoading} accessibilityRole="button" accessibilityLabel="나중에 설정할게요">
          <Text style={[styles.skipText, { color: textSecondary }]}>나중에 설정할게요</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  iconArea: {
    marginBottom: Spacing.xl,
  },
  iconOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  previewCard: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  previewIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  previewIconText: {
    fontSize: 10,
    fontWeight: '800',
    color: BrandColors.primary,
  },
  previewHeaderText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewApp: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  previewTime: {
    fontSize: FontSizes.xs,
  },
  previewMessage: {
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  skipText: {
    fontSize: FontSizes.md,
  },
});
