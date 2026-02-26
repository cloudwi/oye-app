import { apiClient } from './client';

export interface AppUpdateCheckResponse {
  forceUpdate: boolean;
  minVersion: string;
  storeUrl: string;
}

export const appApi = {
  async checkUpdate(platform: string, version: string): Promise<AppUpdateCheckResponse> {
    const response = await apiClient.get<AppUpdateCheckResponse>('/api/app/check-update', {
      params: { platform, version },
    });
    return response.data;
  },
};
