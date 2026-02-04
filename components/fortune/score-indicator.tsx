import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ScoreIndicatorProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#4CAF50';
  if (score >= 60) return '#8BC34A';
  if (score >= 40) return '#FFC107';
  if (score >= 20) return '#FF9800';
  return '#F44336';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return '대길';
  if (score >= 70) return '길';
  if (score >= 50) return '보통';
  if (score >= 30) return '소흉';
  return '흉';
}

export function ScoreIndicator({
  score,
  size = 'medium',
  showLabel = false,
}: ScoreIndicatorProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({ light: '#F5F5F5', dark: '#2A2A2A' }, 'background');
  const scoreColor = getScoreColor(score);

  const sizeConfig = sizes[size];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circle,
          {
            width: sizeConfig.size,
            height: sizeConfig.size,
            borderRadius: sizeConfig.size / 2,
            borderColor: scoreColor,
            borderWidth: sizeConfig.borderWidth,
            backgroundColor,
          },
        ]}
      >
        <Text
          style={[
            styles.score,
            {
              fontSize: sizeConfig.fontSize,
              color: scoreColor,
            },
          ]}
        >
          {score}
        </Text>
      </View>
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: scoreColor,
              fontSize: sizeConfig.labelSize,
            },
          ]}
        >
          {getScoreLabel(score)}
        </Text>
      )}
    </View>
  );
}

const sizes = {
  small: {
    size: 48,
    borderWidth: 3,
    fontSize: 16,
    labelSize: 12,
  },
  medium: {
    size: 80,
    borderWidth: 4,
    fontSize: 24,
    labelSize: 14,
  },
  large: {
    size: 120,
    borderWidth: 6,
    fontSize: 36,
    labelSize: 18,
  },
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontWeight: 'bold',
  },
  label: {
    marginTop: 8,
    fontWeight: '600',
  },
});
