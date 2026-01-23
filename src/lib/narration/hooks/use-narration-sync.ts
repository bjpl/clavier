/**
 * useNarrationSync hook - Synchronize narration with playback
 * Ensures narration and music playback work together seamlessly
 */

'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { usePlaybackStore } from '../../stores/playback-store';
import { useNarration } from './use-narration';

/**
 * Synchronize narration with music playback
 */
export function useNarrationSync(
  commentary: string | undefined,
  options: {
    /** Auto-play narration when measure changes */
    autoPlay?: boolean;
    /** Pause music during narration */
    pauseMusicDuringNarration?: boolean;
    /** Auto-advance to next measure when narration ends */
    autoAdvanceOnNarrationEnd?: boolean;
  } = {}
) {
  // Use primitive selectors to prevent re-render loops
  const currentMeasure = usePlaybackStore((s) => s.currentMeasure);
  const isMusicPlaying = usePlaybackStore((s) => s.isPlaying);
  const pauseMusic = usePlaybackStore((s) => s.pause);
  const seek = usePlaybackStore((s) => s.seek);
  const {
    speak,
    stop,
    isPlaying: isNarrating,
    config,
    updateConfig,
  } = useNarration();

  const {
    autoPlay = false,
    pauseMusicDuringNarration = false,
    autoAdvanceOnNarrationEnd = false,
  } = options;

  // Update narration config based on options
  useEffect(() => {
    updateConfig({
      autoPlay,
      autoAdvance: autoAdvanceOnNarrationEnd,
    });
  }, [autoPlay, autoAdvanceOnNarrationEnd, updateConfig]);

  // Auto-play narration when measure changes
  useEffect(() => {
    if (autoPlay && commentary && config.autoPlay) {
      speak(commentary, currentMeasure);
    }
  }, [currentMeasure, commentary, autoPlay, speak, config.autoPlay]);

  // Pause music during narration if enabled
  useEffect(() => {
    if (pauseMusicDuringNarration && isNarrating && isMusicPlaying) {
      pauseMusic();
    }
  }, [isNarrating, isMusicPlaying, pauseMusicDuringNarration, pauseMusic]);

  // Stop narration when music starts playing (optional)
  useEffect(() => {
    if (isMusicPlaying && isNarrating && pauseMusicDuringNarration) {
      stop();
    }
  }, [isMusicPlaying, isNarrating, pauseMusicDuringNarration, stop]);

  // Auto-advance when narration ends
  const handleNarrationEnd = useCallback(() => {
    if (autoAdvanceOnNarrationEnd && config.autoAdvance) {
      seek(currentMeasure + 1);
    }
  }, [autoAdvanceOnNarrationEnd, config.autoAdvance, currentMeasure, seek]);

  // Listen for narration end events
  useEffect(() => {
    if (!isNarrating && commentary) {
      // Narration ended
      handleNarrationEnd();
    }
  }, [isNarrating, commentary, handleNarrationEnd]);

  // CRITICAL: Memoize callbacks to prevent re-render loops
  const playNarration = useCallback(() => {
    if (commentary) {
      speak(commentary, currentMeasure);
    }
  }, [commentary, speak, currentMeasure]);

  // CRITICAL: Memoize the return object to prevent infinite re-render loops
  return useMemo(() => ({
    currentMeasure,
    isNarrating,
    isMusicPlaying,
    playNarration,
    stopNarration: stop,
  }), [currentMeasure, isNarrating, isMusicPlaying, playNarration, stop]);
}

/**
 * Hook for managing narration during playback navigation
 */
export function useNarrationNavigation() {
  // Use primitive selector to prevent re-render loops
  const currentMeasure = usePlaybackStore((s) => s.currentMeasure);
  const { stop, isPlaying } = useNarration();

  // Stop narration when navigating to different measure
  useEffect(() => {
    if (isPlaying) {
      stop();
    }
    // Only run when measure changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMeasure]);

  // CRITICAL: Memoize the return object to prevent infinite re-render loops
  return useMemo(() => ({
    currentMeasure,
  }), [currentMeasure]);
}
