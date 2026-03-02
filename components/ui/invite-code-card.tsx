import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius, FontSizes, Shadows, Gradients } from '@/constants/theme';

interface InviteCodeCardProps {
  code: string;
  label: string;
  shareTitle: string;
  shareMessage: string;
  animationDelay?: number;
}

export function InviteCodeCard({
  code,
  label,
  shareTitle,
  shareMessage,
  animationDelay = 100,
}: InviteCodeCardProps) {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleShare = useCallback(async () => {
    if (!code) return;
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ title: shareTitle, text: shareMessage });
        } else {
          await navigator.clipboard.writeText(shareMessage);
        }
      } else {
        const { Share } = require('react-native');
        await Share.share({ message: shareMessage, title: shareTitle });
      }
    } catch {
      // User cancelled
    }
  }, [code, shareTitle, shareMessage]);

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(animationDelay)}
      style={[styles.codeCard, { backgroundColor: surfaceColor }, Shadows.lg]}
    >
      <View style={styles.codeCardHeader}>
        <View style={[styles.codeIconBg, { backgroundColor: tintColor + '15' }]}>
          <IconSymbol name="link" size={18} color={tintColor} />
        </View>
        <Text style={[styles.codeLabel, { color: textSecondary }]}>{label}</Text>
      </View>

      <Text
        style={[styles.codeText, { color: textColor }]}
        accessibilityLabel={`${label}: ${code || ''}`}
      >
        {code || '------'}
      </Text>

      <View style={styles.codeActions}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={handleCopy}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="초대 코드 복사"
        >
          <LinearGradient
            colors={Gradients.accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.codeButton}
          >
            <IconSymbol name="doc.on.doc" size={16} color="#FFF" />
            <Text style={styles.codeButtonText}>{copied ? '복사됨!' : '복사'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.codeButton, styles.shareCodeButton, { borderColor: tintColor }]}
          onPress={handleShare}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="초대 코드 공유"
        >
          <IconSymbol name="square.and.arrow.up" size={16} color={tintColor} />
          <Text style={[styles.codeButtonText, { color: tintColor }]}>공유</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  codeCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  codeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  codeIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  codeText: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  codeActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  codeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  shareCodeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  codeButtonText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
