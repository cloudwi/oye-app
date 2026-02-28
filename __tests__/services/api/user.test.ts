import { apiClient } from '@/services/api/client';
import { userApi } from '@/services/api/user';
import type { UserUpdateRequest } from '@/types/user';

jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), handlers: [] },
      response: { use: jest.fn(), handlers: [] },
    },
    defaults: { headers: { common: {} } },
  },
}));

const mockUser = {
  id: 1,
  provider: 'KAKAO',
  name: 'Test User',
  birthDate: '1990-01-15',
  birthTime: '08:30',
  gender: 'MALE',
  calendarType: 'SOLAR',
  occupation: null,
  mbti: null,
  bloodType: null,
  interests: null,
  createdAt: '2025-01-01T00:00:00Z',
};

describe('userApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('should call GET /api/users/me and return user data', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockUser });

      const result = await userApi.getMe();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/users/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateMe', () => {
    it('should call PUT /api/users/me with data and return updated user', async () => {
      const updateData: UserUpdateRequest = {
        name: 'Updated Name',
        birthDate: '1990-06-20',
        gender: 'FEMALE',
      };
      const updatedUser = { ...mockUser, ...updateData };
      (apiClient.put as jest.Mock).mockResolvedValue({ data: updatedUser });

      const result = await userApi.updateMe(updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/api/v1/users/me', updateData);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteMe', () => {
    it('should call DELETE /api/users/me', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({});

      await userApi.deleteMe();

      expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/users/me');
    });
  });
});
