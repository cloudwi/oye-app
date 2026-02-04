import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({ light: '#E5E5E5', dark: '#333' }, 'icon');

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.card,
      backgroundColor,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...styles.elevated,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor,
        };
      default:
        return baseStyle;
    }
  };

  return <View style={[getCardStyle(), style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
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
