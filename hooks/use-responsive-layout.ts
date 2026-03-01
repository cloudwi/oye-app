import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';
import type { ViewStyle } from 'react-native';

/**
 * Responsive layout hook for phone / foldable / tablet support.
 *
 * Breakpoints:
 *   < 600  → phone (default, no constraints)
 *   600–767 → foldable (Galaxy Z Fold unfolded ~585-717px inner)
 *   ≥ 768  → tablet (iPad, Galaxy Tab, etc.)
 */

const CONTENT_MAX_WIDTH = 500;
const FOLDABLE_THRESHOLD = 600;
const TABLET_THRESHOLD = 768;

export type DeviceClass = 'phone' | 'foldable' | 'tablet';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const deviceClass: DeviceClass =
      width >= TABLET_THRESHOLD ? 'tablet' :
      width >= FOLDABLE_THRESHOLD ? 'foldable' :
      'phone';

    const isPhone = deviceClass === 'phone';
    const isWideScreen = !isPhone;

    // Content container style — constrains width on large screens
    const contentStyle: ViewStyle = isWideScreen
      ? { maxWidth: CONTENT_MAX_WIDTH, width: '100%', alignSelf: 'center' }
      : {};

    return {
      screenWidth: width,
      screenHeight: height,
      deviceClass,
      isPhone,
      isWideScreen,
      contentMaxWidth: isWideScreen ? CONTENT_MAX_WIDTH : undefined,
      /** Merge into ScrollView contentContainerStyle or FlatList contentContainerStyle */
      contentStyle,
    };
  }, [width, height]);
}
