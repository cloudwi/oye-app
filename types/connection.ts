export type RelationType = 'LOVER' | 'FRIEND' | 'FAMILY' | 'COLLEAGUE';
export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Connection {
  id: number;
  partnerId: number;
  partnerName: string;
  partnerNickname: string | null;
  relationType: RelationType;
  latestScore: number | null;
  latestContent: string | null;
  status: ConnectionStatus;
  createdAt: string;
}

export interface ConnectRequest {
  code?: string;
  nickname?: string;
  relationType: RelationType;
}

export interface MyCodeResponse {
  code: string;
  nickname: string | null;
}
