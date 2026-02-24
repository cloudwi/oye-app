/**
 * Theme constants for the OYE (오늘의 예감) App
 * Design System — Systematic Scale (Toss-inspired)
 *
 * Color Architecture:
 * 1. Gray Scale — UI 기본 구조 (배경, 텍스트, 보더)
 * 2. Accent Scale — 웜 토프 계열 (CTA, 강조, 브랜드)
 * 3. Semantic Colors — 상태 표현 (성공, 경고, 에러)
 * 4. Category Colors — 콘텐츠 구분 (운세 카테고리)
 */

import { Platform } from 'react-native';

// ─── 1. Color Scales ─────────────────────────────────────────────

/** 따뜻한 그레이 스케일 (자줏빛 톤) */
export const Gray = {
  50:  '#FAF8F6',
  100: '#F3EDE7',
  200: '#E8DFD4',
  300: '#C4B8A8',
  400: '#A89BB0',
  500: '#7B6B8A',
  600: '#5E4F6B',
  700: '#3D3150',
  800: '#2D2438',
  900: '#1C1628',
  950: '#141018',
} as const;

/** 웜 토프 액센트 스케일 */
export const Accent = {
  50:  '#F7F5F3',
  100: '#EDE8E3',
  200: '#C4BAB0',
  300: '#A89A8E',
  400: '#8C7B6B',
  500: '#6F6052',
  600: '#544840',
} as const;

// ─── 2. Semantic Colors ─────────────────────────────────────────

export const Semantic = {
  success:    '#5B9A6F',
  successBg:  '#F0F7F2',
  warning:    '#C9956B',
  warningBg:  '#FBF3EC',
  error:      '#C75C5C',
  errorBg:    '#FBF0F0',
  info:       '#7B8DAE',
  infoBg:     '#F0F2F7',
} as const;

// ─── 3. Brand Colors (semantic aliases) ──────────────────────────
export const BrandColors = {
  primary: Gray[800],
  accent: Accent[400],
  accentLight: Accent[200],
  success: Semantic.success,
  warning: Semantic.warning,
  error: Semantic.error,
};

// ─── 4. Score Colors (5단계) ─────────────────────────────────────
export const ScoreColors = {
  excellent:    '#5B9A6F',
  good:         '#7AAF6B',
  average:      '#C9956B',
  belowAverage: '#C9784A',
  poor:         '#C75C5C',
};

// ─── 5. Category Colors ─────────────────────────────────────────
export const CategoryColors = {
  love:   '#C4929A',   // 더스티 로즈
  money:  Accent[400], // 웜 토프
  health: '#5B9A6F',   // 약초색
  work:   Gray[500],   // 자수정
  study:  '#C9956B',   // 캐러멜
};

export const CategoryIcons = {
  love: 'heart.fill',
  money: 'won.circle.fill',
  health: 'leaf.fill',
  work: 'briefcase.fill',
  study: 'book.fill',
};

// ─── 6. Relation Config ─────────────────────────────────────────
export const RelationConfig = {
  LOVER:     { label: '연인',     color: '#C4929A' },
  FRIEND:    { label: '친구',     color: Gray[500] },
  FAMILY:    { label: '가족',     color: '#5B9A6F' },
  COLLEAGUE: { label: '직장동료', color: '#C9956B' },
} as const;

// ─── 7. Gradients ───────────────────────────────────────────────
export const Gradients = {
  fortune: {
    light: [Accent[50], '#EDE8E3'] as const,
    dark: ['#231B2E', '#1A1328'] as const,
  },
  accent: [Accent[400], Accent[500]] as const,
};

