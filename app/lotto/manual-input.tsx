import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LottoBall } from '@/components/lotto/lotto-ball';
import { useLottoRegister } from '@/hooks/queries/use-lotto-register';
import { Spacing, BorderRadius, FontSizes } from '@/constants/theme';

const MAX_SETS = 5;

interface NumberSet {
  numbers: string[];
}

export default function ManualInputScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const cardBorderColor = useThemeColor({}, 'cardBorder');
  const tintColor = useThemeColor({}, 'tint');
  const inputBgColor = useThemeColor({}, 'inputBackground');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const { contentStyle } = useResponsiveLayout();
  const errorColor = '#E04848';

  const [roundInput, setRoundInput] = useState('');
  const [sets, setSets] = useState<NumberSet[]>([{ numbers: ['', '', '', '', '', ''] }]);

  const { mutate: register, isPending } = useLottoRegister();

  const updateNumber = useCallback((setIndex: number, numIndex: number, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, 2);
    setSets((prev) => {
      const next = [...prev];
      next[setIndex] = {
        numbers: [...next[setIndex].numbers],
      };
      next[setIndex].numbers[numIndex] = cleaned;
      return next;
    });
  }, []);

  const addSet = useCallback(() => {
    if (sets.length >= MAX_SETS) return;
    setSets((prev) => [...prev, { numbers: ['', '', '', '', '', ''] }]);
  }, [sets.length]);

  const removeSet = useCallback((index: number) => {
    setSets((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const validateAndGetNumbers = useCallback((): number[][] | null => {
    const round = parseInt(roundInput, 10);
    if (isNaN(round) || round <= 0) {
      Alert.alert('입력 오류', '유효한 회차를 입력해주세요.');
      return null;
    }

    const result: number[][] = [];
    for (let i = 0; i < sets.length; i++) {
      const nums = sets[i].numbers.map((n) => parseInt(n, 10));
      if (nums.some((n) => isNaN(n))) {
        Alert.alert('입력 오류', `세트 ${String.fromCharCode(65 + i)}에 빈 번호가 있습니다.`);
        return null;
      }
      if (nums.some((n) => n < 1 || n > 45)) {
        Alert.alert('입력 오류', `세트 ${String.fromCharCode(65 + i)}에 1~45 범위를 벗어난 번호가 있습니다.`);
        return null;
      }
      if (new Set(nums).size !== 6) {
        Alert.alert('입력 오류', `세트 ${String.fromCharCode(65 + i)}에 중복 번호가 있습니다.`);
        return null;
      }
      result.push(nums.sort((a, b) => a - b));
    }
    return result;
  }, [roundInput, sets]);

  const handleSubmit = useCallback(() => {
    const numberSets = validateAndGetNumbers();
    if (!numberSets) return;

    const round = parseInt(roundInput, 10);
    router.push({
      pathname: '/lotto/register-confirm',
      params: {
        round: String(round),
        numberSets: JSON.stringify(numberSets),
        source: 'MANUAL',
      },
    });
  }, [validateAndGetNumbers, roundInput]);

  const getNumberValidation = (value: string): boolean => {
    if (!value) return true;
    const n = parseInt(value, 10);
    return !isNaN(n) && n >= 1 && n <= 45;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>번호 등록</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Round Input */}
          <View style={[styles.card, { backgroundColor: surfaceColor, borderColor: cardBorderColor }]}>
            <Text style={[styles.label, { color: textColor }]}>회차</Text>
            <TextInput
              style={[styles.roundInput, { backgroundColor: inputBgColor, color: textColor }]}
              placeholder="예: 1130"
              placeholderTextColor={placeholderColor}
              value={roundInput}
              onChangeText={setRoundInput}
              keyboardType="number-pad"
            />
          </View>

          {/* Number Sets */}
          {sets.map((set, setIdx) => (
            <View
              key={setIdx}
              style={[styles.card, { backgroundColor: surfaceColor, borderColor: cardBorderColor }]}
            >
              <View style={styles.setHeader}>
                <Text style={[styles.label, { color: textColor }]}>
                  세트 {String.fromCharCode(65 + setIdx)}
                </Text>
                {sets.length > 1 && (
                  <TouchableOpacity onPress={() => removeSet(setIdx)}>
                    <IconSymbol name="xmark.circle.fill" size={20} color={textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.numbersRow}>
                {set.numbers.map((num, numIdx) => {
                  const isValid = getNumberValidation(num);
                  return (
                    <TextInput
                      key={numIdx}
                      style={[
                        styles.numberInput,
                        {
                          backgroundColor: inputBgColor,
                          color: textColor,
                          borderColor: !isValid ? errorColor : 'transparent',
                          borderWidth: !isValid ? 1 : 0,
                        },
                      ]}
                      value={num}
                      onChangeText={(v) => updateNumber(setIdx, numIdx, v)}
                      keyboardType="number-pad"
                      maxLength={2}
                      textAlign="center"
                      placeholder="-"
                      placeholderTextColor={placeholderColor}
                    />
                  );
                })}
              </View>
              {/* Preview */}
              {set.numbers.every((n) => n && getNumberValidation(n)) && (
                <View style={styles.previewRow}>
                  {set.numbers
                    .map((n) => parseInt(n, 10))
                    .filter((n) => !isNaN(n))
                    .sort((a, b) => a - b)
                    .map((n, i) => (
                      <LottoBall key={i} number={n} size={28} />
                    ))}
                </View>
              )}
            </View>
          ))}

          {/* Add Set Button */}
          {sets.length < MAX_SETS && (
            <TouchableOpacity
              style={[styles.addButton, { borderColor: cardBorderColor }]}
              onPress={addSet}
              activeOpacity={0.7}
            >
              <IconSymbol name="plus.circle.fill" size={20} color={tintColor} />
              <Text style={[styles.addButtonText, { color: tintColor }]}>세트 추가</Text>
            </TouchableOpacity>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: tintColor, opacity: isPending ? 0.6 : 1 }]}
            onPress={handleSubmit}
            disabled={isPending}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isPending ? '등록 중...' : '확인'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  roundInput: {
    height: 44,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.md,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  numbersRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  numberInput: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.sm,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    paddingTop: Spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
});
