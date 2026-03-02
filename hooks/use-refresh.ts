import { useState, useCallback } from 'react';

export function useRefresh(...refetchFns: Array<() => Promise<any>>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all(refetchFns.map((fn) => fn()));
    setRefreshing(false);
  }, refetchFns);

  return { refreshing, onRefresh };
}
