import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function OnboardingWelcome() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const subtextColor = useThemeColor({ light: '#666', dark: '#999' }, 'icon');
  const accentColor = '#FF6B6B';

  const handleNext = () => {
    router.push('/(onboarding)/birthdate');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: accentColor + '20' }]}>
            <IconSymbol name="sparkles" size={80} color={accentColor} />
          </View>
        </View>

        <Text style={[styles.title, { color: textColor }]}>오늘의 운세</Text>
        <Text style={[styles.subtitle, { color: subtextColor }]}>
          매일 아침, 당신만을 위한{'\n'}
          특별한 운세를 확인하세요
        </Text>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: accentColor }]} />
            <Text style={[styles.featureText, { color: textColor }]}>
              생년월일 기반 맞춤 운세
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: accentColor }]} />
            <Text style={[styles.featureText, { color: textColor }]}>
              연애, 금전, 건강, 직장, 학업운
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: accentColor }]} />
            <Text style={[styles.featureText, { color: textColor }]}>
              매일 아침 알림으로 받아보기
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="시작하기"
          onPress={handleNext}
          variant="secondary"
          size="large"
          style={styles.button}
        />
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
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  features: {
    alignSelf: 'stretch',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featureText: {
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    width: '100%',
  },
});
