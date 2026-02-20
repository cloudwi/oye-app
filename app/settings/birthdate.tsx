import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { useUpdateUser } from '@/hooks/queries/use-update-user';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SettingsHeader } from '@/components/ui/settings-header';
import { SaveButton } from '@/components/ui/save-button';
import { ScrollPicker } from '@/components/ui/scroll-picker';
import { Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import type { CalendarType } from '@/types/user';

export default function BirthDateEditScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { user } = useUserStore();
  const updateUserMutation = useUpdateUser();

  const [selectedCalendarType, setSelectedCalendarType] = useState<CalendarType | null>(user?.calendarType || null);

  const currentYear = new Date().getFullYear();
  const parsedDate = user?.birthDate ? user.birthDate.split('-').map(Number) : [1990, 1, 1];
  const [selectedYear, setSelectedYear] = useState(parsedDate[0]);
  const [selectedMonth, setSelectedMonth] = useState(parsedDate[1]);
  const [selectedDay, setSelectedDay] = useState(parsedDate[2]);

  const years = Array.from({ length: 80 }, (_, i) => currentYear - 10 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const originalBirthDate = user?.birthDate || null;
  const originalCalendarType = user?.calendarType || null;
  const currentBirthDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const hasChanged = currentBirthDate !== originalBirthDate || selectedCalendarType !== originalCalendarType;

  const handleSelectYear = useCallback((value: number) => {
    setSelectedYear(value);
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  }, []);

  const handleSelectMonth = useCallback((value: number) => {
    setSelectedMonth(value);
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  }, []);

  const handleSelectDay = useCallback((value: number) => {
    setSelectedDay(value);
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  }, []);

  const handleSelectCalendarType = (type: CalendarType) => {
    setSelectedCalendarType(selectedCalendarType === type ? null : type);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = () => {
    if (!hasChanged) return;
    const birthDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

    updateUserMutation.mutate(
      {
        name: user?.name || '사용자',
        birthDate,
        gender: user?.gender || undefined,
        calendarType: selectedCalendarType || undefined,
      },
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
        {/* Birth Date Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>생년월일</Text>
          <View style={[styles.dateDisplay, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <Text style={[styles.dateText, { color: textColor }]}>
              {selectedYear}년 {selectedMonth}월 {selectedDay}일
            </Text>
          </View>
          <View style={styles.pickerContainer}>
            <ScrollPicker data={years} selected={selectedYear} onSelect={handleSelectYear} label="년" maxHeight={200} />
            <ScrollPicker data={months} selected={selectedMonth} onSelect={handleSelectMonth} label="월" maxHeight={200} />
            <ScrollPicker data={days} selected={selectedDay} onSelect={handleSelectDay} label="일" maxHeight={200} />
          </View>
        </View>

        {/* Calendar Type Section */}
        <View style={styles.section}>
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
              <Text
                style={[
                  styles.optionText,
                  { color: textColor },
                  selectedCalendarType === 'SOLAR' && { color: tintColor },
                ]}
              >
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
              <Text
                style={[
                  styles.optionText,
                  { color: textColor },
                  selectedCalendarType === 'LUNAR' && { color: tintColor },
                ]}
              >
                음력
              </Text>
            </TouchableOpacity>
          </View>
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
  sectionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
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
  dateDisplay: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dateText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
});
