import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
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

export default function NameEditScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { user } = useUserStore();
  const updateUserMutation = useUpdateUser();
  const [name, setName] = useState(user?.name || '');

  const originalName = user?.name || '';
  const trimmedName = name.trim();
  const hasChanged = trimmedName !== originalName && trimmedName.length > 0;

  const handleSave = () => {
    if (!hasChanged) return;
    updateUserMutation.mutate(
      {
        name: trimmedName,
        birthDate: user?.birthDate || undefined,
        gender: user?.gender || undefined,
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
      <SettingsHeader title="이름 수정" />

      <View style={styles.content}>
        <TextInput
          style={[
            styles.input,
            { color: textColor, backgroundColor: surfaceColor, borderColor: tintColor },
            Shadows.sm,
          ]}
          value={name}
          onChangeText={setName}
          placeholder="이름을 입력해주세요"
          placeholderTextColor={textSecondary}
          autoFocus
          maxLength={20}
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />
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
  input: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
});
