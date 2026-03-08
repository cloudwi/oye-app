import { apiClient } from './client';
import type { Connection, ConnectRequest, MyCodeResponse } from '@/types/connection';

export const connectionApi = {
  async getMyCode(): Promise<MyCodeResponse> {
    const response = await apiClient.get<MyCodeResponse>('/api/v1/connections/my-code');
    return response.data;
  },

  async connect(data: ConnectRequest): Promise<Connection> {
    const response = await apiClient.post<Connection>('/api/v1/connections', data);
    return response.data;
  },

  async getList(): Promise<Connection[]> {
    const response = await apiClient.get<Connection[]>('/api/v1/connections');
    return response.data;
  },

  async getPendingRequests(): Promise<Connection[]> {
    const response = await apiClient.get<Connection[]>('/api/v1/connections/pending');
    return response.data;
  },

  async acceptConnection(id: number): Promise<Connection> {
    const response = await apiClient.patch<Connection>(`/api/v1/connections/${id}/accept`);
    return response.data;
  },

  async rejectConnection(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/connections/${id}/reject`);
  },

  async deleteConnection(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/connections/${id}`);
  },

  async setLover(id: number): Promise<Connection> {
    const response = await apiClient.patch<Connection>(`/api/v1/connections/${id}/lover`);
    return response.data;
  },

  async unsetLover(id: number): Promise<Connection> {
    const response = await apiClient.delete<Connection>(`/api/v1/connections/${id}/lover`);
    return response.data;
  },
};
