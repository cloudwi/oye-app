import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import { getScoreColor } from '@/utils/score';

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

  const chartWidth = Math.min(screenWidth - 48 - 32 - 35 - 5, 500);

  const { chartData, xAxisLabels, avg, max, min } = useMemo(() => {
    const scores = data.map((p) => p.score);
    const avgVal = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const maxVal = scores.length > 0 ? Math.max(...scores) : 0;
    const minVal = scores.length > 0 ? Math.min(...scores) : 0;

    const len = data.length;
    const showAll = len <= 7;
    const labelCount = 6;
    const labels = data.map((point, i) => {
      if (showAll) return point.date;
      if (i === 0 || i === len - 1) return point.date;
      const step = Math.floor((len - 1) / (labelCount - 1));
      if (step > 0 && i % step === 0) return point.date;
      return '';
    });

    const items = data.map((point, i) => ({
      value: point.score,
      label: labels[i],
    }));

    return { chartData: items, xAxisLabels: labels, avg: avgVal, max: maxVal, min: minVal };
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
            <>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: textSecondary }]}>평균</Text>
                  <Text style={[styles.statValue, { color: getScoreColor(avg) }]}>{avg}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: textSecondary }]}>최고</Text>
                  <Text style={[styles.statValue, { color: getScoreColor(max) }]}>{max}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: textSecondary }]}>최저</Text>
                  <Text style={[styles.statValue, { color: getScoreColor(min) }]}>{min}</Text>
                </View>
              </View>
              <LineChart
                data={chartData}
                width={chartWidth}
                height={160}
                spacing={chartData.length > 1 ? chartWidth / (chartData.length - 1) : chartWidth}
                maxValue={100}
                noOfSections={5}
                yAxisOffset={0}
                yAxisLabelWidth={28}
                color={tintColor}
                thickness={1.5}
                hideDataPoints
                yAxisTextStyle={{ color: textSecondary, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: textSecondary, fontSize: 10 }}
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
                endSpacing={16}
                overflowTop={40}
                showReferenceLine1
                referenceLine1Position={avg}
                referenceLine1Config={{
                  color: tintColor,
                  dashWidth: 3,
                  dashGap: 3,
                  thickness: 1,
                }}
                pointerConfig={{
                  pointerStripHeight: 160,
                  pointerStripColor: dividerColor,
                  pointerStripWidth: 1,
                  pointerColor: tintColor,
                  radius: 5,
                  pointerLabelWidth: 100,
                  pointerLabelHeight: 40,
                  activatePointersInstantlyOnTouch: true,
                  autoAdjustPointerLabelPosition: true,
                  pointerLabelComponent: (items: { value: number; label?: string }[]) => {
                    const item = items[0];
                    return (
                      <View style={[styles.tooltip, { backgroundColor: surfaceColor, borderColor: dividerColor }]}>
                        <Text style={[styles.tooltipDate, { color: textSecondary }]}>{item.label}</Text>
                        <Text style={[styles.tooltipScore, { color: getScoreColor(item.value) }]}>{item.value}점</Text>
                      </View>
                    );
                  },
                }}
              />
            </>
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: FontSizes.xs,
  },
  statValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  tooltip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  tooltipDate: {
    fontSize: 10,
  },
  tooltipScore: {
    fontSize: 13,
    fontWeight: '700',
  },
});
