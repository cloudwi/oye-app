export type Gender = 'MALE' | 'FEMALE';
export type CalendarType = 'SOLAR' | 'LUNAR';

// API 응답에 맞는 User 타입
export interface User {
  id: number;
  kakaoId: string;
  name: string;
  birthDate: string | null; // YYYY-MM-DD
  gender: Gender | null;
  calendarType: CalendarType | null;
  createdAt: string; // ISO datetime
}

export interface UserUpdateRequest {
  name: string;
  birthDate?: string; // YYYY-MM-DD
  gender?: Gender;
  calendarType?: CalendarType;
}

export interface UserSettings {
  darkMode: 'system' | 'light' | 'dark';
  notificationEnabled: boolean;
  notificationTime: string; // HH:mm format (default: "08:00")
}

export interface OnboardingState {
  completed: boolean;
  currentStep: 'welcome' | 'birthdate' | 'notification' | 'done';
}