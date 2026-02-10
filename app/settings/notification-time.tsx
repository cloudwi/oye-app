import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSettingsStore } from '@/stores/settings-store';
import { notificationService } from '@/services/notification';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';

export default function NotificationTimeScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { notificationTime, setNotificationTime } = useSettingsStore();
  const [hour, minute] = notificationTime.split(':').map(Number);

  const [selectedHour, setSelectedHour] = useState(hour);
  const [selectedMinute, setSelectedMinute] = useState(minute);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleSave = async () => {
    const timeStr = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
    setNotificationTime(timeStr);
    await notificationService.scheduleDailyNotification(selectedHour, selectedMinute);
    router.back();
  };

  const renderPicker = (
    data: number[],
    selected: number,
    onSelect: (value: number) => void,
    formatter?: (value: number) => string,
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
        const label = formatter ? formatter(item) : String(item).padStart(2, '0');
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
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const period = selectedHour < 12 ? '오전' : '오후';
  const displayHour = selectedHour === 0 ? 12 : selectedHour > 12 ? selectedHour - 12 : selectedHour;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>알림 시간</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        {/* Time Display */}
        <View style={[styles.timeDisplay, { backgroundColor: surfaceColor }, Shadows.sm]}>
          <Text style={[styles.timeText, { color: textColor }]}>
            {period} {displayHour}시 {String(selectedMinute).padStart(2, '0')}분
          </Text>
        </View>

        {/* Pickers */}
        <View style={styles.pickerContainer}>
          <View style={[styles.pickerWrapper, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <Text style={[styles.pickerLabel, { color: textSecondary }]}>시</Text>
            {renderPicker(hours, selectedHour, setSelectedHour)}
          </View>
          <View style={[styles.pickerWrapper, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <Text style={[styles.pickerLabel, { color: textSecondary }]}>분</Text>
            {renderPicker(minutes, selectedMinute, setSelectedMinute)}
          </View>
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.9}
          style={[styles.saveButton, { backgroundColor: BrandColors.primary }]}
        >
          <Text style={styles.saveButtonText}>저장</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  timeDisplay: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  timeText: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  pickerWrapper: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    maxHeight: 300,
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
