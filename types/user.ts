export interface User {
  id: string;
  birthDate: string; // ISO date string (YYYY-MM-DD)
  deviceToken?: string;
  notificationEnabled: boolean;
  notificationTime?: string; // HH:mm format
  createdAt: string;
  updatedAt: string;
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
