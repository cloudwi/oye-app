import { apiClient } from './client';
import type {
  GroupSummary,
  GroupDetail,
  GroupTodayCompatibility,
  GroupCompatibilityResult,
  CreateGroupRequest,
  JoinGroupRequest,
  UpdateGroupRequest,
} from '@/types/group';

export const groupApi = {
  async create(data: CreateGroupRequest): Promise<GroupSummary> {
    const response = await apiClient.post<GroupSummary>('/api/v1/groups', data);
    return response.data;
  },

  async join(data: JoinGroupRequest): Promise<GroupSummary> {
    const response = await apiClient.post<GroupSummary>('/api/v1/groups/join', data);
    return response.data;
  },

  async getList(): Promise<GroupSummary[]> {
    const response = await apiClient.get<GroupSummary[]>('/api/v1/groups');
    return response.data;
  },

  async getDetail(id: number): Promise<GroupDetail> {
    const response = await apiClient.get<GroupDetail>(`/api/v1/groups/${id}`);
    return response.data;
  },

  async update(id: number, data: UpdateGroupRequest): Promise<GroupDetail> {
    const response = await apiClient.patch<GroupDetail>(`/api/v1/groups/${id}`, data);
    return response.data;
  },

  async deleteGroup(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/groups/${id}`);
  },

  async leave(id: number): Promise<void> {
    await apiClient.post(`/api/v1/groups/${id}/leave`);
  },

  async kickMember(id: number, userId: number): Promise<void> {
    await apiClient.delete(`/api/v1/groups/${id}/members/${userId}`);
  },

  async getTodayCompatibility(id: number): Promise<GroupTodayCompatibility> {
    const response = await apiClient.get<GroupTodayCompatibility>(`/api/v1/groups/${id}/compatibility`);
    return response.data;
  },

  async getPairCompatibility(id: number, userId: number): Promise<GroupCompatibilityResult> {
    const response = await apiClient.get<GroupCompatibilityResult>(`/api/v1/groups/${id}/compatibility/${userId}`);
    return response.data;
  },
};
