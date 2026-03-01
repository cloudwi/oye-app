/**
 * Theme constants for the OYE (오늘의 예감) App
 * Design System — Systematic Scale (Toss-inspired)
 *
 * Color Architecture:
 * 1. Gray Scale — 뉴트럴 쿨톤 (배경, 텍스트, 보더)
 * 2. Accent Scale — 인디고 퍼플 계열 (CTA, 강조, 브랜드)
 * 3. Semantic Colors — 상태 표현 (성공, 경고, 에러)
 * 4. Category Colors — 콘텐츠 구분 (운세 카테고리)
 */

import { Platform } from 'react-native';

// ─── 1. Color Scales ─────────────────────────────────────────────

/** 쿨 뉴트럴 그레이 스케일 */
export const Gray = {
  50:  '#F8F9FB',
  100: '#F0F1F5',
  200: '#E2E4EA',
  300: '#C1C4CE',
  400: '#9398A7',
  500: '#6B7080',
  600: '#4E5362',
  700: '#363A47',
  800: '#252833',
  900: '#181A23',
  950: '#111318',
} as const;

/** 인디고 퍼플 액센트 스케일 */
export const Accent = {
  50:  '#F3F2FB',
  100: '#E5E3F6',
  200: '#B8B3E0',
  300: '#9189D0',
  400: '#6C63C0',
  500: '#5248A3',
  600: '#3F3780',
} as const;

// ─── 2. Semantic Colors ─────────────────────────────────────────

export const Semantic = {
  success:    '#4CAF82',
  successBg:  '#EFF8F3',
  warning:    '#E09C4F',
  warningBg:  '#FDF5EB',
  error:      '#D45555',
  errorBg:    '#FDF0F0',
  info:       '#5B8EC9',
  infoBg:     '#EFF4FA',
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
  excellent:    '#4CAF82',
  good:         '#6BBF7A',
  average:      '#E09C4F',
  belowAverage: '#D97A42',
  poor:         '#D45555',
};

// ─── 5. Category Colors ─────────────────────────────────────────
export const CategoryColors = {
  love:   '#D47C9A',   // 로즈 핑크
  money:  '#5B8EC9',   // 블루
  health: '#4CAF82',   // 그린
  work:   Accent[400], // 인디고
  study:  '#E09C4F',   // 앰버
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
  LOVER:     { label: '연인',     color: '#D47C9A' },
  FRIEND:    { label: '친구',     color: '#5B8EC9' },
  FAMILY:    { label: '가족',     color: '#4CAF82' },
  COLLEAGUE: { label: '직장동료', color: Accent[400] },
} as const;

// ─── 7. Gradients ───────────────────────────────────────────────
export const Gradients = {
  fortune: {
    light: [Accent[50], Gray[100]] as const,
    dark: ['#1C1A2E', '#151320'] as const,
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
    surface:          '#FFFFFF',
    surfaceSecondary: Gray[100],

    // Interactive
    tint:             Accent[400],
    icon:             Gray[500],
    tabIconDefault:   Gray[400],
    tabIconSelected:  Accent[400],

    // Components
    card:             '#FFFFFF',
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
    fortuneCardGradientEnd:   Gray[100],
  },
  dark: {
    // Text
    text:          '#EDEEF2',
    textSecondary: Gray[300],
    textMuted:     '#7A7E8C',
    textTertiary:  '#7A7E8C',

    // Surfaces
    background:       Gray[950],
    surface:          '#1A1C26',
    surfaceSecondary: '#222430',

    // Interactive
    tint:             Accent[300],
    icon:             '#7A7E8C',
    tabIconDefault:   '#4A4D58',
    tabIconSelected:  Accent[300],

    // Components
    card:             '#1A1C26',
    cardBorder:       '#222430',
    inputBackground:  '#1A1C26',
    placeholder:      '#4A4D58',
    divider:          '#222430',

    // Accent
    accent:      Accent[300],
    accentLight: Accent[400],

    // Fortune Card
    fortuneCardBg:            '#1C1A2E',
    fortuneCardGradientStart: '#1C1A2E',
    fortuneCardGradientEnd:   '#151320',
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
      light: ['#F5F0FB', Gray[50]] as const,
      dark: ['#1C1828', Gray[950]] as const,
    },
    iconGradient: [Accent[300], Accent[400]] as const,
  },
  afternoon: {
    greeting: '활기찬 오후예요',
    gradient: {
      light: ['#EEF1F8', Gray[50]] as const,
      dark: ['#171A28', Gray[950]] as const,
    },
    iconGradient: ['#5B8EC9', Accent[400]] as const,
  },
  evening: {
    greeting: '수고한 하루예요',
    gradient: {
      light: ['#F5EEF5', Gray[50]] as const,
      dark: ['#1C1520', Gray[950]] as const,
    },
    iconGradient: ['#D47C9A', Accent[400]] as const,
  },
  night: {
    greeting: '고요한 밤이에요',
    gradient: {
      light: ['#ECEEF8', Gray[50]] as const,
      dark: ['#151428', Gray[950]] as const,
    },
    iconGradient: [Accent[500], '#3A3570'] as const,
  },
};

// ─── 12. Lotto Colors ────────────────────────────────────────────

export const LottoColors = {
  cardBg: '#1E2333',
  button: '#5248A3',
  setLabel: 'rgba(255,255,255,0.6)',
  roundText: 'rgba(255,255,255,0.7)',
  title: '#FFFFFF',
} as const;

// ─── 13. Shadows ─────────────────────────────────────────────────

export const Shadows = {
  card: {
    shadowColor: Gray[800],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    boxShadow: '0 1px 8px rgba(45, 36, 56, 0.06)',
  },
  sm: {
    shadowColor: Gray[800],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    boxShadow: '0 1px 2px rgba(45, 36, 56, 0.04)',
  },
  md: {
    shadowColor: Gray[800],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    boxShadow: '0 1px 8px rgba(45, 36, 56, 0.06)',
  },
  lg: {
    shadowColor: Gray[800],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    boxShadow: '0 4px 16px rgba(45, 36, 56, 0.08)',
  },
};
