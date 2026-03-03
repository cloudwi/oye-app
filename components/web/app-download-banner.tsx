import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking, Platform } from 'react-native';
import { Spacing, BorderRadius, Accent, Gray } from '@/constants/theme';

const IOS_STORE = 'https://apps.apple.com/app/id6759439435';
const ANDROID_STORE = 'https://play.google.com/store/apps/details?id=com.oyeapp.fortune';
const STORE_URL = IOS_STORE; // primary link for QR code
const DISMISS_KEY = 'oye-app-banner-dismissed';

function isMobileWeb(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Mobile web: floating bottom banner → "앱에서 열기"
 * Desktop web: floating bottom-right card → QR code + store links
 */
export function AppDownloadBanner() {
  const [dismissed, setDismissed] = useState(true); // hidden by default until checked

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      const val = localStorage.getItem(DISMISS_KEY);
      if (!val) {
        setDismissed(false);
      } else {
        // Re-show after 7 days
        const ts = parseInt(val, 10);
        if (Date.now() - ts > 7 * 24 * 60 * 60 * 1000) {
          setDismissed(false);
        }
      }
    } catch {
      setDismissed(false);
    }
  }, []);

  if (Platform.OS !== 'web' || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
  };

  const handleOpenStore = () => {
    const url = isIOS() ? IOS_STORE : ANDROID_STORE;
    Linking.openURL(url);
  };

  if (isMobileWeb()) {
    return (
      <View style={mobileStyles.container}>
        <View style={mobileStyles.content}>
          <View style={mobileStyles.iconWrap}>
            <Text style={mobileStyles.icon}>✨</Text>
          </View>
          <View style={mobileStyles.textWrap}>
            <Text style={mobileStyles.title}>오늘의 예감</Text>
            <Text style={mobileStyles.subtitle}>앱에서 더 편하게 이용하세요</Text>
          </View>
          <TouchableOpacity style={mobileStyles.button} onPress={handleOpenStore} activeOpacity={0.8}>
            <Text style={mobileStyles.buttonText}>앱 열기</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDismiss} style={mobileStyles.closeBtn}>
            <Text style={mobileStyles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Desktop web
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(IOS_STORE)}&color=5248A3&bgcolor=FFFFFF`;

  return (
    <View style={desktopStyles.container}>
      <TouchableOpacity onPress={handleDismiss} style={desktopStyles.closeBtn}>
        <Text style={desktopStyles.closeText}>✕</Text>
      </TouchableOpacity>
      <Text style={desktopStyles.title}>📱 앱으로 이용하기</Text>
      <Text style={desktopStyles.subtitle}>QR코드를 스캔하여{'\n'}앱을 설치해보세요</Text>
      <Image source={{ uri: qrUrl }} style={desktopStyles.qrImage} />
      <TouchableOpacity onPress={() => Linking.openURL(IOS_STORE)} activeOpacity={0.7}>
        <Text style={desktopStyles.storeLink}>App Store에서 다운로드</Text>
      </TouchableOpacity>
    </View>
  );
}

const mobileStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    padding: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 1,
    borderTopColor: Gray[200],
    // @ts-ignore - web shadow
    boxShadow: '0 -2px 12px rgba(0,0,0,0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Accent[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Gray[800],
  },
  subtitle: {
    fontSize: 12,
    color: Gray[500],
    marginTop: 1,
  },
  button: {
    backgroundColor: Accent[400],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    color: Gray[400],
  },
});

const desktopStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 999,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    width: 220,
    // @ts-ignore - web shadow
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
    borderWidth: 1,
    borderColor: Gray[200],
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    color: Gray[400],
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Gray[800],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: Gray[500],
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  qrImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  storeLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  storeLink: {
    fontSize: 12,
    fontWeight: '600',
    color: Accent[400],
  },
  divider: {
    fontSize: 12,
    color: Gray[300],
  },
});
