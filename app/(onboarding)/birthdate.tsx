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
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);

  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth =
    selectedYear != null && selectedMonth != null
      ? new Date(selectedYear, selectedMonth, 0).getDate()
      : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (selectedDay != null && selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [daysInMonth]);

  const isDateValid = selectedYear != null && selectedMonth != null && selectedDay != null;
  const isValid = isDateValid;

  const handleNext = () => {
    if (!isValid) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const birthDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const birthTime = selectedHour != null && selectedMinute != null
      ? `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`
      : null;
    updateUser({ birthDate, birthTime });
    router.push('/(onboarding)/calendartype');
  };

  const dateDisplayKey = `${selectedYear}-${selectedMonth}-${selectedDay}-${selectedHour}-${selectedMinute}`;

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
            style={[styles.dateText, { color: isDateValid ? textColor : textSecondary }]}
          >
            {isDateValid
              ? `${selectedYear}년 ${selectedMonth}월 ${selectedDay}일${selectedHour != null && selectedMinute != null ? ` ${selectedHour}시 ${selectedMinute}분` : ''}`
              : '생년월일을 선택해주세요'}
          </Animated.Text>
        </View>

        <View style={styles.pickerContainer}>
          <ScrollPicker data={years} selected={selectedYear} onSelect={setSelectedYear} label="년" />
          <ScrollPicker data={months} selected={selectedMonth} onSelect={setSelectedMonth} label="월" />
          <ScrollPicker data={days} selected={selectedDay} onSelect={setSelectedDay} label="일" />
        </View>

        <Text style={[styles.timeLabel, { color: textSecondary }]}>
          태어난 시각 (선택)
        </Text>
        <View style={styles.pickerContainer}>
          <ScrollPicker data={hours} selected={selectedHour} onSelect={setSelectedHour} label="시" formatter={(v) => `${v}시`} />
          <ScrollPicker data={minutes} selected={selectedMinute} onSelect={setSelectedMinute} label="분" formatter={(v) => `${v}분`} />
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
  timeLabel: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
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
