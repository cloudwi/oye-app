export type RelationType = 'LOVER' | 'FRIEND' | 'FAMILY' | 'COLLEAGUE';

export interface Connection {
  id: number;
  partnerName: string;
  relationType: RelationType;
  latestScore: number | null;
  createdAt: string;
}

export interface ConnectRequest {
  code: string;
  relationType: RelationType;
}

export interface MyCodeResponse {
  code: string;
}
