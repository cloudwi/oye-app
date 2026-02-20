import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

/**
 * Shared button animation hook used across onboarding and settings screens.
 * Animates opacity and scale based on whether the button is enabled.
 */
export function useButtonAnimation(isEnabled: boolean) {
  const buttonOpacity = useSharedValue(isEnabled ? 1 : 0.4);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    if (isEnabled) {
      buttonOpacity.value = withTiming(1, { duration: 300 });
      buttonScale.value = withSpring(1.02, {}, () => {
        buttonScale.value = withSpring(1);
      });
    } else {
      buttonOpacity.value = withTiming(0.4, { duration: 200 });
    }
  }, [isEnabled]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  return animatedButtonStyle;
}
