export interface CompatibilityResult {
  id: number;
  score: number;
  content: string;
  relationFortune: string | null;
  date: string; // YYYY-MM-DD
  createdAt: string;
}
