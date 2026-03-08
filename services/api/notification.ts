import { apiClient } from './client';
import type { UserNotification, UnreadCountResponse } from '@/types/notification';
import type { PageResponse } from '@/types/api';

export const notificationApi = {
  async getList(page = 0, size = 20): Promise<PageResponse<UserNotification>> {
    const response = await apiClient.get<PageResponse<UserNotification>>(
      '/api/v1/notifications',
      { params: { page, size } },
    );
    return response.data;
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await apiClient.get<UnreadCountResponse>(
      '/api/v1/notifications/unread-count',
    );
    return response.data;
  },

  async markAsRead(id: number): Promise<void> {
    await apiClient.patch(`/api/v1/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/api/v1/notifications/read-all');
  },
};
