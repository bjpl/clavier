'use client';

import { QueryProvider } from './query-provider';
import { AudioProvider } from './audio-provider';

/**
 * Combined Providers Component
 *
 * Wraps all global providers in the correct order.
 * This makes it easy to add new providers and maintain the provider tree.
 *
 * Order matters:
 * 1. QueryProvider - Data fetching and caching
 * 2. AudioProvider - Audio engine and playback
 * 3. Future providers (Theme, Auth, etc.) can be added here
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AudioProvider autoInit>
        {children}
      </AudioProvider>
    </QueryProvider>
  );
}

// Re-export individual providers for direct usage if needed
export { QueryProvider } from './query-provider';
export { AudioProvider, useAudio, useAudioEngine, useAudioReady, useAudioLoading, useAudioVolume } from './audio-provider';
export type { AudioContextValue, AudioProviderProps } from './audio-provider';
