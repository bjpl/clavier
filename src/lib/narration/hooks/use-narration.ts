/**
 * useNarration hook - Main React hook for TTS narration
 * Provides easy access to narration controls and state
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useNarrationStore, selectNarrationState, selectNarrationConfig } from '../narration-controller';
import type { Voice, TTSProvider, NarrationEvent } from '../types/narration';

/**
 * Main narration hook
 * Provides narration controls and state
 */
export function useNarration() {
  const state = useNarrationStore(selectNarrationState);
  const config = useNarrationStore(selectNarrationConfig);
  const {
    initialize,
    play,
    pause,
    resume,
    stop,
    setRate,
    setPitch,
    setVolume,
    toggleMute,
    setVoice,
    setProvider,
    clearCache,
    updateConfig,
    availableVoices,
    error,
    currentText,
    currentMeasure,
  } = useNarrationStore();

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const speak = useCallback(
    async (text: string, measure?: number) => {
      await play(text, measure);
    },
    [play]
  );

  return {
    // State
    ...state,
    config,
    availableVoices,
    error,
    currentText,
    currentMeasure,

    // Controls
    speak,
    pause,
    resume,
    stop,
    setRate,
    setPitch,
    setVolume,
    toggleMute,
    setVoice,
    setProvider,
    clearCache,
    updateConfig,
  };
}

/**
 * Hook for narration event listeners
 */
export function useNarrationEvents(
  callback: (event: NarrationEvent) => void,
  deps: React.DependencyList = []
) {
  const { addEventListener, removeEventListener } = useNarrationStore();

  useEffect(() => {
    const listener = callback;
    addEventListener(listener);
    return () => removeEventListener(listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addEventListener, removeEventListener, ...deps]);
}

/**
 * Hook for auto-playing narration when text changes
 */
export function useAutoNarration(
  text: string | undefined,
  enabled: boolean = false,
  measure?: number
) {
  const { speak, config } = useNarration();

  useEffect(() => {
    if (enabled && text && config.autoPlay) {
      speak(text, measure);
    }
  }, [text, enabled, measure, speak, config.autoPlay]);
}

/**
 * Hook for managing narration voice
 */
export function useNarrationVoice() {
  const { availableVoices, config, setVoice, setProvider } = useNarrationStore();

  const currentVoice = config.voice;
  const currentProvider = config.provider;

  const changeVoice = useCallback(
    async (voice: Voice) => {
      await setVoice(voice);
    },
    [setVoice]
  );

  const changeProvider = useCallback(
    async (provider: TTSProvider) => {
      await setProvider(provider);
    },
    [setProvider]
  );

  return {
    voices: availableVoices,
    currentVoice,
    currentProvider,
    changeVoice,
    changeProvider,
  };
}
