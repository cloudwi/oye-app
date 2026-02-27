import type { User, UserUpdateRequest } from '@/types/user';

/**
 * Build a UserUpdateRequest from the current user, applying the given overrides.
 * Eliminates the repetitive "spread every field" pattern in settings screens.
 */
export function buildUpdatePayload(
  user: User | null,
  overrides: Partial<Omit<UserUpdateRequest, 'name'>> & { name?: string },
): UserUpdateRequest {
  return {
    name: overrides.name ?? user?.name ?? '사용자',
    birthDate: overrides.birthDate ?? user?.birthDate ?? undefined,
    birthTime: overrides.birthTime ?? user?.birthTime ?? undefined,
    gender: overrides.gender ?? user?.gender ?? undefined,
    calendarType: overrides.calendarType ?? user?.calendarType ?? undefined,
    occupation: overrides.occupation ?? user?.occupation ?? undefined,
    mbti: overrides.mbti ?? user?.mbti ?? undefined,
    bloodType: overrides.bloodType ?? user?.bloodType ?? undefined,
    interests: overrides.interests ?? user?.interests ?? undefined,
  };
}
