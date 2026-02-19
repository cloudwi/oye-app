export type InquiryStatus = 'PENDING' | 'ANSWERED';

export interface Inquiry {
  id: number;
  title: string;
  content: string;
  status: InquiryStatus;
  adminReply: string | null;
  adminRepliedAt: string | null; // ISO datetime
  createdAt: string; // ISO datetime
}

export interface InquiryCreateRequest {
  title: string;
  content: string;
}
