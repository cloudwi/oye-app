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
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BackHeader } from '@/components/ui/back-header';
import { GradientButton } from '@/components/ui/gradient-button';
import { Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import type { Gender } from '@/types/user';

export default function OnboardingGender() {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { updateUser } = useUserStore();
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);

  const lastTapRef = useRef(0);

  const handleSelectGender = (gender: Gender) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) return;
    lastTapRef.current = now;
    setSelectedGender(gender);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNext = () => {
    if (selectedGender) {
      updateUser({ gender: selectedGender });
    }
    router.push('/(onboarding)/birthdate');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/birthdate');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <BackHeader />

      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>성별</Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          더 정확한 예감을 위해 알려주세요
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              { backgroundColor: surfaceColor },
              Shadows.md,
              selectedGender === 'MALE' && { borderColor: tintColor, backgroundColor: tintColor + '10' },
            ]}
            onPress={() => handleSelectGender('MALE')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`남성${selectedGender === 'MALE' ? ', 선택됨' : ''}`}
          >
            <IconSymbol name="figure.stand" size={48} color={selectedGender === 'MALE' ? tintColor : textSecondary} />
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
              styles.optionCard,
              { backgroundColor: surfaceColor },
              Shadows.md,
              selectedGender === 'FEMALE' && { borderColor: tintColor, backgroundColor: tintColor + '10' },
            ]}
            onPress={() => handleSelectGender('FEMALE')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`여성${selectedGender === 'FEMALE' ? ', 선택됨' : ''}`}
          >
            <IconSymbol name="figure.stand.dress" size={48} color={selectedGender === 'FEMALE' ? tintColor : textSecondary} />
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
        <GradientButton
          label="다음"
          onPress={handleNext}
          isEnabled={!!selectedGender}
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
    paddingVertical: Spacing.xl + Spacing.sm,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
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
