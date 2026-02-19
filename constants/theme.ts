/**
 * Theme constants for the OYE (오늘의 예감) App
 * Refined Design System — Deep Navy + Vivid Purple
 */

import { Platform } from 'react-native';

// ─── Brand Colors ───────────────────────────────────────────────
export const BrandColors = {
  primary: '#1A1A2E',   // Deep Navy — 주요 텍스트
  accent: '#7C3AED',    // Vivid Purple — CTA 버튼, 핵심 액션
  accentLight: '#A78BFA', // 보조 강조
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

// ─── Gradients ──────────────────────────────────────────────────
export const Gradients = {
  fortune: {
    light: ['#F5F3FF', '#EDE9FE'] as const,
    dark: ['#1E1B4B', '#312E81'] as const,
  },
  accent: ['#7C3AED', '#6D28D9'] as const,
};

// ─── Score Colors ───────────────────────────────────────────────
export const ScoreColors = {
  excellent: '#10B981',
  good: '#22C55E',
  average: '#F59E0B',
  belowAverage: '#F97316',
  poor: '#EF4444',
};

// ─── Category Colors ────────────────────────────────────────────
export const CategoryColors = {
  love: '#EC4899',
  money: '#10B981',
  health: '#22C55E',
  work: '#7C3AED',
  study: '#F59E0B',
};

// ─── Category Icons ─────────────────────────────────────────────
export const CategoryIcons = {
  love: 'heart.fill',
  money: 'won.circle.fill',
  health: 'leaf.fill',
  work: 'briefcase.fill',
  study: 'book.fill',
};

// ─── Light / Dark Theme ─────────────────────────────────────────
export const Colors = {
  light: {
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textTertiary: '#9CA3AF',
    background: '#FFFFFF',
    surface: '#FAFAFA',
    surfaceSecondary: '#F3F4F6',
    tint: '#7C3AED',
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#7C3AED',
    card: '#FFFFFF',
    cardBorder: '#E5E7EB',
    inputBackground: '#F3F4F6',
    placeholder: '#9CA3AF',
    divider: '#E5E7EB',
    accent: '#7C3AED',
    accentLight: '#A78BFA',
    fortuneCardBg: '#F5F3FF',
    fortuneCardGradientStart: '#F5F3FF',
    fortuneCardGradientEnd: '#EDE9FE',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    textTertiary: '#9CA3AF',
    background: '#0A0A1B',
    surface: '#0F0F23',
    surfaceSecondary: '#1F2937',
    tint: '#A78BFA',
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#A78BFA',
    card: '#161632',
    cardBorder: '#1F2937',
    inputBackground: '#161632',
    placeholder: '#6B7280',
    divider: '#1F2937',
    accent: '#A78BFA',
    accentLight: '#7C3AED',
    fortuneCardBg: '#1E1B4B',
    fortuneCardGradientStart: '#1E1B4B',
    fortuneCardGradientEnd: '#312E81',
  },
};

// ─── Fonts ──────────────────────────────────────────────────────
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

// ─── Typography Presets ─────────────────────────────────────────
export const Typography = {
  display: {
    fontSize: 28,
    fontWeight: '300' as const,
    lineHeight: 44.8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 30.8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 25.2,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18.2,
  },
};

// ─── Spacing ────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// ─── Border Radius ──────────────────────────────────────────────
export const BorderRadius = {
  sm: 8,
  md: 14,    // Button
  lg: 16,    // ListItem
  xl: 20,    // Card
  xxl: 32,
  full: 9999,
};

// ─── Font Sizes (kept for backward compatibility) ───────────────
export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  display: 28,
};

// ─── Font Weights ───────────────────────────────────────────────
export const FontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// ─── Layout Constants ───────────────────────────────────────────
export const Layout = {
  horizontalPadding: 24,
  sectionGap: 32,
  buttonHeight: 52,
};

// ─── Time-based Theme ──────────────────────────────────────────
export const TimeTheme = {
  morning: {
    greeting: '좋은 아침이에요',
    emoji: '☀️',
    gradient: {
      light: ['#FFF7ED', '#FFFFFF'] as const,
      dark: ['#1C1308', '#0A0A1B'] as const,
    },
    iconGradient: ['#F59E0B', '#F97316'] as const,
  },
  afternoon: {
    greeting: '활기찬 오후예요',
    emoji: '🌤️',
    gradient: {
      light: ['#EFF6FF', '#FFFFFF'] as const,
      dark: ['#0F1A33', '#0A0A1B'] as const,
    },
    iconGradient: ['#3B82F6', '#7C3AED'] as const,
  },
  evening: {
    greeting: '수고한 하루예요',
    emoji: '🌅',
    gradient: {
      light: ['#FFF1F2', '#FFFFFF'] as const,
      dark: ['#1C0A12', '#0A0A1B'] as const,
    },
    iconGradient: ['#EC4899', '#7C3AED'] as const,
  },
  night: {
    greeting: '고요한 밤이에요',
    emoji: '🌙',
    gradient: {
      light: ['#EEF2FF', '#FFFFFF'] as const,
      dark: ['#12104B', '#0A0A1B'] as const,
    },
    iconGradient: ['#6366F1', '#4F46E5'] as const,
  },
};

// ─── Shadows ────────────────────────────────────────────────────
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
};
