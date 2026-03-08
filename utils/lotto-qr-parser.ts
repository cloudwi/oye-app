import type { ParsedLottoQR } from '@/types/lotto';

export function parseLottoQR(url: string): ParsedLottoQR | null {
  try {
    const match = url.match(/[?&]v=([^&]+)/);
    if (!match) return null;

    const v = decodeURIComponent(match[1]);
    const segments = v.split('q');
    if (segments.length < 2) return null;

    const round = parseInt(segments[0], 10);
    if (isNaN(round) || round <= 0) return null;

    const numberSets: number[][] = [];
    for (let i = 1; i < segments.length; i++) {
      const raw = segments[i].substring(0, 12);
      if (raw.length < 12) continue;

      const numbers: number[] = [];
      for (let j = 0; j < 12; j += 2) {
        numbers.push(parseInt(raw.substring(j, j + 2), 10));
      }

      if (numbers.some((n) => isNaN(n) || n < 1 || n > 45)) continue;
      if (new Set(numbers).size !== 6) continue;

      numberSets.push(numbers.sort((a, b) => a - b));
    }

    if (numberSets.length === 0) return null;

    return { round, numberSets };
  } catch {
    return null;
  }
}
