import { ScoreColors } from '@/constants/theme';

export function getScoreColor(score: number): string {
  if (score >= 80) return ScoreColors.excellent;
  if (score >= 60) return ScoreColors.good;
  if (score >= 40) return ScoreColors.average;
  if (score >= 20) return ScoreColors.belowAverage;
  return ScoreColors.poor;
}
