import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LottoBall } from '@/components/lotto/lotto-ball';
import { useLottoRegister } from '@/hooks/queries/use-lotto-register';
import { Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { lottoStyles } from '@/components/lotto/styles';
import type { LottoSource } from '@/types/lotto';

export default function RegisterConfirmScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const cardBorderColor = useThemeColor({}, 'cardBorder');
  const tintColor = useThemeColor({}, 'tint');
  const { contentStyle } = useResponsiveLayout();

  const params = useLocalSearchParams<{ round: string; numberSets: string; source: string }>();
  const round = parseInt(params.round, 10);
  const numberSets: number[][] = useMemo(() => {
    try {
      return JSON.parse(params.numberSets);
    } catch {
      return [];
    }
  }, [params.numberSets]);
  const source = params.source as LottoSource;

  const { mutate: register, isPending } = useLottoRegister();

  const handleRegister = () => {
    register(
      { round, source, numberSets },
      {
        onSuccess: () => {
          Alert.alert('등록 완료', `${round}회차 번호가 등록되었습니다.`, [
            { text: '확인', onPress: () => router.dismissAll() },
          ]);
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message ?? '번호 등록에 실패했습니다.';
          Alert.alert('등록 실패', message);
        },
      },
    );
  };

  const sourceLabel = source === 'QR_SCAN' ? 'QR 스캔' : '수동 입력';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>등록 확인</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: tintColor + '10' }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textSecondary }]}>회차</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>{round}회</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textSecondary }]}>등록 방식</Text>
            <View style={[styles.sourceBadge, { backgroundColor: source === 'QR_SCAN' ? '#6366F1' : '#10B981' }]}>
              <Text style={styles.sourceBadgeText}>{sourceLabel}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textSecondary }]}>세트 수</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>{numberSets.length}세트</Text>
          </View>
        </View>

        {/* Number Sets */}
        <View style={[styles.card, { backgroundColor: surfaceColor, borderColor: cardBorderColor }]}>
          {numberSets.map((numbers, idx) => (
            <View key={idx} style={lottoStyles.numberSetRow}>
              <Text style={[lottoStyles.setLabelBase, { color: textSecondary }]}>
                {String.fromCharCode(65 + idx)}
              </Text>
              <View style={lottoStyles.ballRow}>
                {numbers.map((num, i) => (
                  <LottoBall key={i} number={num} size={32} />
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.registerButton, { backgroundColor: tintColor, opacity: isPending ? 0.6 : 1 }]}
          onPress={handleRegister}
          disabled={isPending}
          activeOpacity={0.8}
        >
          <Text style={styles.registerButtonText}>
            {isPending ? '등록 중...' : '등록하기'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  infoCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: FontSizes.sm,
  },
  infoValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sourceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  registerButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
});
