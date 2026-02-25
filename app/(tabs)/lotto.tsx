import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LottoBall } from '@/components/lotto/lotto-ball';
import { useLottoRecommend } from '@/hooks/queries/use-lotto-recommend';
import { getUserFriendlyError } from '@/services/api/client';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '@/constants/theme';

export default function LottoScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');

  const recommend = useLottoRecommend();

  const handleGenerate = useCallback(() => {
    if (recommend.isPending) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    recommend.mutate(undefined, {
      onSuccess: () => {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      },
      onError: (error) => {
        const msg = getUserFriendlyError(error) || '번호 생성에 실패했습니다.';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('오류', msg);
        }
      },
    });
  }, [recommend]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Animated.View style={styles.header} entering={FadeIn.duration(300)}>
        <Text style={[styles.title, { color: textColor }]}>로또 번호 추천</Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          행운의 번호를 받아보세요
        </Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Generate Button */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerate}
            disabled={recommend.isPending}
            activeOpacity={0.8}
          >
            {recommend.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol name="dice.fill" size={22} color="#FFFFFF" />
                <Text style={styles.generateText}>번호 생성하기</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Latest Generated Numbers */}
        {recommend.data && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(200)}
            style={[styles.resultCard, Shadows.md]}
          >
            <Text style={styles.resultTitle}>
              생성된 번호
            </Text>
            {[...recommend.data]
              .sort((a, b) => a.setNumber - b.setNumber)
              .map((set, idx) => (
                <View key={set.id} style={styles.numberSet}>
                  <Text style={styles.setLabel}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                  <View style={styles.ballRow}>
                    {set.numbers.map((num, i) => (
                      <LottoBall key={i} number={num} size={44} />
                    ))}
                  </View>
                </View>
              ))}
          </Animated.View>
        )}

        {/* History Button */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <TouchableOpacity
            style={[styles.historyButton, { backgroundColor: surfaceColor }]}
            onPress={() => router.push('/lotto/history')}
            activeOpacity={0.7}
          >
            <IconSymbol name="clock.arrow.circlepath" size={20} color={tintColor} />
            <Text style={[styles.historyButtonText, { color: tintColor }]}>
              추천 기록 보기
            </Text>
            <IconSymbol name="chevron.right" size={16} color={tintColor} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    height: 52,
    backgroundColor: '#D4A017',
  },
  generateText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  resultCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: '#1E2333',
  },
  resultTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    color: '#FFFFFF',
  },
  numberSet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  setLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    width: 20,
    color: 'rgba(255,255,255,0.6)',
  },
  ballRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    flexShrink: 1,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    height: 52,
  },
  historyButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
