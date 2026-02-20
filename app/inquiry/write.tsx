import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCreateInquiry } from '@/hooks/queries/use-create-inquiry';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import {
  Spacing,
  BorderRadius,
  FontSizes,
} from '@/constants/theme';

const Wrapper = Platform.OS === 'web' ? View : KeyboardAvoidingView;
const wrapperProps = Platform.OS === 'ios' ? { behavior: 'padding' as const } : {};

export default function InquiryWriteScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const inputBg = useThemeColor({ light: '#F3F4F6', dark: '#161632' }, 'inputBackground');
  const placeholderColor = useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'placeholder');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const createInquiry = useCreateInquiry();

  const isValid = title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid || createInquiry.isPending) return;

    createInquiry.mutate(
      { title: title.trim(), content: content.trim() },
      {
        onSuccess: () => {
          if (Platform.OS === 'web') {
            window.alert('문의가 등록되었습니다.');
          } else {
            Alert.alert('완료', '문의가 등록되었습니다.');
          }
          router.back();
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>문의 작성</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.field}>
            <Text style={[styles.label, { color: textSecondary }]}>제목</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBg, color: textColor },
              ]}
              placeholder="문의 제목을 입력해 주세요"
              placeholderTextColor={placeholderColor}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              returnKeyType="next"
            />
            <Text style={[styles.charCount, { color: textSecondary }]}>
              {title.length}/100
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: textSecondary }]}>내용</Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: inputBg, color: textColor },
              ]}
              placeholder="문의 내용을 입력해 주세요"
              placeholderTextColor={placeholderColor}
              value={content}
              onChangeText={setContent}
              maxLength={2000}
              multiline
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: textSecondary }]}>
              {content.length}/2000
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: isValid ? tintColor : tintColor + '40' },
            ]}
            onPress={handleSubmit}
            disabled={!isValid || createInquiry.isPending}
            activeOpacity={0.7}
          >
            {createInquiry.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>등록하기</Text>
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
  title: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  formContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  field: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  input: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
  },
  textArea: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    minHeight: 200,
  },
  charCount: {
    fontSize: FontSizes.xs,
    textAlign: 'right',
    marginRight: Spacing.xs,
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
