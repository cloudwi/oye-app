import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';

const MBTI_TYPES = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
] as const;

interface MbtiFormProps {
  value: string | null;
  onChange: (mbti: string | null) => void;
}

export function MbtiForm({ value, onChange }: MbtiFormProps) {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');

  const handleSelect = (mbti: string) => {
    onChange(value === mbti ? null : mbti);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View>
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
          const isSelected = value === mbti;
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
  );
}

const styles = StyleSheet.create({
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
});
