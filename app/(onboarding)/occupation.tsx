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
import { useUserStore } from '@/stores/user-store';
import { BackHeader } from '@/components/ui/back-header';
import { GradientButton } from '@/components/ui/gradient-button';
import { OccupationForm } from '@/components/forms/OccupationForm';
import { BrandColors, Spacing, FontSizes } from '@/constants/theme';

export default function OnboardingOccupation() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({}, 'textSecondary');

  const { updateUser } = useUserStore();
  const [occupation, setOccupation] = useState('');

  const trimmed = occupation.trim();

  const handleNext = () => {
    if (trimmed) {
      updateUser({ occupation: trimmed });
    }
    router.push('/(onboarding)/mbti');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/mbti');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <BackHeader />

      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>직업</Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          맞춤 예감을 위해 알려주세요
        </Text>

        <OccupationForm
          value={occupation}
          onChangeText={setOccupation}
          onSubmitEditing={handleNext}
          activeBorderColor={BrandColors.primary}
          inputStyle={{ fontSize: FontSizes.lg }}
        />
      </View>

      <View style={styles.footer}>
        <GradientButton
          label="다음"
          onPress={handleNext}
          isEnabled={!!trimmed}
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
