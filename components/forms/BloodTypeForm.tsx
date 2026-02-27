import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import type { BloodType } from '@/types/user';

const BLOOD_TYPES: BloodType[] = ['A', 'B', 'O', 'AB'];

interface BloodTypeFormProps {
  value: BloodType | null;
  onChange: (type: BloodType | null) => void;
  shadow?: typeof Shadows.sm;
}

export function BloodTypeForm({
  value,
  onChange,
  shadow = Shadows.sm,
}: BloodTypeFormProps) {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const handleSelect = (type: BloodType) => {
    onChange(value === type ? null : type);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.optionRow}>
      {BLOOD_TYPES.map((type) => {
        const isSelected = value === type;
        return (
          <TouchableOpacity
            key={type}
            style={[
              styles.optionButton,
              { backgroundColor: surfaceColor },
              shadow,
              isSelected && { borderColor: tintColor, backgroundColor: tintColor + '10' },
            ]}
            onPress={() => handleSelect(type)}
            activeOpacity={0.7}
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
  );
}

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  optionButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: Spacing.xs,
  },
  typeLabel: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  typeText: {
    fontSize: FontSizes.sm,
  },
});
