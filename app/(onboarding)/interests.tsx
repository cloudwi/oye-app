import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { BackHeader } from '@/components/ui/back-header';
import { GradientButton } from '@/components/ui/gradient-button';
import { BrandColors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';

export default function OnboardingInterests() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const { updateUser } = useUserStore();
  const [interests, setInterests] = useState('');

  const trimmed = interests.trim();

  const handleNext = () => {
    if (trimmed) {
      updateUser({ interests: trimmed });
    }
    router.push('/(onboarding)/notification');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/notification');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <BackHeader />

      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>관심사</Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          관심사나 취미를 알려주세요
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              color: textColor,
              backgroundColor: surfaceColor,
              borderColor: trimmed ? BrandColors.primary : 'transparent',
            },
          ]}
          value={interests}
          onChangeText={setInterests}
          placeholder="예: 독서, 요리, 운동, 여행"
          placeholderTextColor={textSecondary}
          autoFocus
          maxLength={100}
          returnKeyType="done"
          onSubmitEditing={handleNext}
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
  input: {
    fontSize: FontSizes.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
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
