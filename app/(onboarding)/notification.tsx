import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { useSettingsStore } from '@/stores/settings-store';
import { notificationService } from '@/services/notification';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function OnboardingNotification() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const subtextColor = useThemeColor({ light: '#666', dark: '#999' }, 'icon');
  const cardColor = useThemeColor({ light: '#F5F5F5', dark: '#2A2A2A' }, 'background');
  const accentColor = '#FF6B6B';

  const { completeOnboarding } = useUserStore();
  const { setNotificationEnabled } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableNotification = async () => {
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
    setIsLoading(false);
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    setNotificationEnabled(false);
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: accentColor + '20' }]}>
            <IconSymbol name="bell.fill" size={60} color={accentColor} />
          </View>
        </View>

        <Text style={[styles.title, { color: textColor }]}>
          알림을 켜시겠어요?
        </Text>
        <Text style={[styles.subtitle, { color: subtextColor }]}>
          매일 아침 8시에{'\n'}
          오늘의 운세 알림을 보내드려요
        </Text>

        <View style={[styles.benefitCard, { backgroundColor: cardColor }]}>
          <View style={styles.benefitItem}>
            <IconSymbol name="sun.max.fill" size={24} color={accentColor} />
            <View style={styles.benefitText}>
              <Text style={[styles.benefitTitle, { color: textColor }]}>아침을 운세와 함께</Text>
              <Text style={[styles.benefitDesc, { color: subtextColor }]}>
                하루를 시작하기 전 오늘의 운세를 확인하세요
              </Text>
            </View>
          </View>
          <View style={styles.benefitItem}>
            <IconSymbol name="clock.fill" size={24} color={accentColor} />
            <View style={styles.benefitText}>
              <Text style={[styles.benefitTitle, { color: textColor }]}>놓치지 않게</Text>
              <Text style={[styles.benefitDesc, { color: subtextColor }]}>
                바쁜 하루에도 운세 확인을 잊지 않아요
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="알림 받기"
          onPress={handleEnableNotification}
          variant="secondary"
          size="large"
          style={styles.button}
          loading={isLoading}
        />
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: subtextColor }]}>나중에 할게요</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  benefitCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    gap: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    width: '100%',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 16,
  },
});
