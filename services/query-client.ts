import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - reduce unnecessary refetches
      gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      placeholderData: (previousData: any) => previousData,
    },
  },
});
