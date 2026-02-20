import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { useButtonAnimation } from '@/hooks/use-button-animation';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  isEnabled?: boolean;
}

export function GradientButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  isEnabled = true,
}: GradientButtonProps) {
  const animatedStyle = useButtonAnimation(isEnabled);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      disabled={disabled || !isEnabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View style={animatedStyle}>
        <LinearGradient
          colors={Gradients.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>{label}</Text>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
});
