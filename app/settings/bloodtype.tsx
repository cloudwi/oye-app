import React, { useState } from 'react';
import {
  View,
  StyleSheet,
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
import { BloodTypeForm } from '@/components/forms/BloodTypeForm';
import { Spacing } from '@/constants/theme';
import { buildUpdatePayload } from '@/utils/user';
import type { BloodType } from '@/types/user';

export default function BloodTypeEditScreen() {
  const backgroundColor = useThemeColor({}, 'background');

  const { user } = useUserStore();
  const updateUserMutation = useUpdateUser();
  const [selected, setSelected] = useState<BloodType | null>(user?.bloodType || null);

  const original = user?.bloodType || null;
  const hasChanged = selected !== original;

  const handleSave = () => {
    if (!hasChanged) return;
    updateUserMutation.mutate(
      buildUpdatePayload(user, { bloodType: selected || undefined }),
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
        <BloodTypeForm value={selected} onChange={setSelected} />
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
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
});
