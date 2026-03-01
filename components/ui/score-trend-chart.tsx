import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const dividerColor = useThemeColor({}, 'divider');

  const chartData = data.map((point) => ({
    value: point.score,
    label: point.date,
  }));

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
              width={280}
              height={160}
              spacing={chartData.length > 1 ? 280 / (chartData.length - 1) : 280}
              maxValue={100}
              noOfSections={4}
              yAxisOffset={0}
              color={tintColor}
              thickness={2}
              dataPointsColor={tintColor}
              dataPointsRadius={4}
              yAxisTextStyle={{ color: textSecondary, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: textSecondary, fontSize: 9 }}
              hideRules
              yAxisColor="transparent"
              xAxisColor={dividerColor}
              curved
              startFillColor={tintColor + '20'}
              endFillColor={tintColor + '05'}
              areaChart
              isAnimated
              animationDuration={500}
              scrollToEnd
              endSpacing={16}
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
