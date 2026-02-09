import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { authService } from '@/services/auth';
import { BrandColors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { KakaoSymbol } from '@/components/ui/kakao-symbol';

export default function OnboardingWelcome() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const [isLoading, setIsLoading] = useState(false);
  const { onboarding } = useUserStore();

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    try {
      const token = await authService.loginWithKakao();

      // 웹에서는 페이지 리다이렉트이므로 여기에 도달하지 않음
      if (Platform.OS === 'web') return;

      if (token) {
        if (onboarding.completed) {
          router.replace('/(tabs)');
        } else {
          router.push('/(onboarding)/birthdate');
        }
      } else {
        Alert.alert('로그인 실패', '카카오 로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('로그인 오류', '로그인 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* Logo/Icon Area */}
        <View style={styles.logoArea}>
          <LinearGradient
            colors={[BrandColors.primary, BrandColors.secondary]}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoText}>OYE</Text>
          </LinearGradient>
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={[styles.title, { color: textColor }]}>오늘의 예감</Text>
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            매일 아침, 당신만을 위한{'\n'}특별한 예감을 만나보세요
          </Text>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleKakaoLogin}
          activeOpacity={0.9}
          disabled={isLoading}
          style={styles.kakaoButton}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#3C1E1E" />
          ) : (
            <>
              <KakaoSymbol size={20} color="#000000" />
              <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoArea: {
    marginBottom: Spacing.xxl,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 2,
  },
  textContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  kakaoIcon: {
    width: 20,
    height: 20,
  },
  kakaoButtonText: {
    color: '#3C1E1E',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
});
