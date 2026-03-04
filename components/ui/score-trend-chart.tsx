import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';

export interface ScoreTrendPoint {
  date: string; // 'M/d' format for display
  score: number;
}

interface ScoreTrendChartProps {
  data: ScoreTrendPoint[];
  isLoading: boolean;
  title: string;
}

export function ScoreTrendChart({ data, isLoading, title }: ScoreTrendChartProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const dividerColor = useThemeColor({}, 'divider');
  const { width: screenWidth } = useWindowDimensions();

  // 카드 내부 실제 차트 영역 너비: 화면 - FlatList패딩(48) - 카드패딩(32) - Y축라벨(28)
  const chartWidth = Math.min(screenWidth - 48 - 32 - 28, 500);

  const chartData = useMemo(() => {
    return data.map((point) => ({ value: point.score }));
  }, [data]);

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor }, Shadows.sm]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded((v) => !v)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <IconSymbol name="chart.line.uptrend.xyaxis" size={18} color={tintColor} />
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        </View>
        <IconSymbol
          name={isExpanded ? 'chevron.up' : 'chevron.down'}
          size={14}
          color={textSecondary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.chartContainer}>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={tintColor} />
            </View>
          ) : chartData.length < 3 ? (
            <View style={styles.insufficientContainer}>
              <Text style={[styles.emptyText, { color: textSecondary }]}>
                3일 이상 기록이 쌓이면 추이 그래프가 그려져요
              </Text>
            </View>
          ) : (
            <LineChart
              data={chartData}
              width={chartWidth}
              height={160}
              initialSpacing={0}
              spacing={chartData.length > 1 ? chartWidth / (chartData.length - 1) : chartWidth}
              maxValue={100}
              noOfSections={5}
              yAxisOffset={0}
              yAxisLabelWidth={28}
              color={tintColor}
              thickness={1.5}
              hideDataPoints
              yAxisTextStyle={{ color: textSecondary, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: 'transparent', fontSize: 0 }}
              rulesType="dashed"
              rulesColor={dividerColor}
              dashWidth={4}
              dashGap={4}
              yAxisColor="transparent"
              xAxisColor={dividerColor}
              xAxisThickness={0.5}
              curved
              curvature={0.15}
              areaChart
              startFillColor={tintColor}
              endFillColor={tintColor}
              startOpacity={0.12}
              endOpacity={0.01}
              isAnimated
              animationDuration={600}
              disableScroll
              endSpacing={0}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  chartContainer: {
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    marginBottom: Spacing.md,
  },
  loadingContainer: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insufficientContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: FontSizes.sm,
  },
});
