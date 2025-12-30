'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

/**
 * Query Provider Component
 *
 * Provides TanStack Query context to the application with optimized defaults.
 * Includes DevTools in development mode for debugging queries and mutations.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance per component to avoid sharing state between requests in SSR
  // This is the recommended approach for Next.js App Router
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data considered fresh for 60 seconds
            // During this time, queries won't refetch on mount
            staleTime: 60 * 1000,

            // Cache persists for 5 minutes after last query usage
            // Helps with navigation back and forth
            gcTime: 5 * 60 * 1000,

            // Retry failed queries 1 time before showing error
            retry: 1,

            // Don't refetch on window focus in development (noisy)
            // Enable in production for fresh data
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',

            // Refetch on reconnect to ensure data consistency
            refetchOnReconnect: true,

            // Refetch on mount if data is stale
            refetchOnMount: true,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,

            // Show error notifications for mutations
            onError: (error) => {
              console.error('Mutation error:', error);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show DevTools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
