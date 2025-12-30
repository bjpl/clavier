'use client';

import { QueryProvider } from './query-provider';

/**
 * Combined Providers Component
 *
 * Wraps all global providers in the correct order.
 * This makes it easy to add new providers and maintain the provider tree.
 *
 * Order matters:
 * 1. QueryProvider - Data fetching and caching
 * 2. Future providers (Theme, Auth, etc.) can be added here
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  );
}

// Re-export individual providers for direct usage if needed
export { QueryProvider } from './query-provider';
