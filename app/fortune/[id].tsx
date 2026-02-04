import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFortuneStore } from '@/stores/fortune-store';
import { Card } from '@/components/ui/card';
import { ScoreIndicator } from '@/components/fortune/score-indicator';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { shareService } from '@/services/share';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/fortune';
import type { Fortune, CategoryFortune } from '@/types/fortune';

export default function FortuneDetailScreen() {
  const { id, category: initialCategory } = useLocalSearchParams<{
    id: string;
    category?: string;
  }>();

  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const subtextColor = useThemeColor({ light: '#666', dark: '#999' }, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({ light: '#F5F5F5', dark: '#2A2A2A' }, 'background');
  const accentColor = '#FF6B6B';

  const { todayFortune, history } = useFortuneStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(
    initialCategory ? parseInt(initialCategory, 10) : 0
  );

  // Find fortune from today's fortune or history
  const fortune: Fortune | undefined =
    todayFortune?.id === id
      ? todayFortune
      : history.find((f) => f.id === id);

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (fortune) {
      await shareService.shareFortune(fortune);
    }
  };

  if (!fortune) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: subtextColor }]}>
            운세를 찾을 수 없습니다
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = format(new Date(fortune.date), 'M월 d일 EEEE', { locale: ko });
  const selectedCategory = fortune.categories[selectedCategoryIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>운세 상세</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <IconSymbol name="square.and.arrow.up" size={22} color={tintColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.date, { color: subtextColor }]}>{formattedDate}</Text>

        {/* Overall Fortune */}
        <Card variant="elevated" style={styles.overallCard}>
          <View style={styles.overallHeader}>
            <Text style={[styles.overallTitle, { color: textColor }]}>총운</Text>
            <ScoreIndicator score={fortune.overallScore} size="medium" showLabel />
          </View>
          <Text style={[styles.overallMessage, { color: textColor }]}>
            {fortune.overallMessage}
          </Text>
          <View style={styles.luckyItems}>
            <View style={[styles.luckyItem, { backgroundColor: cardColor }]}>
              <IconSymbol name="paintpalette.fill" size={18} color={accentColor} />
              <Text style={[styles.luckyLabel, { color: subtextColor }]}>색</Text>
              <Text style={[styles.luckyValue, { color: textColor }]}>
                {fortune.luckyColor}
              </Text>
            </View>
            <View style={[styles.luckyItem, { backgroundColor: cardColor }]}>
              <IconSymbol name="number.circle.fill" size={18} color={accentColor} />
              <Text style={[styles.luckyLabel, { color: subtextColor }]}>숫자</Text>
              <Text style={[styles.luckyValue, { color: textColor }]}>
                {fortune.luckyNumber}
              </Text>
            </View>
            <View style={[styles.luckyItem, { backgroundColor: cardColor }]}>
              <IconSymbol name="star.fill" size={18} color={accentColor} />
              <Text style={[styles.luckyLabel, { color: subtextColor }]}>아이템</Text>
              <Text style={[styles.luckyValue, { color: textColor }]}>
                {fortune.luckyItem}
              </Text>
            </View>
          </View>
        </Card>

        {/* Category Tabs */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>카테고리별 운세</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryTabs}
          contentContainerStyle={styles.categoryTabsContent}
        >
          {fortune.categories.map((cat, index) => {
            const isSelected = index === selectedCategoryIndex;
            return (
              <TouchableOpacity
                key={cat.category}
                style={[
                  styles.categoryTab,
                  {
                    backgroundColor: isSelected ? accentColor : cardColor,
                  },
                ]}
                onPress={() => setSelectedCategoryIndex(index)}
              >
                <IconSymbol
                  name={CATEGORY_ICONS[cat.category] as any}
                  size={18}
                  color={isSelected ? '#fff' : subtextColor}
                />
                <Text
                  style={[
                    styles.categoryTabText,
                    { color: isSelected ? '#fff' : textColor },
                  ]}
                >
                  {CATEGORY_LABELS[cat.category]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected Category Detail */}
        {selectedCategory && (
          <Card variant="elevated" style={styles.categoryDetailCard}>
            <View style={styles.categoryDetailHeader}>
              <View style={styles.categoryDetailLeft}>
                <IconSymbol
                  name={CATEGORY_ICONS[selectedCategory.category] as any}
                  size={28}
                  color={accentColor}
                />
                <View>
                  <Text style={[styles.categoryDetailLabel, { color: subtextColor }]}>
                    {CATEGORY_LABELS[selectedCategory.category]}
                  </Text>
                  <Text style={[styles.categoryDetailTitle, { color: textColor }]}>
                    {selectedCategory.title}
                  </Text>
                </View>
              </View>
              <ScoreIndicator score={selectedCategory.score} size="small" />
            </View>

            <View style={styles.divider} />

            <Text style={[styles.categoryDescription, { color: textColor }]}>
              {selectedCategory.description}
            </Text>

            {selectedCategory.advice && (
              <View style={[styles.adviceBox, { backgroundColor: accentColor + '15' }]}>
                <IconSymbol name="lightbulb.fill" size={20} color={accentColor} />
                <View style={styles.adviceContent}>
                  <Text style={[styles.adviceLabel, { color: accentColor }]}>
                    오늘의 조언
                  </Text>
                  <Text style={[styles.adviceText, { color: textColor }]}>
                    {selectedCategory.advice}
                  </Text>
                </View>
              </View>
            )}
          </Card>
        )}

        {/* All Categories Summary */}
        <Text style={[styles.sectionTitle, { color: textColor, marginTop: 24 }]}>
          전체 카테고리 요약
        </Text>
        <Card variant="outlined" style={{ backgroundColor: cardColor }}>
          {fortune.categories.map((cat, index) => (
            <TouchableOpacity
              key={cat.category}
              style={[
                styles.summaryItem,
                index < fortune.categories.length - 1 && styles.summaryItemBorder,
              ]}
              onPress={() => setSelectedCategoryIndex(index)}
            >
              <View style={styles.summaryLeft}>
                <IconSymbol
                  name={CATEGORY_ICONS[cat.category] as any}
                  size={20}
                  color={tintColor}
                />
                <Text style={[styles.summaryLabel, { color: textColor }]}>
                  {CATEGORY_LABELS[cat.category]}
                </Text>
              </View>
              <View style={styles.summaryRight}>
                <ScoreIndicator score={cat.score} size="small" />
              </View>
            </TouchableOpacity>
          ))}
        </Card>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  date: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  overallCard: {
    marginBottom: 24,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  overallTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  overallMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  luckyItems: {
    flexDirection: 'row',
    gap: 12,
  },
  luckyItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  luckyLabel: {
    fontSize: 10,
  },
  luckyValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryTabs: {
    marginBottom: 16,
  },
  categoryTabsContent: {
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryDetailCard: {
    marginBottom: 8,
  },
  categoryDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryDetailLabel: {
    fontSize: 12,
  },
  categoryDetailTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
  },
  categoryDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  adviceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  adviceContent: {
    flex: 1,
  },
  adviceLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  summaryItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
