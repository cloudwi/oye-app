export type NotificationType = 'GENERAL' | 'FORTUNE' | 'COMPATIBILITY' | 'CONNECTION' | 'GROUP' | 'LOTTO';

export interface UserNotification {
  id: number;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  metadata: string | null;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}
