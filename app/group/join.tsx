import React, { useState } from 'react';
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
import { useJoinGroup } from '@/hooks/queries/use-join-group';
import { ScreenHeader } from '@/components/ui/screen-header';
import { router } from 'expo-router';
import { showAlert } from '@/utils/alert';
import {
  Spacing,
  BorderRadius,
  FontSizes,
} from '@/constants/theme';
import { getUserFriendlyError } from '@/services/api/client';

const Wrapper = Platform.OS === 'web' ? View : KeyboardAvoidingView;
const wrapperProps = Platform.OS === 'ios' ? { behavior: 'padding' as const } : {};

export default function JoinGroupScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const inputBg = useThemeColor({}, 'inputBackground');
  const placeholderColor = useThemeColor({}, 'placeholder');

  const { contentStyle } = useResponsiveLayout();

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const joinGroup = useJoinGroup();

  const isValid = code.trim().length === 6 && !codeError;

  const handleSubmit = () => {
    if (!isValid || joinGroup.isPending) return;

    Keyboard.dismiss();

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    joinGroup.mutate(
      { code: code.trim().toUpperCase() },
      {
        onSuccess: () => {
          showAlert('완료', '그룹에 참여했습니다!');
          router.back();
        },
        onError: (error) => {
          const msg = getUserFriendlyError(error) || '그룹 참여에 실패했습니다. 코드를 다시 확인해주세요.';
          showAlert('참여 실패', msg);
        },
      }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Wrapper
        style={styles.flex}
        {...wrapperProps}
      >
        <ScreenHeader title="그룹 참여" />

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.formContent, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Code Input */}
          <Animated.View style={styles.field} entering={FadeInDown.duration(400).delay(100)}>
            <Text style={[styles.label, { color: textSecondary }]}>그룹 초대 코드</Text>
            <TextInput
              style={[
                styles.codeInput,
                { backgroundColor: inputBg, color: textColor },
                codeError && { borderColor: '#EF4444', borderWidth: 2 },
              ]}
              placeholder="6자리 코드 입력"
              placeholderTextColor={placeholderColor}
              value={code}
              onChangeText={(text) => {
                const filtered = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
                setCode(filtered);
                if (text !== filtered) {
                  setCodeError('영문 대문자와 숫자만 입력 가능합니다');
                } else {
                  setCodeError('');
                }
              }}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
            />
            {codeError ? (
              <Text style={[styles.errorText, { color: '#EF4444' }]}>{codeError}</Text>
            ) : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <Text style={[styles.hint, { color: textSecondary }]}>
              그룹 관리자에게 받은 6자리 초대 코드를 입력해주세요.
            </Text>
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
            disabled={!isValid || joinGroup.isPending}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="그룹 참여하기"
          >
            {joinGroup.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.submitButtonText,
                  !isValid && { color: textSecondary + '80' },
                ]}
              >
                참여하기
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
  field: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  codeInput: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 6,
    textAlign: 'center',
  },
  errorText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginLeft: Spacing.xs,
  },
  hint: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    marginLeft: Spacing.xs,
  },
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
