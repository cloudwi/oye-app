import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BorderRadius } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const primaryColor = useThemeColor({}, 'tint');
  const disabledBg = useThemeColor({ light: '#D1D5DB', dark: '#374151' }, 'surfaceSecondary');
  const disabledText = useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'textMuted');

  const buttonStyle = useMemo((): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...sizeStyles[size],
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyle, backgroundColor: disabled ? disabledBg : primaryColor };
      case 'secondary':
        return { ...baseStyle, backgroundColor: disabled ? disabledBg : '#FF6B6B' };
      case 'outline':
        return { ...baseStyle, backgroundColor: 'transparent', borderWidth: 2, borderColor: disabled ? disabledBg : primaryColor };
      case 'ghost':
        return { ...baseStyle, backgroundColor: 'transparent' };
      default:
        return baseStyle;
    }
  }, [variant, size, disabled, disabledBg, primaryColor]);

  const computedTextStyle = useMemo((): TextStyle => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return { color: '#fff' };
      case 'outline':
      case 'ghost':
        return { color: disabled ? disabledText : primaryColor };
      default:
        return { color: '#fff' };
    }
  }, [variant, disabled, disabledText, primaryColor]);

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : primaryColor} />
      ) : (
        <Text style={[styles.text, sizeTextStyles[size], computedTextStyle, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  text: {
    fontWeight: '600',
  },
});

const sizeStyles: Record<string, ViewStyle> = {
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
};

const sizeTextStyles: Record<string, TextStyle> = {
  small: {
    fontSize: 14,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 18,
  },
};
