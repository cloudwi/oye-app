import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
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
import { useConnect } from '@/hooks/queries/use-connect';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  RelationConfig,
} from '@/constants/theme';
import type { RelationType } from '@/types/connection';
import { getUserFriendlyError } from '@/services/api/client';

const Wrapper = Platform.OS === 'web' ? View : KeyboardAvoidingView;
const wrapperProps = Platform.OS === 'ios' ? { behavior: 'padding' as const } : {};

const RELATION_OPTIONS = (Object.entries(RelationConfig) as [RelationType, typeof RelationConfig[keyof typeof RelationConfig]][]).map(
  ([type, config]) => ({ type, ...config })
);

export default function ConnectScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const inputBg = useThemeColor({}, 'inputBackground');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const surfaceColor = useThemeColor({}, 'surface');

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [relationType, setRelationType] = useState<RelationType | null>(null);
  const connect = useConnect();

  const isValid = code.trim().length === 6 && relationType !== null && !codeError;

  const handleSubmit = () => {
    if (!isValid || connect.isPending || !relationType) return;

    Keyboard.dismiss();

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    connect.mutate(
      { code: code.trim().toUpperCase(), relationType },
      {
        onSuccess: () => {
          if (Platform.OS === 'web') {
            window.alert('연결되었습니다!');
          } else {
            Alert.alert('완료', '연결되었습니다!');
          }
          router.back();
        },
        onError: (error) => {
          const msg = getUserFriendlyError(error) || '연결에 실패했습니다. 코드를 다시 확인해주세요.';
          if (Platform.OS === 'web') {
            window.alert(msg);
          } else {
            Alert.alert('연결 실패', msg);
          }
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
          >
            <IconSymbol name="chevron.left" size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>연결하기</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Code Input */}
          <Animated.View style={styles.field} entering={FadeInDown.duration(400).delay(100)}>
            <Text style={[styles.label, { color: textSecondary }]}>상대방의 초대 코드</Text>
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

          {/* Relation Type Selection */}
          <Animated.View style={styles.field} entering={FadeInDown.duration(400).delay(200)}>
            <Text style={[styles.label, { color: textSecondary }]}>관계 유형</Text>
            <View style={styles.relationGrid}>
              {RELATION_OPTIONS.map((option) => {
                const isSelected = relationType === option.type;
                return (
                  <TouchableOpacity
                    key={option.type}
                    style={[
                      styles.relationOption,
                      { backgroundColor: surfaceColor },
                      isSelected && { backgroundColor: option.color + '15', borderColor: option.color, borderWidth: 2 },
                      !isSelected && { borderWidth: 2, borderColor: 'transparent' },
                    ]}
                    onPress={() => {
                      setRelationType(option.type);
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`${option.label} 선택${isSelected ? ', 선택됨' : ''}`}
                  >
                    <Text
                      style={[
                        styles.relationLabel,
                        { color: isSelected ? option.color : textColor },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
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
            accessibilityRole="button"
            accessibilityLabel="연결하기"
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

  // Relation Grid
  relationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  relationOption: {
    width: '48%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  relationLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
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
