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
import { BackHeader } from '@/components/ui/back-header';
import { GradientButton } from '@/components/ui/gradient-button';
import { Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import type { BloodType } from '@/types/user';

const BLOOD_TYPES: BloodType[] = ['A', 'B', 'O', 'AB'];

export default function OnboardingBloodType() {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { updateUser } = useUserStore();
  const [selected, setSelected] = useState<BloodType | null>(null);

  const handleSelect = (type: BloodType) => {
    setSelected(selected === type ? null : type);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNext = () => {
    if (selected) {
      updateUser({ bloodType: selected });
    }
    router.push('/(onboarding)/interests');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/interests');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <BackHeader />

      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>혈액형</Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          혈액형을 알려주세요
        </Text>

        <View style={styles.optionsContainer}>
          {BLOOD_TYPES.map((type) => {
            const isSelected = selected === type;
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionCard,
                  { backgroundColor: surfaceColor },
                  Shadows.md,
                  isSelected && { borderColor: tintColor, backgroundColor: tintColor + '10' },
                ]}
                onPress={() => handleSelect(type)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${type}형${isSelected ? ', 선택됨' : ''}`}
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
        <GradientButton
          label="다음"
          onPress={handleNext}
          isEnabled={!!selected}
        />

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="건너뛰기">
          <Text style={[styles.skipText, { color: textSecondary }]}>건너뛰기</Text>
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
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.xxl,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  optionCard: {
    flex: 1,
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: Spacing.xs,
  },
  typeLabel: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  typeText: {
    fontSize: FontSizes.sm,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  skipText: {
    fontSize: FontSizes.md,
  },
});
