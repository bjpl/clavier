'use client';

import { ThemeProvider } from 'next-themes';
import { QueryProvider } from './query-provider';
import { AudioProvider } from './audio-provider';

/**
 * Combined Providers Component
 *
 * Wraps all global providers in the correct order.
 * This makes it easy to add new providers and maintain the provider tree.
 *
 * Order matters:
 * 1. ThemeProvider - Theme/color scheme management (must wrap UI)
 * 2. QueryProvider - Data fetching and caching
 * 3. AudioProvider - Audio engine and playback
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AudioProvider autoInit>
          {children}
        </AudioProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

// Re-export individual providers for direct usage if needed
export { QueryProvider } from './query-provider';
export { AudioProvider, useAudio, useAudioEngine, useAudioReady, useAudioLoading, useAudioVolume } from './audio-provider';
export type { AudioContextValue, AudioProviderProps } from './audio-provider';
