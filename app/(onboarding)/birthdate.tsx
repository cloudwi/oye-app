import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Gradients, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';

const ITEM_HEIGHT = 44;

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function OnboardingBirthdate() {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const { setBirthDate } = useUserStore();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const yearScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const dayScrollRef = useRef<ScrollView>(null);

  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth =
    selectedYear != null && selectedMonth != null
      ? new Date(selectedYear, selectedMonth, 0).getDate()
      : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Adjust day if it exceeds the month's max
  React.useEffect(() => {
    if (selectedDay != null && selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [daysInMonth]);

  const isValid = selectedYear != null && selectedMonth != null && selectedDay != null;

  // Button opacity animation
  const buttonOpacity = useSharedValue(0.4);
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    if (isValid) {
      buttonOpacity.value = withTiming(1, { duration: 300 });
      buttonScale.value = withSpring(1.02, { damping: 15, stiffness: 150 });
      // Reset scale back
      setTimeout(() => {
        buttonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }, 200);
    } else {
      buttonOpacity.value = withTiming(0.4, { duration: 300 });
    }
  }, [isValid]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const handleNext = () => {
    if (!isValid) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const birthDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    setBirthDate(birthDate);
    router.push('/(onboarding)/calendartype');
  };

  const handleBack = () => {
    router.back();
  };

  const scrollToItem = useCallback((scrollRef: React.RefObject<ScrollView>, index: number) => {
    scrollRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  }, []);

  const renderPicker = (
    data: number[],
    selected: number | null,
    onSelect: (value: number) => void,
    suffix: string = '',
    scrollRef: React.RefObject<ScrollView>
  ) => (
    <ScrollView
      ref={scrollRef}
      style={styles.picker}
      contentContainerStyle={styles.pickerContent}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
    >
      {data.map((item, index) => {
        const isSelected = selected === item;
        return (
          <TouchableOpacity
            key={item}
            style={[
              styles.pickerItem,
              isSelected && { backgroundColor: tintColor + '20' },
            ]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.selectionAsync();
              }
              onSelect(item);
              scrollToItem(scrollRef, index);
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pickerText,
                { color: isSelected ? tintColor : textSecondary },
                isSelected && styles.pickerTextSelected,
              ]}
            >
              {item}{suffix}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // Date display text with key for fade-in animation
  const dateDisplayKey = `${selectedYear}-${selectedMonth}-${selectedDay}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="뒤로 가기">
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>생년월일</Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          맞춤 예감을 위해 알려주세요
        </Text>

        {/* Date Display */}
        <View style={[styles.dateDisplay, { backgroundColor: surfaceColor }, Shadows.md]}>
          <Animated.Text
            key={dateDisplayKey}
            entering={FadeIn.duration(300)}
            style={[styles.dateText, { color: isValid ? textColor : textSecondary }]}
          >
            {isValid
              ? `${selectedYear}년 ${selectedMonth}월 ${selectedDay}일`
              : '생년월일을 선택해주세요'}
          </Animated.Text>
        </View>

        {/* Pickers */}
        <View style={styles.pickerContainer}>
          <View style={[styles.pickerWrapper, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <Text style={[styles.pickerLabel, { color: textSecondary }]}>년</Text>
            {renderPicker(years, selectedYear, setSelectedYear, '', yearScrollRef)}
          </View>

          <View style={[styles.pickerWrapper, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <Text style={[styles.pickerLabel, { color: textSecondary }]}>월</Text>
            {renderPicker(months, selectedMonth, setSelectedMonth, '', monthScrollRef)}
          </View>

          <View style={[styles.pickerWrapper, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <Text style={[styles.pickerLabel, { color: textSecondary }]}>일</Text>
            {renderPicker(days, selectedDay, setSelectedDay, '', dayScrollRef)}
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.9}
          disabled={!isValid}
          accessibilityRole="button"
          accessibilityLabel="다음"
        >
          <AnimatedLinearGradient
            colors={Gradients.accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, buttonAnimatedStyle]}
          >
            <Text style={styles.buttonText}>다음</Text>
          </AnimatedLinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: Spacing.xl,
  },
  dateDisplay: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  dateText: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flex: 1,
  },
  pickerWrapper: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    maxHeight: 280,
  },
  pickerLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  picker: {
    flex: 1,
  },
  pickerContent: {
    paddingVertical: Spacing.xs,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  pickerText: {
    fontSize: FontSizes.md,
  },
  pickerTextSelected: {
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  button: {
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
});
