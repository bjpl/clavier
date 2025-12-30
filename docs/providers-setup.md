# Global Providers Infrastructure

## Overview

This document describes the global providers infrastructure for Clavier, implementing TanStack Query for data fetching and state management.

## Files Created

### 1. Query Provider (`src/components/providers/query-provider.tsx`)

**Purpose**: Provides TanStack Query context to the application with optimized defaults.

**Key Features**:
- SSR-safe QueryClient instantiation (created per-component instance)
- Optimized caching configuration:
  - `staleTime`: 60 seconds (data freshness)
  - `gcTime`: 5 minutes (cache persistence)
  - `retry`: 1 attempt before failing
  - Smart refetch behavior based on environment
- Development DevTools integration
- Error handling for mutations
- TypeScript-first implementation

**Configuration Highlights**:
```typescript
staleTime: 60 * 1000,        // 60s fresh data
gcTime: 5 * 60 * 1000,       // 5min cache
refetchOnWindowFocus: prod,  // Only in production
refetchOnReconnect: true,    // Always refetch on reconnect
```

### 2. Providers Index (`src/components/providers/index.tsx`)

**Purpose**: Central export point for all application providers.

**Architecture**:
- Combines all providers in correct order
- Currently wraps QueryProvider
- Extensible for future providers (Theme, Auth, etc.)
- Re-exports individual providers for flexibility

**Provider Order**:
1. QueryProvider (data fetching/caching)
2. *Future providers will be added here*

### 3. Root Layout Update (`src/app/layout.tsx`)

**Changes**:
- Imported `Providers` component
- Wrapped `children` with `<Providers>` component
- Maintains existing layout structure (Header, Footer)
- SSR-compatible with `suppressHydrationWarning`

## Architecture Decisions

### Why Per-Component QueryClient?

Instead of a singleton QueryClient, we instantiate a new client per component instance. This is the **recommended approach for Next.js App Router** because:

1. **SSR Safety**: Prevents state sharing between server requests
2. **Isolation**: Each render gets fresh state
3. **Memory Safety**: No memory leaks from shared state
4. **React 18 Compatible**: Works with streaming and Suspense

### Configuration Rationale

**Stale Time (60s)**:
- Balance between freshness and performance
- Prevents unnecessary refetches for frequent navigation
- Suitable for music theory data (relatively static)

**GC Time (5min)**:
- Long enough to support back/forward navigation
- Short enough to prevent excessive memory usage
- Allows quick return to cached pages

**Retry Policy (1 attempt)**:
- Fail fast for better UX
- Avoids hanging on network issues
- Can be overridden per-query if needed

**Refetch on Window Focus**:
- Disabled in development (reduces noise during coding)
- Enabled in production (ensures data freshness)

## Next.js 14 Best Practices

### Client Components

All provider files use `'use client'` directive because:
- They contain React hooks (`useState`)
- They manage client-side state
- They integrate with browser APIs (DevTools)

### SSR Compatibility

The implementation is SSR-safe:
- QueryClient created per-instance (not module-level)
- No browser-only APIs in module scope
- DevTools conditionally rendered client-side only

### TypeScript Integration

Full TypeScript support:
- Proper type definitions for all components
- Type-safe query configurations
- IntelliSense-friendly API

## Usage Examples

### Basic Query

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';

export function ScalesList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['scales'],
    queryFn: async () => {
      const res = await fetch('/api/scales');
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render scales */}</div>;
}
```

### Mutation Example

```typescript
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function SaveProgress() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (progress: Progress) => {
      const res = await fetch('/api/progress', {
        method: 'POST',
        body: JSON.stringify(progress),
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });

  return (
    <button onClick={() => mutation.mutate({ score: 100 })}>
      Save Progress
    </button>
  );
}
```

### Custom Configuration

```typescript
// Override defaults for specific query
const { data } = useQuery({
  queryKey: ['real-time-data'],
  queryFn: fetchRealTimeData,
  staleTime: 0,           // Always fresh
  refetchInterval: 5000,  // Poll every 5s
});
```

## Development Tools

### React Query DevTools

- **Enabled**: Development mode only
- **Position**: Bottom-right corner
- **Initial State**: Collapsed
- **Features**:
  - Query inspection
  - Cache visualization
  - Mutation tracking
  - Refetch controls
  - Time-travel debugging

### Accessing DevTools

DevTools are automatically available in development. Click the TanStack Query icon in the bottom-right corner to open.

## Future Enhancements

### Potential Additional Providers

1. **Theme Provider**
   - Dark/light mode
   - Color scheme persistence
   - System preference detection

2. **Auth Provider**
   - User authentication state
   - Session management
   - Protected routes

3. **Audio Provider**
   - Shared audio context
   - Sound synthesis
   - Global audio settings

4. **Toast Provider**
   - Global notifications
   - Error messages
   - Success confirmations

### Query Client Enhancements

- Custom error handling per error type
- Retry strategies based on error codes
- Background sync for offline support
- Optimistic updates for mutations

## Testing Considerations

### Unit Testing Providers

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

export const renderWithProviders = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
};
```

## Performance Monitoring

Monitor these metrics:
- Cache hit/miss ratio
- Query response times
- Memory usage (cache size)
- Refetch frequency
- Mutation success rates

## Configuration Updates (Next.js 16 Compatibility)

### Turbopack Configuration

Updated `next.config.js` for Next.js 16 compatibility:

```javascript
turbopack: {
  root: './',
  resolveAlias: {
    'tone': 'tone/build/esm/index.js',
  },
}
```

**Changes Made**:
- Removed deprecated `swcMinify` option (enabled by default in Next.js 16)
- Added Turbopack configuration block
- Set explicit root directory for Turbopack
- Maintained webpack config for fallback compatibility
- Configured Tone.js alias for both Turbopack and webpack

**Why These Changes**:
1. Next.js 16 uses Turbopack by default (faster builds)
2. `swcMinify` is deprecated and causes warnings
3. Explicit root prevents workspace detection issues
4. Dual configuration ensures compatibility with both bundlers

## Troubleshooting

### Common Issues

**1. "QueryClient not found"**
- Ensure `Providers` wraps your component tree
- Check that component is inside `<Providers>`

**2. Queries not caching**
- Verify `staleTime` and `gcTime` settings
- Check query keys are consistent
- Ensure data is serializable

**3. DevTools not appearing**
- Confirm `NODE_ENV=development`
- Check browser console for errors
- Verify ReactQueryDevtools import

**4. SSR hydration errors**
- Use `suppressHydrationWarning` on html tag
- Ensure QueryClient created per-instance
- Don't use browser APIs during SSR

**5. Next.js 16 build errors**
- Update `next.config.js` with Turbopack settings
- Remove deprecated options (`swcMinify`)
- Set explicit `turbopack.root` path

## References

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Next.js 16 Turbopack](https://nextjs.org/docs/app/api-reference/next-config-js/turbopack)

---

**Last Updated**: December 29, 2025
**Version**: 1.0.0
**Status**: Implemented and configured for Next.js 16
