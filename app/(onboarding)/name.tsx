import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { BackHeader } from '@/components/ui/back-header';
import { GradientButton } from '@/components/ui/gradient-button';
import { BrandColors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';

// 25 x 22 x 25 = 13,750 조합
const MOODS = [
  '졸린', '배고픈', '신나는', '느긋한', '수줍은',
  '설레는', '나른한', '들뜬', '행복한', '엉뚱한',
  '반짝반짝', '몽글몽글', '보들보들', '폭신폭신', '살랑살랑',
  '말랑말랑', '동글동글', '소곤소곤', '아장아장', '두근두근',
  '새벽감성', '봄날의', '노을빛', '토요일의', '한여름밤',
];

const FLAVORS = [
  '딸기맛', '초코', '바닐라', '민트초코', '캐러멜',
  '꿀', '레몬', '복숭아', '블루베리', '말차',
  '메이플', '요거트', '코코넛', '자몽', '라즈베리',
  '흑당', '티라미수', '피스타치오', '망고', '얼그레이',
  '사과', '체리',
];

const CHARACTERS = [
  '고양이', '판다', '수달', '코알라', '펭귄',
  '다람쥐', '토끼', '곰돌이', '햄스터', '카피바라',
  '레서판다', '미어캣', '아기오리', '북극여우', '아기사슴',
  '푸딩', '마카롱', '크로와상', '도넛', '와플',
  '솜사탕', '붕어빵', '베이글', '츄러스', '팬케이크',
];

function generateRandomName(): string {
  const mood = MOODS[Math.floor(Math.random() * MOODS.length)];
  const flavor = FLAVORS[Math.floor(Math.random() * FLAVORS.length)];
  const character = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  return `${mood} ${flavor} ${character}`;
}

export default function OnboardingName() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { user, updateUser } = useUserStore();
  const [name, setName] = useState(user?.name ?? '');

  const trimmed = name.trim();

  const handleNext = () => {
    if (trimmed) {
      updateUser({ name: trimmed });
      router.push('/(onboarding)/gender');
    }
  };

  const handleSkip = () => {
    updateUser({ name: generateRandomName() });
    router.push('/(onboarding)/gender');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <BackHeader />

      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>이름</Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          예감에서 사용할 이름을 알려주세요
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              color: textColor,
              backgroundColor: surfaceColor,
              borderColor: trimmed ? BrandColors.primary : 'transparent',
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="이름을 입력해주세요"
          placeholderTextColor={textSecondary}
          autoFocus
          maxLength={20}
          returnKeyType="done"
          onSubmitEditing={handleNext}
        />
      </View>

      <View style={styles.footer}>
        <GradientButton
          label="다음"
          onPress={handleNext}
          isEnabled={!!trimmed}
        />

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="건너뛰기">
          <Text style={[styles.skipText, { color: textSecondary }]}>건너뛰기</Text>
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
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.xxl,
  },
  input: {
    fontSize: FontSizes.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  skipText: {
    fontSize: FontSizes.md,
  },
});
