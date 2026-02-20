import React, { useState, useRef } from 'react';
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
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SettingsHeader } from '@/components/ui/settings-header';
import { SaveButton } from '@/components/ui/save-button';
import { Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import type { Gender } from '@/types/user';

export default function GenderEditScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { user } = useUserStore();
  const updateUserMutation = useUpdateUser();
  const [selectedGender, setSelectedGender] = useState<Gender | null>(user?.gender || null);

  const originalGender = user?.gender || null;
  const hasChanged = selectedGender !== originalGender;

  const lastTapRef = useRef(0);

  const handleSelectGender = (gender: Gender) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) return;
    lastTapRef.current = now;
    setSelectedGender(selectedGender === gender ? null : gender);
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
        gender: selectedGender || undefined,
        calendarType: user?.calendarType || undefined,
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
      <SettingsHeader title="성별 수정" />

      <View style={styles.content}>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              { backgroundColor: surfaceColor },
              Shadows.sm,
              selectedGender === 'MALE' && { borderColor: tintColor, backgroundColor: tintColor + '10' },
            ]}
            onPress={() => handleSelectGender('MALE')}
            activeOpacity={0.7}
          >
            <IconSymbol name="figure.stand" size={28} color={selectedGender === 'MALE' ? tintColor : textSecondary} />
            <Text
              style={[
                styles.optionText,
                { color: textColor },
                selectedGender === 'MALE' && { color: tintColor },
              ]}
            >
              남성
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              { backgroundColor: surfaceColor },
              Shadows.sm,
              selectedGender === 'FEMALE' && { borderColor: tintColor, backgroundColor: tintColor + '10' },
            ]}
            onPress={() => handleSelectGender('FEMALE')}
            activeOpacity={0.7}
          >
            <IconSymbol name="figure.stand.dress" size={28} color={selectedGender === 'FEMALE' ? tintColor : textSecondary} />
            <Text
              style={[
                styles.optionText,
                { color: textColor },
                selectedGender === 'FEMALE' && { color: tintColor },
              ]}
            >
              여성
            </Text>
          </TouchableOpacity>
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
    gap: Spacing.sm,
  },
  optionText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
});
