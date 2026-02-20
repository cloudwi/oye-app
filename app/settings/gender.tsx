import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { userApi } from '@/services/api/user';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors, Gradients, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import type { Gender } from '@/types/user';

export default function GenderEditScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { user, setGender } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(user?.gender || null);

  const originalGender = user?.gender || null;
  const hasChanged = selectedGender !== originalGender;

  const buttonOpacity = useSharedValue(hasChanged ? 1 : 0.4);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    if (hasChanged) {
      buttonOpacity.value = withTiming(1, { duration: 300 });
      buttonScale.value = withSpring(1.02, {}, () => {
        buttonScale.value = withSpring(1);
      });
    } else {
      buttonOpacity.value = withTiming(0.4, { duration: 200 });
    }
  }, [hasChanged]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const handleSelectGender = (gender: Gender) => {
    setSelectedGender(selectedGender === gender ? null : gender);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = async () => {
    if (!hasChanged) return;
    setIsSaving(true);
    setGender(selectedGender!);

    try {
      await userApi.updateMe({
        name: user?.name || '사용자',
        birthDate: user?.birthDate || undefined,
        gender: selectedGender || undefined,
        calendarType: user?.calendarType || undefined,
      });
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error updating gender:', error);
    }
    setIsSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>성별 수정</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              { backgroundColor: surfaceColor },
              Shadows.sm,
              selectedGender === 'MALE' && styles.optionButtonActive,
            ]}
            onPress={() => handleSelectGender('MALE')}
            activeOpacity={0.7}
          >
            <IconSymbol name="figure.stand" size={28} color={selectedGender === 'MALE' ? BrandColors.primary : textSecondary} />
            <Text
              style={[
                styles.optionText,
                { color: textColor },
                selectedGender === 'MALE' && styles.optionTextActive,
              ]}
            >
              남성
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              { backgroundColor: surfaceColor },
              Shadows.sm,
              selectedGender === 'FEMALE' && styles.optionButtonActive,
            ]}
            onPress={() => handleSelectGender('FEMALE')}
            activeOpacity={0.7}
          >
            <IconSymbol name="figure.stand.dress" size={28} color={selectedGender === 'FEMALE' ? BrandColors.primary : textSecondary} />
            <Text
              style={[
                styles.optionText,
                { color: textColor },
                selectedGender === 'FEMALE' && styles.optionTextActive,
              ]}
            >
              여성
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.footer}>
        <Animated.View style={animatedButtonStyle}>
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.9}
            disabled={isSaving || !hasChanged}
          >
            <LinearGradient
              colors={hasChanged ? Gradients.accent : ['#9CA3AF', '#9CA3AF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>저장</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  optionButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: Spacing.sm,
  },
  optionButtonActive: {
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.primary + '10',
  },
  optionText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  optionTextActive: {
    color: BrandColors.primary,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
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
