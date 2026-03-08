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

export default function CreateGroupScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const inputBg = useThemeColor({}, 'inputBackground');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');

  const { contentStyle } = useResponsiveLayout();

  const [name, setName] = useState('');
  const createGroup = useCreateGroup();

  const isValid = name.trim().length >= 2 && name.trim().length <= 20;

  const handleSubmit = () => {
    if (!isValid || createGroup.isPending) return;

    Keyboard.dismiss();

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    createGroup.mutate(
      { name: name.trim(), relationType: 'FRIEND' as const },
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
        <ScreenHeader title="그룹 만들기" />

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

          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <Text style={[styles.hint, { color: textSecondary }]}>
              그룹을 만들면 초대 코드가 자동으로 생성됩니다.{'\n'}
              초대 코드를 공유해서 친구를 초대해보세요.
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
