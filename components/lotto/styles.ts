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
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    flexShrink: 1,
  },
  /** Set label (A, B, C...) — base without color */
  setLabelBase: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    width: 20,
  },
  /** Section header row (title + optional "더보기" link) */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  sectionMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionMoreText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  /** Match count text with color-coding */
  matchCountText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'right',
  },
});
