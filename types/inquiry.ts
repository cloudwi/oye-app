export type InquiryStatus = 'PENDING' | 'ANSWERED';

export interface InquiryComment {
  id: number;
  adminName: string;
  content: string;
  createdAt: string; // ISO datetime
}

export interface Inquiry {
  id: number;
  title: string;
  content: string;
  status: InquiryStatus;
  comments: InquiryComment[];
  createdAt: string; // ISO datetime
}

export interface InquiryCreateRequest {
  title: string;
  content: string;
}
