import React, { useRef, useEffect, useCallback } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BrandColors, BorderRadius, Spacing, FontSizes } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  value,
  onChangeText,
  ...props
}: InputProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');
  const placeholderColor = useThemeColor({}, 'icon');

  const inputRef = useRef<TextInput>(null);
  const lastValue = useRef(value);

  useEffect(() => {
    if (value !== undefined && value !== lastValue.current) {
      inputRef.current?.setNativeProps({ text: value });
      lastValue.current = value;
    }
  }, [value]);

  const handleChangeText = useCallback((text: string) => {
    lastValue.current = text;
    onChangeText?.(text);
  }, [onChangeText]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            backgroundColor,
            borderColor: error ? BrandColors.error : borderColor,
            color: textColor,
          },
          style,
        ]}
        defaultValue={value}
        onChangeText={handleChangeText}
        placeholderTextColor={placeholderColor}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.md,
  },
  error: {
    color: BrandColors.error,
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
});
