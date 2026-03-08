import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { parseLottoQR } from '@/utils/lotto-qr-parser';
import { Spacing, BorderRadius, FontSizes } from '@/constants/theme';

export default function QRScanScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scanned) return;
      setScanned(true);

      const parsed = parseLottoQR(data);
      if (!parsed) {
        Alert.alert('인식 실패', '유효한 로또 QR 코드가 아닙니다.', [
          { text: '다시 스캔', onPress: () => setScanned(false) },
          { text: '닫기', onPress: () => router.back() },
        ]);
        return;
      }

      router.replace({
        pathname: '/lotto/register-confirm',
        params: {
          round: String(parsed.round),
          numberSets: JSON.stringify(parsed.numberSets),
          source: 'QR_SCAN',
        },
      });
    },
    [scanned],
  );

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.center}>
          <Text style={[styles.message, { color: textColor }]}>카메라 권한을 확인하고 있습니다...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <IconSymbol name="chevron.left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>QR 스캔</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Text style={[styles.message, { color: textColor }]}>
            로또 QR 코드를 스캔하려면{'\n'}카메라 권한이 필요합니다.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: tintColor }]}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>카메라 권한 허용</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#fff' }]}>QR 스캔</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.guideText}>로또 용지의 QR 코드를 스캔하세요</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const SCAN_SIZE = 250;
const CORNER_SIZE = 24;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  message: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  guideText: {
    color: '#fff',
    fontSize: FontSizes.sm,
    marginTop: Spacing.xl,
    textAlign: 'center',
  },
});
