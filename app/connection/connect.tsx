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
} from '@/constants/theme';
import type { RelationType } from '@/types/connection';

const Wrapper = Platform.OS === 'web' ? View : KeyboardAvoidingView;
const wrapperProps = Platform.OS === 'ios' ? { behavior: 'padding' as const } : {};

const RELATION_OPTIONS: { type: RelationType; label: string; emoji: string; color: string }[] = [
  { type: 'LOVER', label: '연인', emoji: '💕', color: '#EC4899' },
  { type: 'FRIEND', label: '친구', emoji: '👫', color: '#3B82F6' },
  { type: 'FAMILY', label: '가족', emoji: '👨‍👩‍👧', color: '#10B981' },
  { type: 'COLLEAGUE', label: '직장동료', emoji: '💼', color: '#F59E0B' },
];

export default function ConnectScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const inputBg = useThemeColor({ light: '#F3F4F6', dark: '#161632' }, 'inputBackground');
  const placeholderColor = useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'placeholder');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const [code, setCode] = useState('');
  const [relationType, setRelationType] = useState<RelationType | null>(null);
  const connect = useConnect();

  const isValid = code.trim().length === 6 && relationType !== null;

  const handleSubmit = () => {
    if (!isValid || connect.isPending || !relationType) return;

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
              ]}
              placeholder="6자리 코드 입력"
              placeholderTextColor={placeholderColor}
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase().slice(0, 6))}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
            />
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
                    <Text style={styles.relationEmoji}>{option.emoji}</Text>
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
              { backgroundColor: isValid ? tintColor : tintColor + '40' },
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
              <Text style={styles.submitButtonText}>연결하기</Text>
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
  relationEmoji: {
    fontSize: 24,
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
