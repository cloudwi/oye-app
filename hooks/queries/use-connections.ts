import { useQuery } from '@tanstack/react-query';
import { connectionApi } from '@/services/api/connection';
import { queryKeys } from '@/services/query-keys';

export function useConnections() {
  return useQuery({
    queryKey: queryKeys.connection.list(),
    queryFn: () => connectionApi.getList(),
  });
}
