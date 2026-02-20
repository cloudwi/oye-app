import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors, Gradients, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import type { CalendarType } from '@/types/user';

export default function OnboardingCalendarType() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { setCalendarType } = useUserStore();
  const [selectedType, setSelectedType] = useState<CalendarType | null>(null);

  const buttonOpacity = useSharedValue(0.4);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    if (selectedType) {
      buttonOpacity.value = withTiming(1, { duration: 300 });
      buttonScale.value = withSpring(1.02, {}, () => {
        buttonScale.value = withSpring(1);
      });
    } else {
      buttonOpacity.value = withTiming(0.4, { duration: 200 });
    }
  }, [selectedType]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const handleSelectType = (type: CalendarType) => {
    setSelectedType(type);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNext = () => {
    if (selectedType) {
      setCalendarType(selectedType);
    }
    router.push('/(onboarding)/notification');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/notification');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="뒤로 가기">
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Content */}
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
              selectedType === 'SOLAR' && styles.optionCardActive,
            ]}
            onPress={() => handleSelectType('SOLAR')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`양력, 일반 달력 기준${selectedType === 'SOLAR' ? ', 선택됨' : ''}`}
          >
            <IconSymbol name="sun.max.fill" size={48} color={selectedType === 'SOLAR' ? BrandColors.primary : textSecondary} />
            <Text
              style={[
                styles.optionText,
                { color: textColor },
                selectedType === 'SOLAR' && styles.optionTextActive,
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
              selectedType === 'LUNAR' && styles.optionCardActive,
            ]}
            onPress={() => handleSelectType('LUNAR')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`음력, 음력 달력 기준${selectedType === 'LUNAR' ? ', 선택됨' : ''}`}
          >
            <IconSymbol name="moon.fill" size={48} color={selectedType === 'LUNAR' ? BrandColors.primary : textSecondary} />
            <Text
              style={[
                styles.optionText,
                { color: textColor },
                selectedType === 'LUNAR' && styles.optionTextActive,
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

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.9}
          disabled={!selectedType}
          accessibilityRole="button"
          accessibilityLabel="다음"
        >
          <Animated.View style={animatedButtonStyle}>
            <LinearGradient
              colors={Gradients.accent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>다음</Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>

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
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  optionCardActive: {
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.primary + '10',
  },
  optionText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  optionTextActive: {
    color: BrandColors.primary,
  },
  optionDescription: {
    fontSize: FontSizes.sm,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  button: {
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  skipText: {
    fontSize: FontSizes.md,
  },
});
