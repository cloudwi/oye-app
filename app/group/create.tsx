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
import { useCreateGroup } from '@/hooks/queries/use-create-group';
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
import type { RelationType } from '@/types/connection';

const Wrapper = Platform.OS === 'web' ? View : KeyboardAvoidingView;
const wrapperProps = Platform.OS === 'ios' ? { behavior: 'padding' as const } : {};

const GROUP_RELATION_OPTIONS = (
  Object.entries(RelationConfig) as [RelationType, typeof RelationConfig[keyof typeof RelationConfig]][]
)
  .filter(([type]) => type !== 'LOVER')
  .map(([type, config]) => ({ type, ...config }));

export default function CreateGroupScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const inputBg = useThemeColor({}, 'inputBackground');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const surfaceColor = useThemeColor({}, 'surface');

  const { contentStyle } = useResponsiveLayout();

  const [name, setName] = useState('');
  const [relationType, setRelationType] = useState<RelationType | null>(null);
  const createGroup = useCreateGroup();

  const isValid = name.trim().length >= 2 && name.trim().length <= 20 && relationType !== null;

  const handleSubmit = () => {
    if (!isValid || createGroup.isPending || !relationType) return;

    Keyboard.dismiss();

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    createGroup.mutate(
      { name: name.trim(), relationType },
      {
        onSuccess: () => {
          showAlert('완료', '그룹이 생성되었습니다!');
          router.back();
        },
        onError: (error) => {
          const msg = getUserFriendlyError(error) || '그룹 생성에 실패했습니다.';
          showAlert('생성 실패', msg);
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
          <Text style={[styles.headerTitle, { color: textColor }]}>그룹 만들기</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.formContent, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Group Name Input */}
          <Animated.View style={styles.field} entering={FadeInDown.duration(400).delay(100)}>
            <Text style={[styles.label, { color: textSecondary }]}>그룹 이름</Text>
            <TextInput
              style={[styles.nameInput, { backgroundColor: inputBg, color: textColor }]}
              placeholder="2~20자 그룹 이름"
              placeholderTextColor={placeholderColor}
              value={name}
              onChangeText={(text) => setName(text.slice(0, 20))}
              maxLength={20}
              autoCorrect={false}
              returnKeyType="done"
            />
            <Text style={[styles.charCount, { color: textSecondary }]}>
              {name.length}/20
            </Text>
          </Animated.View>

          {/* Relation Type Selection */}
          <Animated.View style={styles.field} entering={FadeInDown.duration(400).delay(200)}>
            <Text style={[styles.label, { color: textSecondary }]}>관계 유형</Text>
            <View style={styles.relationGrid}>
              {GROUP_RELATION_OPTIONS.map((option) => {
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

          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <Text style={[styles.hint, { color: textSecondary }]}>
              그룹을 만들면 초대 코드가 자동으로 생성됩니다.{'\n'}
              초대 코드를 공유해서 친구, 가족, 동료를 초대해보세요.
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
            disabled={!isValid || createGroup.isPending}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="그룹 만들기"
          >
            {createGroup.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.submitButtonText,
                  !isValid && { color: textSecondary + '80' },
                ]}
              >
                만들기
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
  nameInput: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  charCount: {
    fontSize: FontSizes.xs,
    textAlign: 'right',
    marginRight: Spacing.xs,
  },
  hint: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    marginLeft: Spacing.xs,
  },
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
