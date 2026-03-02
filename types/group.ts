import type { RelationType } from './connection';

export interface GroupSummary {
  id: number;
  name: string;
  relationType: RelationType;
  memberCount: number;
  isOwner: boolean;
  createdAt: string;
}

export interface GroupMember {
  userId: number;
  name: string | null;
  isOwner: boolean;
  joinedAt: string;
}

export interface GroupDetail {
  id: number;
  name: string;
  relationType: RelationType;
  inviteCode: string;
  ownerId: number;
  ownerName: string | null;
  members: GroupMember[];
  createdAt: string;
}

export interface GroupCompatibilityResult {
  userAId: number;
  userAName: string | null;
  userBId: number;
  userBName: string | null;
  score: number;
  content: string;
  date: string;
}

export interface GroupTodayCompatibility {
  groupId: number;
  date: string;
  members: Record<number, string | null>;
  compatibilities: GroupCompatibilityResult[];
}

export interface CreateGroupRequest {
  name: string;
  relationType: RelationType;
}

export interface JoinGroupRequest {
  code: string;
}

export interface UpdateGroupRequest {
  name: string;
}

export interface KickMemberRequest {
  groupId: number;
  userId: number;
}
