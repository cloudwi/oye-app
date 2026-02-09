/**
 * Theme constants for the OYE (오늘의 예감) App
 * Minimal & Modern Design System
 */

import { Platform } from 'react-native';

// Brand colors - Soft & Calming palette
export const BrandColors = {
  primary: '#6366F1', // Indigo - 신비로운 느낌
  secondary: '#8B5CF6', // Violet
  tertiary: '#EC4899', // Pink
  accent: '#F59E0B', // Amber - 포인트
  success: '#10B981', // Emerald
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

// Gradient presets
export const Gradients = {
  primary: ['#6366F1', '#8B5CF6'],
  fortune: ['#6366F1', '#EC4899'],
  warm: ['#F59E0B', '#EF4444'],
  cool: ['#06B6D4', '#3B82F6'],
  calm: ['#8B5CF6', '#6366F1'],
};

// Score colors - More vibrant
export const ScoreColors = {
  excellent: '#10B981', // 80-100 Emerald
  good: '#22C55E', // 60-79 Green
  average: '#F59E0B', // 40-59 Amber
  belowAverage: '#F97316', // 20-39 Orange
  poor: '#EF4444', // 0-19 Red
};

// Category colors - Harmonious palette
export const CategoryColors = {
  love: '#EC4899', // Pink
  money: '#10B981', // Emerald
  health: '#22C55E', // Green
  work: '#6366F1', // Indigo
  study: '#F59E0B', // Amber
};

// Category icons (SF Symbols)
export const CategoryIcons = {
  love: 'heart.fill',
  money: 'won.circle.fill',
  health: 'leaf.fill',
  work: 'briefcase.fill',
  study: 'book.fill',
};

const tintColorLight = '#6366F1';
const tintColorDark = '#818CF8';

export const Colors = {
  light: {
    text: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F3F4F6',
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    card: '#FFFFFF',
    cardBorder: '#E5E7EB',
    inputBackground: '#F3F4F6',
    placeholder: '#9CA3AF',
    divider: '#E5E7EB',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    background: '#0F0F0F',
    surface: '#1A1A1A',
    surfaceSecondary: '#262626',
    tint: tintColorDark,
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    card: '#1A1A1A',
    cardBorder: '#374151',
    inputBackground: '#262626',
    placeholder: '#6B7280',
    divider: '#374151',
  },
};

export const Fonts = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  default: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  xxxl: 36,
  display: 48,
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
};
