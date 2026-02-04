/**
 * Theme constants for the OYE (오늘의 운세) App
 */

import { Platform } from 'react-native';

// Brand colors
export const BrandColors = {
  primary: '#FF6B6B', // Main accent color (coral red)
  secondary: '#4ECDC4', // Secondary accent (teal)
  tertiary: '#FFE66D', // Tertiary accent (yellow)
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
};

// Score colors
export const ScoreColors = {
  excellent: '#4CAF50', // 80-100
  good: '#8BC34A', // 60-79
  average: '#FFC107', // 40-59
  belowAverage: '#FF9800', // 20-39
  poor: '#F44336', // 0-19
};

// Category colors
export const CategoryColors = {
  love: '#FF6B6B',
  money: '#4ECDC4',
  health: '#8BC34A',
  work: '#5C6BC0',
  study: '#FFB74D',
};

const tintColorLight = '#FF6B6B';
const tintColorDark = '#FF8A8A';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    card: '#FFFFFF',
    cardBorder: '#E5E5E5',
    inputBackground: '#F5F5F5',
    placeholder: '#999999',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    card: '#1E2022',
    cardBorder: '#333333',
    inputBackground: '#2A2A2A',
    placeholder: '#666666',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
};
