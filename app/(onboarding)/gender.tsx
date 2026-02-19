import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
import type { Gender } from '@/types/user';

export default function OnboardingGender() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { setGender } = useUserStore();
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);

  const buttonOpacity = useSharedValue(0.4);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    if (selectedGender) {
      buttonOpacity.value = withTiming(1, { duration: 300 });
      buttonScale.value = withSpring(1.02, {}, () => {
        buttonScale.value = withSpring(1);
      });
    } else {
      buttonOpacity.value = withTiming(0.4, { duration: 200 });
    }
  }, [selectedGender]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const handleSelectGender = (gender: Gender) => {
    setSelectedGender(gender);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNext = () => {
    if (selectedGender) {
      setGender(selectedGender);
    }
    router.push('/(onboarding)/birthdate');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/birthdate');
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
              selectedGender === 'MALE' && styles.optionCardActive,
            ]}
            onPress={() => handleSelectGender('MALE')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`남성${selectedGender === 'MALE' ? ', 선택됨' : ''}`}
          >
            <IconSymbol name="figure.stand" size={48} color={selectedGender === 'MALE' ? BrandColors.primary : textSecondary} />
            <Text
              style={[
                styles.optionText,
                { color: textColor },
                selectedGender === 'MALE' && styles.optionTextActive,
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
              selectedGender === 'FEMALE' && styles.optionCardActive,
            ]}
            onPress={() => handleSelectGender('FEMALE')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`여성${selectedGender === 'FEMALE' ? ', 선택됨' : ''}`}
          >
            <IconSymbol name="figure.stand.dress" size={48} color={selectedGender === 'FEMALE' ? BrandColors.primary : textSecondary} />
            <Text
              style={[
                styles.optionText,
                { color: textColor },
                selectedGender === 'FEMALE' && styles.optionTextActive,
              ]}
            >
              여성
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.9}
          disabled={!selectedGender}
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
