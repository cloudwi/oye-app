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
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BackHeader } from '@/components/ui/back-header';
import { GradientButton } from '@/components/ui/gradient-button';
import { Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import type { CalendarType } from '@/types/user';

export default function OnboardingCalendarType() {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { updateUser } = useUserStore();
  const [selectedType, setSelectedType] = useState<CalendarType | null>(null);

  const handleSelectType = (type: CalendarType) => {
    setSelectedType(type);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNext = () => {
    if (selectedType) {
      updateUser({ calendarType: selectedType });
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
        <Text style={[styles.title, { color: textColor }]}>달력 유형</Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          생년월일이 양력인지 음력인지 알려주세요
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              { backgroundColor: surfaceColor },
              Shadows.md,
              selectedType === 'SOLAR' && { borderColor: tintColor, backgroundColor: tintColor + '10' },
            ]}
            onPress={() => handleSelectType('SOLAR')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`양력, 일반 달력 기준${selectedType === 'SOLAR' ? ', 선택됨' : ''}`}
          >
            <IconSymbol name="sun.max.fill" size={48} color={selectedType === 'SOLAR' ? tintColor : textSecondary} />
            <Text
              style={[
                styles.optionText,
                { color: textColor },
                selectedType === 'SOLAR' && { color: tintColor },
              ]}
            >
              양력
            </Text>
            <Text style={[styles.optionDescription, { color: textSecondary }]}>
              일반 달력 기준
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              { backgroundColor: surfaceColor },
              Shadows.md,
              selectedType === 'LUNAR' && { borderColor: tintColor, backgroundColor: tintColor + '10' },
            ]}
            onPress={() => handleSelectType('LUNAR')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`음력, 음력 달력 기준${selectedType === 'LUNAR' ? ', 선택됨' : ''}`}
          >
            <IconSymbol name="moon.fill" size={48} color={selectedType === 'LUNAR' ? tintColor : textSecondary} />
            <Text
              style={[
                styles.optionText,
                { color: textColor },
                selectedType === 'LUNAR' && { color: tintColor },
              ]}
            >
              음력
            </Text>
            <Text style={[styles.optionDescription, { color: textSecondary }]}>
              음력 달력 기준
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <GradientButton
          label="다음"
          onPress={handleNext}
          isEnabled={!!selectedType}
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
    gap: Spacing.sm,
  },
  optionText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  optionDescription: {
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
