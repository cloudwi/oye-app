export type FortuneCategory = 'love' | 'money' | 'health' | 'work' | 'study';

export interface CategoryFortune {
  category: FortuneCategory;
  score: number; // 1-100
  title: string;
  description: string;
  advice: string;
}

export interface Fortune {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  overallScore: number; // 1-100
  overallMessage: string;
  luckyColor: string;
  luckyNumber: number;
  luckyItem: string;
  categories: CategoryFortune[];
  createdAt: string;
}

export interface FortuneHistory {
  fortunes: Fortune[];
  hasMore: boolean;
  nextPage?: number;
}

export const CATEGORY_LABELS: Record<FortuneCategory, string> = {
  love: '연애운',
  money: '금전운',
  health: '건강운',
  work: '직장운',
  study: '학업운',
};

export const CATEGORY_ICONS: Record<FortuneCategory, string> = {
  love: 'heart.fill',
  money: 'wonsign.circle.fill',
  health: 'heart.text.square.fill',
  work: 'briefcase.fill',
  study: 'book.fill',
};
