import React from 'react';
import { View, TextInput, StyleSheet, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, BorderRadius, FontSizes } from '@/constants/theme';

interface NameFormProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  placeholder?: string;
  activeBorderColor?: string;
  inputStyle?: StyleProp<ViewStyle & TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export function NameForm({
  value,
  onChangeText,
  onSubmitEditing,
  placeholder = '이름을 입력해주세요',
  activeBorderColor,
  inputStyle,
  containerStyle,
}: NameFormProps) {
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const trimmed = value.trim();
  const borderColor = activeBorderColor
    ? (trimmed ? activeBorderColor : 'transparent')
    : undefined;

  return (
    <View style={containerStyle}>
      <TextInput
        style={[
          styles.input,
          { color: textColor, backgroundColor: surfaceColor },
          borderColor != null && { borderColor },
          inputStyle,
        ]}
        defaultValue={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={textSecondary}
        autoFocus
        maxLength={20}
        returnKeyType="done"
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
