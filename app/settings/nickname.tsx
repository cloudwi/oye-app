import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSetNickname } from '@/hooks/queries/use-nickname';
import { useUserStore } from '@/stores/user-store';
import { userApi } from '@/services/api/user';
import { showAlert } from '@/utils/alert';
import { Spacing, BorderRadius, FontSizes } from '@/constants/theme';

export default function NicknameScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const cardBorderColor = useThemeColor({}, 'cardBorder');
  const tintColor = useThemeColor({}, 'tint');
  const inputBgColor = useThemeColor({}, 'inputBackground');
  const placeholderColor = useThemeColor({}, 'placeholder');

  const currentNickname = useUserStore((s) => s.user?.nickname);
  const [input, setInput] = useState(currentNickname ?? '');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { mutate: save, isPending } = useSetNickname();

  const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9_]{2,20}$/;

  useEffect(() => {
    if (!input || input === currentNickname) {
      setStatus('idle');
      return;
    }
    if (!NICKNAME_REGEX.test(input)) {
      setStatus('invalid');
      return;
    }

    setStatus('checking');
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await userApi.checkNickname(input);
        setStatus(result.available ? 'available' : 'taken');
      } catch {
        setStatus('idle');
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, currentNickname]);

  const canSave = input.length >= 2 && (status === 'available' || input === currentNickname);

  const handleSave = () => {
    if (!canSave || isPending) return;
    save(input.trim(), {
      onSuccess: () => {
        showAlert('완료', '닉네임이 설정되었습니다.');
        router.back();
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message ?? '닉네임 설정에 실패했습니다.';
        showAlert('오류', msg);
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>닉네임 설정</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: surfaceColor, borderColor: cardBorderColor }]}>
          <Text style={[styles.label, { color: textSecondary }]}>닉네임</Text>
          <View style={[styles.inputRow, { backgroundColor: inputBgColor }]}>
            <TextInput
              style={[styles.input, { color: textColor }]}
              value={input}
              onChangeText={setInput}
              placeholder="2~20자 한글, 영문, 숫자, 밑줄"
              placeholderTextColor={placeholderColor}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            {status === 'checking' && <ActivityIndicator size="small" color={tintColor} />}
            {status === 'available' && <IconSymbol name="checkmark.circle.fill" size={18} color="#10B981" />}
            {status === 'taken' && <IconSymbol name="xmark.circle.fill" size={18} color="#EF4444" />}
          </View>
          {status === 'available' && (
            <Text style={[styles.hint, { color: '#10B981' }]}>사용 가능한 닉네임입니다</Text>
          )}
          {status === 'taken' && (
            <Text style={[styles.hint, { color: '#EF4444' }]}>이미 사용 중인 닉네임입니다</Text>
          )}
          {status === 'invalid' && (
            <Text style={[styles.hint, { color: '#EF4444' }]}>2~20자의 한글, 영문, 숫자, 밑줄만 가능합니다</Text>
          )}
        </View>

        <Text style={[styles.description, { color: textSecondary }]}>
          닉네임을 설정하면 초대 코드 대신 닉네임으로 상대방과 연결할 수 있습니다.
        </Text>
      </View>

      <View style={[styles.bottomBar, { borderTopColor: cardBorderColor }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: canSave ? tintColor : tintColor + '40' }]}
          onPress={handleSave}
          disabled={!canSave || isPending}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {isPending ? '저장 중...' : '저장'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: Spacing.md },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, gap: Spacing.sm },
  label: { fontSize: FontSizes.sm, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
  },
  input: { flex: 1, fontSize: FontSizes.md, paddingVertical: 0 },
  hint: { fontSize: FontSizes.xs, fontWeight: '500', marginLeft: Spacing.xs },
  description: { fontSize: FontSizes.sm, lineHeight: 20, paddingHorizontal: Spacing.xs },
  bottomBar: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth },
  saveButton: { paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: FontSizes.md, fontWeight: '700' },
});
