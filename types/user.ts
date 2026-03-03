export type Gender = 'MALE' | 'FEMALE';
export type CalendarType = 'SOLAR' | 'LUNAR';
export type BloodType = 'A' | 'B' | 'O' | 'AB';
export type SocialProvider = 'KAKAO' | 'APPLE';
export type UserRole = 'USER' | 'ADMIN';

// API 응답에 맞는 User 타입
export interface User {
  id: number;
  provider: SocialProvider | null;
  name: string;
  birthDate: string | null; // YYYY-MM-DD
  birthTime: string | null; // HH:mm
  gender: Gender | null;
  calendarType: CalendarType | null;
  occupation: string | null;
  mbti: string | null;
  bloodType: BloodType | null;
  interests: string | null;
  role: UserRole;
  fortuneScheduleHour: number;
  createdAt: string; // ISO datetime
}

export interface UserUpdateRequest {
  name: string;
  birthDate?: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm
  gender?: Gender;
  calendarType?: CalendarType;
  occupation?: string;
  mbti?: string;
  bloodType?: BloodType;
  interests?: string;
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