import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
import { Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import type { BloodType } from '@/types/user';

const BLOOD_TYPES: BloodType[] = ['A', 'B', 'O', 'AB'];

export default function BloodTypeEditScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { user } = useUserStore();
  const updateUserMutation = useUpdateUser();
  const [selected, setSelected] = useState<BloodType | null>(user?.bloodType || null);

  const original = user?.bloodType || null;
  const hasChanged = selected !== original;

  const handleSelect = (type: BloodType) => {
    setSelected(selected === type ? null : type);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = () => {
    if (!hasChanged) return;
    updateUserMutation.mutate(
      {
        name: user?.name || '사용자',
        birthDate: user?.birthDate || undefined,
        birthTime: user?.birthTime || undefined,
        gender: user?.gender || undefined,
        calendarType: user?.calendarType || undefined,
        occupation: user?.occupation || undefined,
        mbti: user?.mbti || undefined,
        bloodType: selected || undefined,
        interests: user?.interests || undefined,
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
      <SettingsHeader title="혈액형 수정" />

      <View style={styles.content}>
        <View style={styles.optionRow}>
          {BLOOD_TYPES.map((type) => {
            const isSelected = selected === type;
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  { backgroundColor: surfaceColor },
                  Shadows.sm,
                  isSelected && { borderColor: tintColor, backgroundColor: tintColor + '10' },
                ]}
                onPress={() => handleSelect(type)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.typeLabel,
                    { color: textColor },
                    isSelected && { color: tintColor },
                  ]}
                >
                  {type}
                </Text>
                <Text style={[styles.typeText, { color: textSecondary }]}>형</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
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
    gap: Spacing.xs,
  },
  typeLabel: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  typeText: {
    fontSize: FontSizes.sm,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
});
