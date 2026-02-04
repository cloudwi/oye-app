import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function OnboardingBirthdate() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const subtextColor = useThemeColor({ light: '#666', dark: '#999' }, 'icon');
  const cardColor = useThemeColor({ light: '#F5F5F5', dark: '#2A2A2A' }, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const accentColor = '#FF6B6B';

  const { setBirthDate } = useUserStore();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(1990);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);

  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleNext = () => {
    const birthDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    setBirthDate(birthDate);
    router.push('/(onboarding)/notification');
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
        <Text style={[styles.title, { color: textColor }]}>생년월일을 알려주세요</Text>
        <Text style={[styles.subtitle, { color: subtextColor }]}>
          정확한 운세를 위해 필요해요
        </Text>

        <View style={styles.pickerContainer}>
          <View style={styles.pickerColumn}>
            <Text style={[styles.pickerLabel, { color: subtextColor }]}>년도</Text>
            <ScrollView
              style={[styles.picker, { backgroundColor: cardColor }]}
              showsVerticalScrollIndicator={false}
              snapToInterval={48}
              decelerationRate="fast"
            >
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.pickerItem,
                    selectedYear === year && styles.pickerItemSelected,
                    selectedYear === year && { backgroundColor: accentColor + '20' },
                  ]}
                  onPress={() => setSelectedYear(year)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      { color: selectedYear === year ? accentColor : textColor },
                      selectedYear === year && styles.pickerItemTextSelected,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.pickerColumn}>
            <Text style={[styles.pickerLabel, { color: subtextColor }]}>월</Text>
            <ScrollView
              style={[styles.picker, { backgroundColor: cardColor }]}
              showsVerticalScrollIndicator={false}
              snapToInterval={48}
              decelerationRate="fast"
            >
              {months.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.pickerItem,
                    selectedMonth === month && styles.pickerItemSelected,
                    selectedMonth === month && { backgroundColor: accentColor + '20' },
                  ]}
                  onPress={() => setSelectedMonth(month)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      { color: selectedMonth === month ? accentColor : textColor },
                      selectedMonth === month && styles.pickerItemTextSelected,
                    ]}
                  >
                    {month}월
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.pickerColumn}>
            <Text style={[styles.pickerLabel, { color: subtextColor }]}>일</Text>
            <ScrollView
              style={[styles.picker, { backgroundColor: cardColor }]}
              showsVerticalScrollIndicator={false}
              snapToInterval={48}
              decelerationRate="fast"
            >
              {days.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.pickerItem,
                    selectedDay === day && styles.pickerItemSelected,
                    selectedDay === day && { backgroundColor: accentColor + '20' },
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      { color: selectedDay === day ? accentColor : textColor },
                      selectedDay === day && styles.pickerItemTextSelected,
                    ]}
                  >
                    {day}일
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={[styles.selectedDate, { backgroundColor: cardColor }]}>
          <Text style={[styles.selectedDateText, { color: textColor }]}>
            {selectedYear}년 {selectedMonth}월 {selectedDay}일
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="다음"
          onPress={handleNext}
          variant="secondary"
          size="large"
          style={styles.button}
        />
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
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  picker: {
    height: 200,
    borderRadius: 12,
  },
  pickerItem: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  pickerItemSelected: {
    borderRadius: 8,
  },
  pickerItemText: {
    fontSize: 16,
  },
  pickerItemTextSelected: {
    fontWeight: 'bold',
  },
  selectedDate: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedDateText: {
    fontSize: 20,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    width: '100%',
  },
});
