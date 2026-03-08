export type LottoSource = 'AI' | 'MANUAL' | 'QR_SCAN';

export interface LottoRecommendation {
  id: number;
  round: number;
  setNumber: number;
  numbers: number[];
  rank: string | null;
  matchCount: number;
  bonusMatch: boolean;
  evaluated: boolean;
  prizeAmount: number | null;
  drawNumbers: number[] | null;
  drawBonusNumber: number | null;
  source: LottoSource;
  createdAt: string;
}

export interface LottoWinner {
  round: number;
  rank: string;
  numbers: number[];
  matchCount: number;
  bonusMatch: boolean;
  drawDate: string | null;
  nickname: string;
}

export interface LottoRound {
  round: number;
  numbers: number[];
  bonusNumber: number;
  drawDate: string;
  firstPrizeAmount: number | null;
}

export interface LottoMyStats {
  totalPrize: number;
  winCount: number;
}

export interface LottoRegisterRequest {
  round: number;
  source: LottoSource;
  numberSets: number[][];
}

export interface ParsedLottoQR {
  round: number;
  numberSets: number[][];
}
