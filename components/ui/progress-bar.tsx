import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients, BorderRadius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = useSharedValue(0);
  const trackColor = useThemeColor({}, 'surfaceSecondary');

  useEffect(() => {
    progress.value = withTiming(currentStep / totalSteps, {
      duration: 400,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [currentStep, totalSteps]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as `${number}%`,
  }));

  return (
    <View style={[styles.track, { backgroundColor: trackColor }]}>
      <AnimatedLinearGradient
        colors={Gradients.accent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, animatedStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginHorizontal: Spacing.lg,
  },
  fill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
