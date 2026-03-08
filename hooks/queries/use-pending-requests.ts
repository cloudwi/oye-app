import { useQuery } from '@tanstack/react-query';
import { connectionApi } from '@/services/api/connection';
import { queryKeys } from '@/services/query-keys';

export function usePendingRequests() {
  return useQuery({
    queryKey: queryKeys.connection.pending(),
    queryFn: () => connectionApi.getPendingRequests(),
  });
}
