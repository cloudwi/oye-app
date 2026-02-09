import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BrandColors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingWelcome() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');

  const handleNext = () => {
    router.push('/(onboarding)/birthdate');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* Logo/Icon Area */}
        <View style={styles.logoArea}>
          <LinearGradient
            colors={[BrandColors.primary, BrandColors.secondary]}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoText}>OYE</Text>
          </LinearGradient>
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={[styles.title, { color: textColor }]}>오늘의 예감</Text>
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            매일 아침, 당신만을 위한{'\n'}특별한 예감을 만나보세요
          </Text>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleNext} activeOpacity={0.9}>
          <LinearGradient
            colors={[BrandColors.primary, BrandColors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>시작하기</Text>
          </LinearGradient>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoArea: {
    marginBottom: Spacing.xxl,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 2,
  },
  textContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    textAlign: 'center',
    lineHeight: 26,
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
});
