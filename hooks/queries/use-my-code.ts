import { useQuery } from '@tanstack/react-query';
import { connectionApi } from '@/services/api/connection';
import { queryKeys } from '@/services/query-keys';

export function useMyCode() {
  return useQuery({
    queryKey: queryKeys.connection.myCode(),
    queryFn: () => connectionApi.getMyCode(),
  });
}
