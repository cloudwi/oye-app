import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import type { Gender, CalendarType } from '@/types/user';

export default function OnboardingBirthdate() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { setBirthDate, setGender, setCalendarType } = useUserStore();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(1990);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedCalendarType, setSelectedCalendarType] = useState<CalendarType>('SOLAR');

  const years = Array.from({ length: 80 }, (_, i) => currentYear - 10 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleNext = () => {
    const birthDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    setBirthDate(birthDate);
    if (selectedGender) {
      setGender(selectedGender);
    }
    setCalendarType(selectedCalendarType);
    router.push('/(onboarding)/notification');
  };

  const handleBack = () => {
    router.back();
  };

  const renderPicker = (
    data: number[],
    selected: number,
    onSelect: (value: number) => void,
    suffix: string = ''
  ) => (
    <ScrollView
      style={styles.picker}
      contentContainerStyle={styles.pickerContent}
      showsVerticalScrollIndicator={false}
      snapToInterval={44}
      decelerationRate="fast"
    >
      {data.map((item) => {
        const isSelected = selected === item;
        return (
          <TouchableOpacity
            key={item}
            style={[
              styles.pickerItem,
              isSelected && { backgroundColor: BrandColors.primary + '15' },
            ]}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pickerText,
                { color: isSelected ? BrandColors.primary : textSecondary },
                isSelected && styles.pickerTextSelected,
              ]}
            >
              {item}{suffix}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>생년월일</Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          맞춤 운세를 위해 알려주세요
        </Text>

        {/* Gender Selection */}
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              { backgroundColor: surfaceColor },
              selectedGender === 'MALE' && styles.genderButtonActive,
            ]}
            onPress={() => setSelectedGender('MALE')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.genderText,
                { color: textSecondary },
                selectedGender === 'MALE' && styles.genderTextActive,
              ]}
            >
              남성
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              { backgroundColor: surfaceColor },
              selectedGender === 'FEMALE' && styles.genderButtonActive,
            ]}
            onPress={() => setSelectedGender('FEMALE')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.genderText,
                { color: textSecondary },
                selectedGender === 'FEMALE' && styles.genderTextActive,
              ]}
            >
              여성
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Display */}
        <View style={[styles.dateDisplay, { backgroundColor: surfaceColor }, Shadows.md]}>
          <Text style={[styles.dateText, { color: textColor }]}>
            {selectedYear}년 {selectedMonth}월 {selectedDay}일
          </Text>
        </View>

        {/* Pickers */}
        <View style={styles.pickerContainer}>
          <View style={[styles.pickerWrapper, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <Text style={[styles.pickerLabel, { color: textSecondary }]}>년</Text>
            {renderPicker(years, selectedYear, setSelectedYear)}
          </View>

          <View style={[styles.pickerWrapper, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <Text style={[styles.pickerLabel, { color: textSecondary }]}>월</Text>
            {renderPicker(months, selectedMonth, setSelectedMonth)}
          </View>

          <View style={[styles.pickerWrapper, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <Text style={[styles.pickerLabel, { color: textSecondary }]}>일</Text>
            {renderPicker(days, selectedDay, setSelectedDay)}
          </View>
        </View>

        {/* Calendar Type Toggle */}
        <View style={[styles.calendarToggle, { backgroundColor: surfaceColor }, Shadows.sm]}>
          <TouchableOpacity
            style={[
              styles.calendarOption,
              selectedCalendarType === 'SOLAR' && styles.calendarOptionActive,
            ]}
            onPress={() => setSelectedCalendarType('SOLAR')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.calendarOptionText,
                { color: textSecondary },
                selectedCalendarType === 'SOLAR' && styles.calendarOptionTextActive,
              ]}
            >
              양력
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.calendarOption,
              selectedCalendarType === 'LUNAR' && styles.calendarOptionActive,
            ]}
            onPress={() => setSelectedCalendarType('LUNAR')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.calendarOptionText,
                { color: textSecondary },
                selectedCalendarType === 'LUNAR' && styles.calendarOptionTextActive,
              ]}
            >
              음력
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleNext} activeOpacity={0.9}>
          <LinearGradient
            colors={[BrandColors.primary, BrandColors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>다음</Text>
          </LinearGradient>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: Spacing.lg,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  genderButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderButtonActive: {
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.primary + '10',
  },
  genderText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  genderTextActive: {
    color: BrandColors.primary,
  },
  dateDisplay: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
  pickerWrapper: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    maxHeight: 220,
  },
  pickerLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  picker: {
    flex: 1,
  },
  pickerContent: {
    paddingVertical: Spacing.xs,
  },
  pickerItem: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  pickerText: {
    fontSize: FontSizes.md,
  },
  pickerTextSelected: {
    fontWeight: '700',
  },
  calendarToggle: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.lg,
  },
  calendarOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  calendarOptionActive: {
    backgroundColor: BrandColors.primary + '15',
  },
  calendarOptionText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  calendarOptionTextActive: {
    color: BrandColors.primary,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  button: {
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
});
