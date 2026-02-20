import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
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
import { Gradients, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';

export default function NameEditScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { user, updateUser } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const originalName = user?.name || '';
  const trimmedName = name.trim();
  const hasChanged = trimmedName !== originalName && trimmedName.length > 0;

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

  const handleSave = async () => {
    if (!hasChanged) return;
    setIsSaving(true);
    updateUser({ name: trimmedName });

    try {
      await userApi.updateMe({
        name: trimmedName,
        birthDate: user?.birthDate || undefined,
        gender: user?.gender || undefined,
        calendarType: user?.calendarType || undefined,
      });
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error updating name:', error);
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
        <Text style={[styles.headerTitle, { color: textColor }]}>이름 수정</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <TextInput
          style={[
            styles.input,
            { color: textColor, backgroundColor: surfaceColor, borderColor: tintColor },
            Shadows.sm,
          ]}
          value={name}
          onChangeText={setName}
          placeholder="이름을 입력해주세요"
          placeholderTextColor={textSecondary}
          autoFocus
          maxLength={20}
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />
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
  input: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
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
