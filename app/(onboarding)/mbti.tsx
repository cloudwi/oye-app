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
import { BackHeader } from '@/components/ui/back-header';
import { GradientButton } from '@/components/ui/gradient-button';
import { Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';

const MBTI_TYPES = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
] as const;

export default function OnboardingMbti() {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { updateUser } = useUserStore();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (mbti: string) => {
    setSelected(selected === mbti ? null : mbti);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNext = () => {
    if (selected) {
      updateUser({ mbti: selected });
    }
    router.push('/(onboarding)/bloodtype');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/bloodtype');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <BackHeader />

      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>MBTI</Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          성격 유형을 알려주세요
        </Text>

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
    marginBottom: Spacing.sm,
  },
  testLink: {
    marginBottom: Spacing.xl,
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
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  skipText: {
    fontSize: FontSizes.md,
  },
});
