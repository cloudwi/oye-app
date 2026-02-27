import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { useUpdateUser } from '@/hooks/queries/use-update-user';
import { SettingsHeader } from '@/components/ui/settings-header';
import { SaveButton } from '@/components/ui/save-button';
import { BirthdateForm } from '@/components/forms/BirthdateForm';
import { Spacing } from '@/constants/theme';
import { buildUpdatePayload } from '@/utils/user';
import type { CalendarType } from '@/types/user';

export default function BirthDateEditScreen() {
  const backgroundColor = useThemeColor({}, 'background');

  const { user } = useUserStore();
  const updateUserMutation = useUpdateUser();

  const [selectedCalendarType, setSelectedCalendarType] = useState<CalendarType | null>(user?.calendarType || null);

  const parsedDate = user?.birthDate ? user.birthDate.split('-').map(Number) : [1990, 1, 1];
  const parsedTime = user?.birthTime ? user.birthTime.split(':').map(Number) : [null, null];
  const [selectedYear, setSelectedYear] = useState(parsedDate[0]);
  const [selectedMonth, setSelectedMonth] = useState(parsedDate[1]);
  const [selectedDay, setSelectedDay] = useState(parsedDate[2]);
  const [selectedHour, setSelectedHour] = useState<number | null>(parsedTime[0]);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(parsedTime[1]);

  const originalBirthDate = user?.birthDate || null;
  const originalBirthTime = user?.birthTime || null;
  const originalCalendarType = user?.calendarType || null;
  const currentBirthDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const currentBirthTime = selectedHour != null && selectedMinute != null
    ? `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`
    : null;
  const hasChanged = currentBirthDate !== originalBirthDate || selectedCalendarType !== originalCalendarType || currentBirthTime !== originalBirthTime;

  const handleSave = () => {
    if (!hasChanged) return;
    updateUserMutation.mutate(
      buildUpdatePayload(user, {
        birthDate: currentBirthDate,
        birthTime: currentBirthTime || undefined,
        calendarType: selectedCalendarType || undefined,
      }),
      {
        onSuccess: () => {
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          router.back();
        },
      }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <SettingsHeader title="생년월일 수정" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <BirthdateForm
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedDay={selectedDay}
            selectedHour={selectedHour}
            selectedMinute={selectedMinute}
            selectedCalendarType={selectedCalendarType}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
            onDayChange={useCallback((d: number) => setSelectedDay(d), [])}
            onHourChange={setSelectedHour}
            onMinuteChange={setSelectedMinute}
            onCalendarTypeChange={setSelectedCalendarType}
            pickerMaxHeight={200}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <SaveButton
          onPress={handleSave}
          hasChanged={hasChanged}
          isPending={updateUserMutation.isPending}
        />
      </View>
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
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
});
