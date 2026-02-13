// API 응답에 맞는 Fortune 타입
export interface Fortune {
  id: number;
  content: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO datetime
}

export interface FortuneHistory {
  fortunes: Fortune[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  code: string | null;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
