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
import { router } from 'expo-router';
import { showAlert } from '@/utils/alert';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  RelationConfig,
} from '@/constants/theme';
import { getUserFriendlyError } from '@/services/api/client';
import { userApi } from '@/services/api/user';

type InputMode = 'nickname' | 'code';

const Wrapper = Platform.OS === 'web' ? View : KeyboardAvoidingView;
const wrapperProps = Platform.OS === 'ios' ? { behavior: 'padding' as const } : {};

export default function ConnectScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const inputBg = useThemeColor({}, 'inputBackground');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const surfaceColor = useThemeColor({}, 'surface');

  const { contentStyle } = useResponsiveLayout();

  const [mode, setMode] = useState<InputMode>('nickname');
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'checking' | 'found' | 'not_found'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const connect = useConnect();

  const isValid = mode === 'nickname'
    ? nickname.length >= 2 && nicknameStatus === 'found'
    : code.trim().length === 6;

  // Debounced nickname check
  useEffect(() => {
    if (mode !== 'nickname' || nickname.length < 2) {
      setNicknameStatus('idle');
      return;
    }

    setNicknameStatus('checking');
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await userApi.checkNickname(nickname);
        // available=true means no one has it → not found
        // available=false means someone has it → found
        setNicknameStatus(result.available ? 'not_found' : 'found');
      } catch {
        setNicknameStatus('idle');
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [nickname, mode]);

  const handleSubmit = useCallback(() => {
    if (!isValid || connect.isPending) return;

    Keyboard.dismiss();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const request = mode === 'nickname'
      ? { nickname: nickname.trim(), relationType: 'LOVER' as const }
      : { code: code.trim().toUpperCase(), relationType: 'LOVER' as const };

    connect.mutate(request, {
      onSuccess: () => {
        showAlert('완료', '연결되었습니다!');
        router.back();
      },
      onError: (error) => {
        const msg = getUserFriendlyError(error) || '연결에 실패했습니다.';
        showAlert('연결 실패', msg);
      },
    });
  }, [isValid, connect, mode, nickname, code]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'nickname' ? 'code' : 'nickname'));
    setNicknameStatus('idle');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Wrapper style={styles.flex} {...wrapperProps}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconSymbol name="chevron.left" size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>연인 연결하기</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.formContent, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Mode Toggle */}
          <Animated.View entering={FadeInDown.duration(400).delay(50)}>
            <View style={[styles.modeToggle, { backgroundColor: surfaceColor }]}>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'nickname' && { backgroundColor }]}
                onPress={() => setMode('nickname')}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeTabText, { color: mode === 'nickname' ? tintColor : textSecondary }]}>
                  닉네임
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'code' && { backgroundColor }]}
                onPress={() => setMode('code')}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeTabText, { color: mode === 'code' ? tintColor : textSecondary }]}>
                  초대 코드
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Nickname Input */}
          {mode === 'nickname' && (
            <Animated.View style={styles.field} entering={FadeInDown.duration(400).delay(100)}>
              <Text style={[styles.label, { color: textSecondary }]}>상대방의 닉네임</Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg }]}>
                <IconSymbol name="magnifyingglass" size={16} color={placeholderColor} />
                <TextInput
                  style={[styles.textInput, { color: textColor }]}
                  placeholder="닉네임 검색"
                  placeholderTextColor={placeholderColor}
                  value={nickname}
                  onChangeText={setNickname}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
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
          )}

          {/* Code Input */}
          {mode === 'code' && (
            <Animated.View style={styles.field} entering={FadeInDown.duration(400).delay(100)}>
              <Text style={[styles.label, { color: textSecondary }]}>상대방의 초대 코드</Text>
              <TextInput
                style={[styles.codeInput, { backgroundColor: inputBg, color: textColor }]}
                placeholder="6자리 코드 입력"
                placeholderTextColor={placeholderColor}
                value={code}
                onChangeText={(text) => {
                  setCode(text.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6));
                }}
                maxLength={6}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="done"
              />
            </Animated.View>
          )}

          {/* Relation Info */}
          <Animated.View style={styles.field} entering={FadeInDown.duration(400).delay(200)}>
            <View style={[styles.relationInfo, { backgroundColor: surfaceColor }]}>
              <View style={[styles.relationDot, { backgroundColor: RelationConfig.LOVER.color }]} />
              <Text style={[styles.relationLabel, { color: textColor }]}>
                연인 궁합으로 연결됩니다
              </Text>
            </View>
            <Text style={[styles.hint, { color: textSecondary }]}>
              친구, 가족, 동료와 궁합을 보려면 그룹을 이용해주세요.
            </Text>
            <TouchableOpacity
              onPress={() => {
                router.back();
                setTimeout(() => router.push('/group/create'), 300);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.groupLink, { color: tintColor }]}>
                그룹 만들기 →
              </Text>
            </TouchableOpacity>
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
                연결하기
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  formContent: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },

  // Mode Toggle
  modeToggle: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    borderRadius: BorderRadius.sm + 2,
  },
  modeTabText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
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
  codeInput: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 6,
    textAlign: 'center',
  },

  // Relation Info
  relationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  relationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  relationLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  hint: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    marginLeft: Spacing.xs,
  },
  groupLink: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginLeft: Spacing.xs,
    marginTop: Spacing.xs,
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
