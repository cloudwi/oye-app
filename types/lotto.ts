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
  createdAt: string;
}

export interface LottoWinner {
  round: number;
  rank: string;
  numbers: number[];
  matchCount: number;
  bonusMatch: boolean;
  drawDate: string | null;
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
