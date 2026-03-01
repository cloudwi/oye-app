import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

interface WebContainerProps {
  children: React.ReactNode;
}

/**
 * Constrains content width on wide screens (tablet, foldable, web).
 * On phones (< 600px), renders children directly without wrapper.
 */
export function WebContainer({ children }: WebContainerProps) {
  const { width } = useWindowDimensions();

  if (width < 600) {
    return <>{children}</>;
  }

  return (
    <View style={styles.outer}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
  },
});
