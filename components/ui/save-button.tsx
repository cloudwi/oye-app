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

interface SaveButtonProps {
  onPress: () => void;
  hasChanged: boolean;
  isPending?: boolean;
}

export function SaveButton({ onPress, hasChanged, isPending = false }: SaveButtonProps) {
  const animatedStyle = useButtonAnimation(hasChanged);

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        disabled={isPending || !hasChanged}
      >
        <LinearGradient
          colors={hasChanged ? Gradients.accent : ['#9CA3AF', '#9CA3AF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.saveButton}
        >
          {isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>저장</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  saveButton: {
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
});
