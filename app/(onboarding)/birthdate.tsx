import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { BackHeader } from '@/components/ui/back-header';
import { GradientButton } from '@/components/ui/gradient-button';
import { ScrollPicker } from '@/components/ui/scroll-picker';
import { Spacing, FontSizes, Shadows } from '@/constants/theme';

export default function OnboardingBirthdate() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { updateUser } = useUserStore();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth =
    selectedYear != null && selectedMonth != null
      ? new Date(selectedYear, selectedMonth, 0).getDate()
      : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    if (selectedDay != null && selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [daysInMonth]);

  const isValid = selectedYear != null && selectedMonth != null && selectedDay != null;

  const handleNext = () => {
    if (!isValid) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const birthDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    updateUser({ birthDate });
    router.push('/(onboarding)/calendartype');
  };

  const dateDisplayKey = `${selectedYear}-${selectedMonth}-${selectedDay}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <BackHeader />

      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>생년월일</Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          맞춤 예감을 위해 알려주세요
        </Text>

        <View style={[styles.dateDisplay, { backgroundColor: surfaceColor }, Shadows.md]}>
          <Animated.Text
            key={dateDisplayKey}
            entering={FadeIn.duration(300)}
            style={[styles.dateText, { color: isValid ? textColor : textSecondary }]}
          >
            {isValid
              ? `${selectedYear}년 ${selectedMonth}월 ${selectedDay}일`
              : '생년월일을 선택해주세요'}
          </Animated.Text>
        </View>

        <View style={styles.pickerContainer}>
          <ScrollPicker data={years} selected={selectedYear} onSelect={setSelectedYear} label="년" />
          <ScrollPicker data={months} selected={selectedMonth} onSelect={setSelectedMonth} label="월" />
          <ScrollPicker data={days} selected={selectedDay} onSelect={setSelectedDay} label="일" />
        </View>
      </View>

      <View style={styles.footer}>
        <GradientButton
          label="다음"
          onPress={handleNext}
          isEnabled={isValid}
        />
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
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.xl,
  },
  dateDisplay: {
    padding: Spacing.lg,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  dateText: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});
