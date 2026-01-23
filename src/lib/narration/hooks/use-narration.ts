/**
 * useNarration hook - Main React hook for TTS narration
 * Provides easy access to narration controls and state
 */

'use client';

import { useEffect, useCallback, useMemo } from 'react';
import {
  useNarrationStore,
  selectNarrationConfig,
  selectIsPlaying,
  selectIsLoading,
  selectProgress,
  selectNarrationVoices,
  selectNarrationError,
  selectCurrentText,
  selectCurrentMeasure,
  selectInitialize,
  selectPlay,
  selectPause,
  selectResume,
  selectStop,
  selectSetRate,
  selectSetPitch,
  selectSetVolume,
  selectToggleMute,
  selectSetVoice,
  selectSetProvider,
  selectClearCache,
  selectUpdateConfig,
  selectAddEventListener,
  selectRemoveEventListener,
} from '../narration-controller';
import type { Voice, TTSProvider, NarrationEvent } from '../types/narration';

/**
 * Main narration hook
 * Uses primitive selectors to prevent infinite re-render loops
 */
export function useNarration() {
  // Use primitive selectors for state values
  const isPlaying = useNarrationStore(selectIsPlaying);
  const isLoading = useNarrationStore(selectIsLoading);
  const progress = useNarrationStore(selectProgress);
  const config = useNarrationStore(selectNarrationConfig);
  const availableVoices = useNarrationStore(selectNarrationVoices);
  const error = useNarrationStore(selectNarrationError);
  const currentText = useNarrationStore(selectCurrentText);
  const currentMeasure = useNarrationStore(selectCurrentMeasure);

  // Use action selectors (these are stable function references)
  const initialize = useNarrationStore(selectInitialize);
  const play = useNarrationStore(selectPlay);
  const pause = useNarrationStore(selectPause);
  const resume = useNarrationStore(selectResume);
  const stop = useNarrationStore(selectStop);
  const setRate = useNarrationStore(selectSetRate);
  const setPitch = useNarrationStore(selectSetPitch);
  const setVolume = useNarrationStore(selectSetVolume);
  const toggleMute = useNarrationStore(selectToggleMute);
  const setVoice = useNarrationStore(selectSetVoice);
  const setProvider = useNarrationStore(selectSetProvider);
  const clearCache = useNarrationStore(selectClearCache);
  const updateConfig = useNarrationStore(selectUpdateConfig);

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

  // CRITICAL: Memoize the return object to prevent infinite re-render loops
  return useMemo(() => ({
    // State
    isPlaying,
    isLoading,
    progress,
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
  }), [
    isPlaying,
    isLoading,
    progress,
    config,
    availableVoices,
    error,
    currentText,
    currentMeasure,
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
  ]);
}

/**
 * Hook for narration event listeners
 * Uses primitive selectors to prevent infinite re-render loops
 */
export function useNarrationEvents(
  callback: (event: NarrationEvent) => void,
  deps: React.DependencyList = []
) {
  const addEventListener = useNarrationStore(selectAddEventListener);
  const removeEventListener = useNarrationStore(selectRemoveEventListener);

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
 * Uses primitive selectors to prevent infinite re-render loops
 */
export function useNarrationVoice() {
  const availableVoices = useNarrationStore(selectNarrationVoices);
  const config = useNarrationStore(selectNarrationConfig);
  const setVoice = useNarrationStore(selectSetVoice);
  const setProvider = useNarrationStore(selectSetProvider);

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

  // CRITICAL: Memoize the return object to prevent infinite re-render loops
  return useMemo(() => ({
    voices: availableVoices,
    currentVoice,
    currentProvider,
    changeVoice,
    changeProvider,
  }), [availableVoices, currentVoice, currentProvider, changeVoice, changeProvider]);
}
