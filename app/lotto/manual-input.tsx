import React, { useState, useCallback, useRef, useMemo } from 'react';
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
import { Spacing, BorderRadius, FontSizes } from '@/constants/theme';

const MAX_SETS = 5;
const LOTTO_EPOCH = new Date(2002, 11, 7); // 2002-12-07

function getCurrentRound(): number {
  const now = new Date();
  const diff = now.getTime() - LOTTO_EPOCH.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
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

  const currentRound = useMemo(() => getCurrentRound(), []);
  const [sets, setSets] = useState<string[][]>([['', '', '', '', '', '']]);

  // refs for auto-focus: inputRefs[setIdx][numIdx]
  const inputRefs = useRef<(TextInput | null)[][]>([]);

  const ensureRefs = (setIdx: number) => {
    if (!inputRefs.current[setIdx]) {
      inputRefs.current[setIdx] = new Array(6).fill(null);
    }
  };

  const updateNumber = useCallback((setIdx: number, numIdx: number, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, 2);
    setSets((prev) => {
      const next = prev.map((s) => [...s]);
      next[setIdx][numIdx] = cleaned;
      return next;
    });
    // Auto-advance to next input when 2 digits entered
    if (cleaned.length === 2) {
      if (numIdx < 5) {
        inputRefs.current[setIdx]?.[numIdx + 1]?.focus();
      } else if (setIdx < sets.length - 1) {
        inputRefs.current[setIdx + 1]?.[0]?.focus();
      }
    }
  }, [sets.length]);

  const addSet = useCallback(() => {
    if (sets.length >= MAX_SETS) return;
    setSets((prev) => [...prev, ['', '', '', '', '', '']]);
  }, [sets.length]);

  const removeSet = useCallback((index: number) => {
    setSets((prev) => prev.filter((_, i) => i !== index));
    inputRefs.current.splice(index, 1);
  }, []);

  const getSetStatus = (nums: string[]): 'empty' | 'partial' | 'valid' | 'error' => {
    const filled = nums.filter((n) => n !== '');
    if (filled.length === 0) return 'empty';
    if (filled.length < 6) return 'partial';
    const parsed = nums.map((n) => parseInt(n, 10));
    if (parsed.some((n) => isNaN(n) || n < 1 || n > 45)) return 'error';
    if (new Set(parsed).size !== 6) return 'error';
    return 'valid';
  };

  const handleSubmit = useCallback(() => {
    const result: number[][] = [];
    for (let i = 0; i < sets.length; i++) {
      const nums = sets[i].map((n) => parseInt(n, 10));
      if (nums.some((n) => isNaN(n))) {
        Alert.alert('입력 오류', `세트 ${String.fromCharCode(65 + i)}에 빈 번호가 있습니다.`);
        return;
      }
      if (nums.some((n) => n < 1 || n > 45)) {
        Alert.alert('입력 오류', `세트 ${String.fromCharCode(65 + i)}에 1~45 범위를 벗어난 번호가 있습니다.`);
        return;
      }
      if (new Set(nums).size !== 6) {
        Alert.alert('입력 오류', `세트 ${String.fromCharCode(65 + i)}에 중복 번호가 있습니다.`);
        return;
      }
      result.push(nums.sort((a, b) => a - b));
    }

    router.push({
      pathname: '/lotto/register-confirm',
      params: {
        round: String(currentRound),
        numberSets: JSON.stringify(result),
        source: 'MANUAL',
      },
    });
  }, [sets, currentRound]);

  const allValid = sets.every((s) => getSetStatus(s) === 'valid');

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
          {/* Round Badge */}
          <View style={styles.roundRow}>
            <View style={[styles.roundBadge, { backgroundColor: tintColor + '15' }]}>
              <Text style={[styles.roundBadgeText, { color: tintColor }]}>{currentRound}회차</Text>
            </View>
          </View>

          {/* Number Sets */}
          {sets.map((set, setIdx) => {
            ensureRefs(setIdx);
            const status = getSetStatus(set);
            const parsedNums = status === 'valid'
              ? set.map((n) => parseInt(n, 10)).sort((a, b) => a - b)
              : null;

            return (
              <View
                key={setIdx}
                style={[styles.setCard, { backgroundColor: surfaceColor, borderColor: cardBorderColor }]}
              >
                <View style={styles.setHeader}>
                  <View style={styles.setLabelRow}>
                    <View style={[styles.setLabelBadge, { backgroundColor: tintColor + '20' }]}>
                      <Text style={[styles.setLabelText, { color: tintColor }]}>
                        {String.fromCharCode(65 + setIdx)}
                      </Text>
                    </View>
                    {status === 'valid' && (
                      <IconSymbol name="checkmark.circle.fill" size={16} color="#10B981" />
                    )}
                    {status === 'error' && (
                      <Text style={styles.errorHint}>중복 또는 범위 초과</Text>
                    )}
                  </View>
                  {sets.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeSet(setIdx)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <IconSymbol name="xmark.circle.fill" size={20} color={textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* 6 number inputs */}
                <View style={styles.numbersRow}>
                  {set.map((num, numIdx) => {
                    const parsed = parseInt(num, 10);
                    const isInvalid = num !== '' && (isNaN(parsed) || parsed < 1 || parsed > 45);
                    return (
                      <TextInput
                        key={numIdx}
                        ref={(ref) => {
                          if (inputRefs.current[setIdx]) {
                            inputRefs.current[setIdx][numIdx] = ref;
                          }
                        }}
                        style={[
                          styles.numberInput,
                          {
                            backgroundColor: inputBgColor,
                            color: textColor,
                          },
                          isInvalid && styles.numberInputError,
                          num !== '' && !isInvalid && styles.numberInputFilled,
                        ]}
                        value={num}
                        onChangeText={(v) => updateNumber(setIdx, numIdx, v)}
                        keyboardType="number-pad"
                        maxLength={2}
                        textAlign="center"
                        placeholder=""
                        placeholderTextColor={placeholderColor}
                        selectTextOnFocus
                      />
                    );
                  })}
                </View>

                {/* Ball preview when valid */}
                {parsedNums && (
                  <View style={styles.previewRow}>
                    {parsedNums.map((n, i) => (
                      <LottoBall key={i} number={n} size={30} />
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {/* Add Set */}
          {sets.length < MAX_SETS && (
            <TouchableOpacity
              style={[styles.addSetButton, { backgroundColor: surfaceColor, borderColor: cardBorderColor }]}
              onPress={addSet}
              activeOpacity={0.7}
            >
              <IconSymbol name="plus" size={16} color={tintColor} />
              <Text style={[styles.addSetText, { color: tintColor }]}>
                세트 추가 ({sets.length}/{MAX_SETS})
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Bottom fixed button */}
        <View style={[styles.bottomBar, { backgroundColor, borderTopColor: cardBorderColor }]}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: allValid ? tintColor : tintColor + '40' },
            ]}
            onPress={handleSubmit}
            disabled={!allValid}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {sets.length}세트 등록하기
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 100,
    gap: Spacing.sm,
  },
  roundRow: {
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  roundBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roundBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  setCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  setLabelBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setLabelText: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
  },
  errorHint: {
    fontSize: 10,
    color: '#E04848',
    fontWeight: '500',
  },
  numbersRow: {
    flexDirection: 'row',
    gap: 6,
  },
  numberInput: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 48,
    borderRadius: BorderRadius.sm,
    fontSize: FontSizes.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  numberInputError: {
    borderWidth: 1.5,
    borderColor: '#E04848',
  },
  numberInputFilled: {
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 2,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md - 2,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  addSetText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
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
