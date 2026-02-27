import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import type { Gender } from '@/types/user';

interface GenderFormProps {
  value: Gender | null;
  onChange: (gender: Gender | null) => void;
  /** If true, tapping the selected gender deselects it */
  allowDeselect?: boolean;
  iconSize?: number;
  shadow?: typeof Shadows.sm;
}

export function GenderForm({
  value,
  onChange,
  allowDeselect = false,
  iconSize = 28,
  shadow = Shadows.sm,
}: GenderFormProps) {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const lastTapRef = useRef(0);

  const handleSelect = (gender: Gender) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) return;
    lastTapRef.current = now;
    if (allowDeselect && value === gender) {
      onChange(null);
    } else {
      onChange(gender);
    }
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const options: Array<{ gender: Gender; icon: 'figure.stand' | 'figure.stand.dress'; label: string }> = [
    { gender: 'MALE', icon: 'figure.stand', label: '남성' },
    { gender: 'FEMALE', icon: 'figure.stand.dress', label: '여성' },
  ];

  return (
    <View style={styles.optionRow}>
      {options.map(({ gender, icon, label }) => {
        const isSelected = value === gender;
        return (
          <TouchableOpacity
            key={gender}
            style={[
              styles.optionButton,
              { backgroundColor: surfaceColor },
              shadow,
              isSelected && { borderColor: tintColor, backgroundColor: tintColor + '10' },
            ]}
            onPress={() => handleSelect(gender)}
            activeOpacity={0.7}
          >
            <IconSymbol name={icon} size={iconSize} color={isSelected ? tintColor : textSecondary} />
            <Text style={[styles.optionText, { color: textColor }, isSelected && { color: tintColor }]}>
              {label}
            </Text>
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
    gap: Spacing.sm,
  },
  optionText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
