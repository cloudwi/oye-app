import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function getBallColor(num: number): string {
  if (num <= 10) return '#FBC400';
  if (num <= 20) return '#69C8F2';
  if (num <= 30) return '#FF7272';
  if (num <= 40) return '#AAAAAA';
  return '#B0D840';
}

interface LottoBallProps {
  number: number;
  size?: number;
  isBonus?: boolean;
}

export function LottoBall({ number, size = 40, isBonus = false }: LottoBallProps) {
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
      ]}
    >
      <Text
        style={[
          styles.number,
          { fontSize: size * 0.38, lineHeight: size },
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
  number: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
});
