export interface Fortune {
  id: number;
  content: string;
  score: number | null;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO datetime
}
