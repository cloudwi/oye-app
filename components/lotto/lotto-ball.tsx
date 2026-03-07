import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function getBallColor(num: number): string {
  if (num <= 10) return '#DB9B00';
  if (num <= 20) return '#3B9DD1';
  if (num <= 30) return '#E04848';
  if (num <= 40) return '#787878';
  return '#7CAE1E';
}

interface LottoBallProps {
  number: number;
  size?: number;
  isBonus?: boolean;
  isMatched?: boolean;
}

export function LottoBall({ number, size = 40, isBonus = false, isMatched = false }: LottoBallProps) {
  const bgColor = getBallColor(number);

  return (
    <View
      style={[
        styles.ball,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
        isBonus && styles.bonusBall,
        isMatched && styles.matchedBall,
      ]}
    >
      <Text
        style={[
          styles.number,
          { fontSize: size * 0.4 },
        ]}
      >
        {number}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ball: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  bonusBall: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  matchedBall: {
    borderWidth: 3,
    borderColor: '#4ADE80',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  number: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
