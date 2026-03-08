import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useConnect } from '@/hooks/queries/use-connect';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SettingsHeader } from '@/components/ui/settings-header';
import { router } from 'expo-router';
import { showAlert } from '@/utils/alert';
import {
  Spacing,
  BorderRadius,
  FontSizes,
} from '@/constants/theme';
import { getUserFriendlyError } from '@/services/api/client';
import { userApi } from '@/services/api/user';

const Wrapper = Platform.OS === 'web' ? View : KeyboardAvoidingView;
const wrapperProps = Platform.OS === 'ios' ? { behavior: 'padding' as const } : {};

export default function ConnectScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const inputBg = useThemeColor({}, 'inputBackground');
  const placeholderColor = useThemeColor({}, 'placeholder');

  const { contentStyle } = useResponsiveLayout();

  const [nickname, setNickname] = useState('');
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'checking' | 'found' | 'not_found'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const connect = useConnect();

  const isValid = nickname.length >= 2 && nicknameStatus === 'found';

  useEffect(() => {
    if (nickname.length < 2) {
      setNicknameStatus('idle');
      return;
    }

    setNicknameStatus('checking');
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await userApi.checkNickname(nickname);
        setNicknameStatus(result.available ? 'not_found' : 'found');
      } catch {
        setNicknameStatus('idle');
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [nickname]);

  const handleSubmit = useCallback(() => {
    if (!isValid || connect.isPending) return;

    Keyboard.dismiss();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    connect.mutate(
      { nickname: nickname.trim(), relationType: 'FRIEND' },
      {
        onSuccess: () => {
          showAlert('완료', '친구가 추가되었습니다!');
          router.back();
        },
        onError: (error) => {
          const msg = getUserFriendlyError(error) || '친구 추가에 실패했습니다.';
          showAlert('추가 실패', msg);
        },
      },
    );
  }, [isValid, connect, nickname]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Wrapper style={styles.flex} {...wrapperProps}>
        <SettingsHeader title="친구 추가" />

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.formContent, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Nickname Input */}
          <Animated.View style={styles.field} entering={FadeInDown.duration(400).delay(50)}>
            <Text style={[styles.label, { color: textSecondary }]}>닉네임으로 검색</Text>
            <View style={[styles.inputWrapper, { backgroundColor: inputBg }]}>
              <IconSymbol name="magnifyingglass" size={16} color={placeholderColor} />
              <TextInput
                style={[styles.textInput, { color: textColor }]}
                placeholder="상대방의 닉네임 입력"
                placeholderTextColor={placeholderColor}
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                autoFocus
              />
              {nicknameStatus === 'checking' && (
                <ActivityIndicator size="small" color={tintColor} />
              )}
              {nicknameStatus === 'found' && (
                <IconSymbol name="checkmark.circle.fill" size={18} color="#10B981" />
              )}
              {nicknameStatus === 'not_found' && nickname.length >= 2 && (
                <IconSymbol name="xmark.circle.fill" size={18} color="#EF4444" />
              )}
            </View>
            {nicknameStatus === 'found' && (
              <Text style={[styles.statusText, { color: '#10B981' }]}>
                사용자를 찾았습니다
              </Text>
            )}
            {nicknameStatus === 'not_found' && nickname.length >= 2 && (
              <Text style={[styles.statusText, { color: '#EF4444' }]}>
                해당 닉네임의 사용자가 없습니다
              </Text>
            )}
          </Animated.View>

        </ScrollView>

        {/* Submit Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: isValid ? tintColor : 'transparent',
                borderWidth: isValid ? 0 : 1.5,
                borderColor: isValid ? 'transparent' : textSecondary + '40',
              },
            ]}
            onPress={handleSubmit}
            disabled={!isValid || connect.isPending}
            activeOpacity={0.7}
          >
            {connect.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.submitButtonText,
                  !isValid && { color: textSecondary + '80' },
                ]}
              >
                추가하기
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Wrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  formContent: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },

  // Fields
  field: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: FontSizes.md,
    paddingVertical: 0,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    marginLeft: Spacing.xs,
  },

  // Bottom
  bottomContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  submitButton: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
