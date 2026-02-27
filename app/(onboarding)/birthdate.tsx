import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { BackHeader } from '@/components/ui/back-header';
import { GradientButton } from '@/components/ui/gradient-button';
import { BirthdateForm } from '@/components/forms/BirthdateForm';
import { Spacing, FontSizes } from '@/constants/theme';

export default function OnboardingBirthdate() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({}, 'textSecondary');

  const { updateUser } = useUserStore();

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);

  const isValid = selectedYear != null && selectedMonth != null && selectedDay != null;

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <BackHeader />

      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>생년월일</Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          맞춤 예감을 위해 알려주세요
        </Text>

        <BirthdateForm
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedDay={selectedDay}
          selectedHour={selectedHour}
          selectedMinute={selectedMinute}
          selectedCalendarType={null}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          onDayChange={setSelectedDay}
          onHourChange={setSelectedHour}
          onMinuteChange={setSelectedMinute}
          onCalendarTypeChange={() => {}}
          showCalendarType={false}
        />
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
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});
