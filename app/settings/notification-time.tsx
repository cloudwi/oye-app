import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSettingsStore } from '@/stores/settings-store';
import { notificationService } from '@/services/notification';
import { SettingsHeader } from '@/components/ui/settings-header';
import { ScrollPicker } from '@/components/ui/scroll-picker';
import { Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';

const padTwo = (n: number) => String(n).padStart(2, '0');

export default function NotificationTimeScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');

  const { notificationTime, setNotificationTime } = useSettingsStore();
  const [hour, minute] = notificationTime.split(':').map(Number);

  const [selectedHour, setSelectedHour] = useState(hour);
  const [selectedMinute, setSelectedMinute] = useState(minute);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleSave = async () => {
    const timeStr = `${padTwo(selectedHour)}:${padTwo(selectedMinute)}`;
    setNotificationTime(timeStr);
    await notificationService.scheduleDailyNotification(selectedHour, selectedMinute);
    router.back();
  };

  const period = selectedHour < 12 ? '오전' : '오후';
  const displayHour = selectedHour === 0 ? 12 : selectedHour > 12 ? selectedHour - 12 : selectedHour;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <SettingsHeader title="알림 시간" />

      <View style={styles.content}>
        <View style={[styles.timeDisplay, { backgroundColor: surfaceColor }, Shadows.sm]}>
          <Text style={[styles.timeText, { color: textColor }]}>
            {period} {displayHour}시 {padTwo(selectedMinute)}분
          </Text>
        </View>

        <View style={styles.pickerContainer}>
          <ScrollPicker
            data={hours}
            selected={selectedHour}
            onSelect={setSelectedHour}
            label="시"
            formatter={padTwo}
            maxHeight={300}
          />
          <ScrollPicker
            data={minutes}
            selected={selectedMinute}
            onSelect={setSelectedMinute}
            label="분"
            formatter={padTwo}
            maxHeight={300}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.9}
          style={[styles.saveButton, { backgroundColor: tintColor }]}
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
