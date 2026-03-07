import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScrollPicker } from '@/components/ui/scroll-picker';
import { Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import type { CalendarType } from '@/types/user';

interface BirthdateFormProps {
  selectedYear: number | null;
  selectedMonth: number | null;
  selectedDay: number | null;
  selectedHour: number | null;
  selectedMinute: number | null;
  selectedCalendarType: CalendarType | null;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onDayChange: (day: number) => void;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  onCalendarTypeChange: (type: CalendarType | null) => void;
  showCalendarType?: boolean;
  pickerMaxHeight?: number;
}

export function BirthdateForm({
  selectedYear,
  selectedMonth,
  selectedDay,
  selectedHour,
  selectedMinute,
  selectedCalendarType,
  onYearChange,
  onMonthChange,
  onDayChange,
  onHourChange,
  onMinuteChange,
  onCalendarTypeChange,
  showCalendarType = true,
  pickerMaxHeight,
}: BirthdateFormProps) {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth =
    selectedYear != null && selectedMonth != null
      ? new Date(selectedYear, selectedMonth, 0).getDate()
      : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  useEffect(() => {
    if (selectedDay != null && selectedDay > daysInMonth) {
      onDayChange(daysInMonth);
    }
  }, [daysInMonth, selectedDay, onDayChange]);

  const currentBirthTime =
    selectedHour != null && selectedMinute != null
      ? `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`
      : null;

  const isDateValid = selectedYear != null && selectedMonth != null && selectedDay != null;

  const withHaptic = useCallback(
    <T,>(fn: (v: T) => void) =>
      (v: T) => {
        fn(v);
        if (Platform.OS !== 'web') {
          Haptics.selectionAsync();
        }
      },
    [],
  );

  const handleSelectCalendarType = (type: CalendarType) => {
    onCalendarTypeChange(selectedCalendarType === type ? null : type);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Date display */}
      <View style={[styles.dateDisplay, { backgroundColor: surfaceColor }, Shadows.sm]}>
        <Text style={[styles.dateText, { color: isDateValid ? textColor : textSecondary }]}>
          {isDateValid
            ? `${selectedYear}년 ${selectedMonth}월 ${selectedDay}일`
            : '생년월일을 선택해주세요'}
        </Text>
      </View>

      {/* Date pickers */}
      <View style={styles.pickerContainer}>
        <ScrollPicker data={years} selected={selectedYear} onSelect={withHaptic(onYearChange)} label="년" maxHeight={pickerMaxHeight} />
        <ScrollPicker data={months} selected={selectedMonth} onSelect={withHaptic(onMonthChange)} label="월" maxHeight={pickerMaxHeight} />
        <ScrollPicker data={days} selected={selectedDay} onSelect={withHaptic(onDayChange)} label="일" maxHeight={pickerMaxHeight} />
      </View>

      {/* Time section */}
      <Text style={[styles.sectionLabel, { color: textSecondary }]}>태어난 시각 (선택)</Text>
      <View style={[styles.dateDisplay, { backgroundColor: surfaceColor }, Shadows.sm]}>
        <Text style={[styles.dateText, { color: currentBirthTime ? textColor : textSecondary }]}>
          {currentBirthTime
            ? `${selectedHour}시 ${selectedMinute}분`
            : '시각을 선택해주세요'}
        </Text>
      </View>
      <View style={styles.pickerContainer}>
        <ScrollPicker data={hours} selected={selectedHour} onSelect={withHaptic(onHourChange)} label="시" maxHeight={pickerMaxHeight} formatter={(v) => `${v}시`} />
        <ScrollPicker data={minutes} selected={selectedMinute} onSelect={withHaptic(onMinuteChange)} label="분" maxHeight={pickerMaxHeight} formatter={(v) => `${v}분`} />
      </View>

      {/* Calendar type */}
      {showCalendarType && (
        <>
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>달력 유형</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: surfaceColor },
                Shadows.sm,
                selectedCalendarType === 'SOLAR' && { borderColor: tintColor, backgroundColor: tintColor + '10' },
              ]}
              onPress={() => handleSelectCalendarType('SOLAR')}
              activeOpacity={0.7}
            >
              <IconSymbol name="sun.max.fill" size={28} color={selectedCalendarType === 'SOLAR' ? tintColor : textSecondary} />
              <Text style={[styles.optionText, { color: textColor }, selectedCalendarType === 'SOLAR' && { color: tintColor }]}>
                양력
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: surfaceColor },
                Shadows.sm,
                selectedCalendarType === 'LUNAR' && { borderColor: tintColor, backgroundColor: tintColor + '10' },
              ]}
              onPress={() => handleSelectCalendarType('LUNAR')}
              activeOpacity={0.7}
            >
              <IconSymbol name="moon.fill" size={28} color={selectedCalendarType === 'LUNAR' ? tintColor : textSecondary} />
              <Text style={[styles.optionText, { color: textColor }, selectedCalendarType === 'LUNAR' && { color: tintColor }]}>
                음력
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  dateDisplay: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  dateText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    marginLeft: Spacing.xs,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  optionButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: Spacing.sm,
  },
  optionText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
