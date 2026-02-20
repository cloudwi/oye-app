import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { userApi } from '@/services/api/user';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors, Gradients, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import type { CalendarType } from '@/types/user';

export default function BirthDateEditScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { user, setBirthDate, setCalendarType } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);

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

  const buttonOpacity = useSharedValue(hasChanged ? 1 : 0.4);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    if (hasChanged) {
      buttonOpacity.value = withTiming(1, { duration: 300 });
      buttonScale.value = withSpring(1.02, {}, () => {
        buttonScale.value = withSpring(1);
      });
    } else {
      buttonOpacity.value = withTiming(0.4, { duration: 200 });
    }
  }, [hasChanged]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

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

  const handleSave = async () => {
    if (!hasChanged) return;
    setIsSaving(true);
    const birthDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

    setBirthDate(birthDate);
    if (selectedCalendarType) {
      setCalendarType(selectedCalendarType);
    }

    try {
      await userApi.updateMe({
        name: user?.name || '사용자',
        birthDate,
        gender: user?.gender || undefined,
        calendarType: selectedCalendarType || undefined,
      });
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error updating birthdate:', error);
    }
    setIsSaving(false);
    router.back();
  };

  const renderPicker = (
    data: number[],
    selected: number,
    onSelect: (value: number) => void,
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
              {item}
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>생년월일 수정</Text>
        <View style={styles.backButton} />
      </View>

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
            <View style={[styles.pickerWrapper, { backgroundColor: surfaceColor }, Shadows.sm]}>
              <Text style={[styles.pickerLabel, { color: textSecondary }]}>년</Text>
              {renderPicker(years, selectedYear, handleSelectYear)}
            </View>
            <View style={[styles.pickerWrapper, { backgroundColor: surfaceColor }, Shadows.sm]}>
              <Text style={[styles.pickerLabel, { color: textSecondary }]}>월</Text>
              {renderPicker(months, selectedMonth, handleSelectMonth)}
            </View>
            <View style={[styles.pickerWrapper, { backgroundColor: surfaceColor }, Shadows.sm]}>
              <Text style={[styles.pickerLabel, { color: textSecondary }]}>일</Text>
              {renderPicker(days, selectedDay, handleSelectDay)}
            </View>
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
                selectedCalendarType === 'SOLAR' && styles.optionButtonActive,
              ]}
              onPress={() => handleSelectCalendarType('SOLAR')}
              activeOpacity={0.7}
            >
              <IconSymbol name="sun.max.fill" size={28} color={selectedCalendarType === 'SOLAR' ? BrandColors.primary : textSecondary} />
              <Text
                style={[
                  styles.optionText,
                  { color: textColor },
                  selectedCalendarType === 'SOLAR' && styles.optionTextActive,
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
                selectedCalendarType === 'LUNAR' && styles.optionButtonActive,
              ]}
              onPress={() => handleSelectCalendarType('LUNAR')}
              activeOpacity={0.7}
            >
              <IconSymbol name="moon.fill" size={28} color={selectedCalendarType === 'LUNAR' ? BrandColors.primary : textSecondary} />
              <Text
                style={[
                  styles.optionText,
                  { color: textColor },
                  selectedCalendarType === 'LUNAR' && styles.optionTextActive,
                ]}
              >
                음력
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Animated.View style={animatedButtonStyle}>
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.9}
            disabled={isSaving || !hasChanged}
          >
            <LinearGradient
              colors={hasChanged ? Gradients.accent : ['#9CA3AF', '#9CA3AF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>저장</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
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
  optionButtonActive: {
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.primary + '10',
  },
  optionText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  optionTextActive: {
    color: BrandColors.primary,
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
  pickerWrapper: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    maxHeight: 200,
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
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  saveButton: {
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
});
