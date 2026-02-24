import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BorderRadius, Spacing } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');

  const cardStyle = useMemo((): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.card,
      backgroundColor,
    };

    switch (variant) {
      case 'elevated':
        return { ...baseStyle, ...styles.elevated };
      case 'outlined':
        return { ...baseStyle, borderWidth: 1, borderColor };
      default:
        return baseStyle;
    }
  }, [variant, backgroundColor, borderColor]);

  return <View style={[cardStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
