import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

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
  ...props
}: InputProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({ light: '#F5F5F5', dark: '#2A2A2A' }, 'background');
  const borderColor = useThemeColor({ light: '#E0E0E0', dark: '#444' }, 'icon');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#666' }, 'icon');

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor,
            borderColor: error ? '#FF6B6B' : borderColor,
            color: textColor,
          },
          style,
        ]}
        placeholderTextColor={placeholderColor}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  error: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
});
