import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
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

const MBTI_TYPES = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
] as const;

export default function MbtiEditScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');

  const { user } = useUserStore();
  const updateUserMutation = useUpdateUser();
  const [selected, setSelected] = useState<string | null>(user?.mbti || null);

  const original = user?.mbti || null;
  const hasChanged = selected !== original;

  const handleSelect = (mbti: string) => {
    setSelected(selected === mbti ? null : mbti);
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
        mbti: selected || undefined,
        bloodType: user?.bloodType || undefined,
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
      <SettingsHeader title="MBTI 수정" />

      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://www.16personalities.com/ko/%EB%AC%B4%EB%A3%8C-%EC%84%B1%EA%B2%A9-%EC%9C%A0%ED%98%95-%EA%B2%80%EC%82%AC')}
          style={styles.testLink}
          activeOpacity={0.7}
        >
          <Text style={[styles.testLinkText, { color: tintColor }]}>
            MBTI를 모르시나요? 무료 검사 받기
          </Text>
        </TouchableOpacity>

        <View style={styles.grid}>
          {MBTI_TYPES.map((mbti) => {
            const isSelected = selected === mbti;
            return (
              <TouchableOpacity
                key={mbti}
                style={[
                  styles.mbtiChip,
                  { backgroundColor: surfaceColor },
                  Shadows.sm,
                  isSelected && { borderColor: tintColor, backgroundColor: tintColor + '10' },
                ]}
                onPress={() => handleSelect(mbti)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.mbtiText,
                    { color: textColor },
                    isSelected && { color: tintColor },
                  ]}
                >
                  {mbti}
                </Text>
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
    paddingTop: Spacing.lg,
  },
  testLink: {
    marginBottom: Spacing.lg,
  },
  testLinkText: {
    fontSize: FontSizes.sm,
    textDecorationLine: 'underline',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  mbtiChip: {
    width: '23%',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mbtiText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
});