// ─── 8. Light / Dark Theme Tokens ────────────────────────────────
export const Colors = {
  light: {
    // Text
    text:          Gray[800],
    textSecondary: Gray[500],
    textMuted:     Gray[400],
    textTertiary:  Gray[400],

    // Surfaces
    background:       Gray[50],
    surface:          '#FFFDF9',
    surfaceSecondary: Gray[100],

    // Interactive
    tint:             Accent[400],
    icon:             Gray[500],
    tabIconDefault:   Gray[400],
    tabIconSelected:  Accent[400],

    // Components
    card:             '#FFFDF9',
    cardBorder:       Gray[200],
    inputBackground:  Gray[100],
    placeholder:      Gray[400],
    divider:          Gray[200],

    // Accent
    accent:      Accent[400],
    accentLight: Accent[200],

    // Fortune Card
    fortuneCardBg:            Accent[50],
    fortuneCardGradientStart: Accent[50],
    fortuneCardGradientEnd:   '#EDE8E3',
  },
  dark: {
    // Text
    text:          '#F5F0E8',
    textSecondary: Gray[300],
    textMuted:     '#8F8278',
    textTertiary:  '#8F8278',

    // Surfaces
    background:       Gray[950],
    surface:          '#1C1623',
    surfaceSecondary: '#2A2233',

    // Interactive
    tint:             Accent[200],
    icon:             '#8F8278',
    tabIconDefault:   '#5E5550',
    tabIconSelected:  Accent[200],

    // Components
    card:             '#1C1623',
    cardBorder:       '#2A2233',
    inputBackground:  '#1C1623',
    placeholder:      '#5E5550',
    divider:          '#2A2233',

    // Accent
    accent:      Accent[200],
    accentLight: Accent[400],

    // Fortune Card
    fortuneCardBg:            '#231B2E',
    fortuneCardGradientStart: '#231B2E',
    fortuneCardGradientEnd:   '#1A1328',
  },
};

// ─── 9. Typography ──────────────────────────────────────────────

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

export const Typography = {
  display: { fontSize: 28, fontWeight: '300' as const, lineHeight: 44.8 },
  heading: { fontSize: 22, fontWeight: '600' as const, lineHeight: 30.8 },
  title:   { fontSize: 18, fontWeight: '600' as const, lineHeight: 25.2 },
  body:    { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18.2 },
};

export const FontSizes = {
  xs: 11, sm: 13, md: 16, lg: 18,
  xl: 22, xxl: 28, xxxl: 36, display: 28,
};

export const FontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// ─── 10. Spacing & Layout ────────────────────────────────────────

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24,
  xl: 32, xxl: 48, xxxl: 64,
};

export const BorderRadius = {
  sm: 8, md: 14, lg: 16, xl: 20, xxl: 32, full: 9999,
};

export const Layout = {
  horizontalPadding: 24,
  sectionGap: 32,
  buttonHeight: 52,
};

// ─── 11. Time-based Theme ────────────────────────────────────────

export const TimeTheme = {
  morning: {
    greeting: '좋은 아침이에요',
    gradient: {
      light: ['#FDF6E8', Gray[50]] as const,
      dark: ['#1F1810', Gray[950]] as const,
    },
    iconGradient: [Accent[300], Accent[400]] as const,
  },
  afternoon: {
    greeting: '활기찬 오후예요',
    gradient: {
      light: ['#F0EAF2', Gray[50]] as const,
      dark: ['#1A1525', Gray[950]] as const,
    },
    iconGradient: [Gray[500], Accent[400]] as const,
  },
  evening: {
    greeting: '수고한 하루예요',
    gradient: {
      light: ['#F8ECE8', Gray[50]] as const,
      dark: ['#1F1418', Gray[950]] as const,
    },
    iconGradient: ['#C4929A', Accent[400]] as const,
  },
  night: {
    greeting: '고요한 밤이에요',
    gradient: {
      light: ['#EEEAF5', Gray[50]] as const,
      dark: ['#18142B', Gray[950]] as const,
    },
    iconGradient: [Gray[600], '#4A3D6B'] as const,
  },
};

// ─── 12. Shadows ─────────────────────────────────────────────────

export const Shadows = {
  card: {
    shadowColor: Gray[800],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    // @ts-ignore - web only
    boxShadow: '0 1px 8px rgba(45, 36, 56, 0.06)',
  },
  sm: {
    shadowColor: Gray[800],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    // @ts-ignore - web only
    boxShadow: '0 1px 2px rgba(45, 36, 56, 0.04)',
  },
  md: {
    shadowColor: Gray[800],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    // @ts-ignore - web only
    boxShadow: '0 1px 8px rgba(45, 36, 56, 0.06)',
  },
  lg: {
    shadowColor: Gray[800],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    // @ts-ignore - web only
    boxShadow: '0 4px 16px rgba(45, 36, 56, 0.08)',
  },
};
