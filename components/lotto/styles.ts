import { StyleSheet } from 'react-native';
import { Spacing, FontSizes } from '@/constants/theme';

/**
 * Shared styles used across lotto-related screens.
 */
export const lottoStyles = StyleSheet.create({
  /** Row containing a set label + ball row (+ optional rank badge) */
  numberSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  /** Horizontal row of LottoBall components */
  ballRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    flexShrink: 1,
  },
  /** Set label (A, B, C...) — base without color */
  setLabelBase: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    width: 20,
  },
});
