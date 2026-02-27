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
import { InterestsForm } from '@/components/forms/InterestsForm';
import { Spacing, Shadows } from '@/constants/theme';
import { buildUpdatePayload } from '@/utils/user';

export default function InterestsEditScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  const { user } = useUserStore();
  const updateUserMutation = useUpdateUser();
  const [interests, setInterests] = useState(user?.interests || '');

  const original = user?.interests || '';
  const trimmed = interests.trim();
  const hasChanged = trimmed !== original;

  const handleSave = () => {
    if (!hasChanged) return;
    updateUserMutation.mutate(
      buildUpdatePayload(user, { interests: trimmed || undefined }),
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
      <SettingsHeader title="관심사 수정" />

      <View style={styles.content}>
        <InterestsForm
          value={interests}
          onChangeText={setInterests}
          onSubmitEditing={handleSave}
          inputStyle={[{ borderColor: tintColor }, Shadows.sm]}
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
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
});
