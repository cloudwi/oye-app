import { View, StyleSheet, Linking } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, BorderRadius } from '@/constants/theme';

interface ForceUpdateModalProps {
  storeUrl: string | null;
  minVersion: string | null;
}

export function ForceUpdateModal({ storeUrl, minVersion }: ForceUpdateModalProps) {
  const backgroundColor = useThemeColor({}, 'background');

  const handleUpdate = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl);
    }
  };

  return (
    <View style={[styles.overlay, { backgroundColor }]}>
      <View style={styles.content}>
        <ThemedText style={styles.icon}>🔄</ThemedText>
        <ThemedText style={styles.title}>업데이트가 필요합니다</ThemedText>
        <ThemedText style={styles.description}>
          새로운 버전이 출시되었습니다.{'\n'}
          원활한 사용을 위해 최신 버전({minVersion})으로{'\n'}
          업데이트해 주세요.
        </ThemedText>
        <Button
          variant="primary"
          size="large"
          onPress={handleUpdate}
          style={styles.button}
        >
          업데이트하기
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
    opacity: 0.7,
  },
  button: {
    width: 240,
    borderRadius: BorderRadius.md,
  },
});
