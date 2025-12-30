/**
 * useNarrationSync hook - Synchronize narration with playback
 * Ensures narration and music playback work together seamlessly
 */

'use client';

import { useEffect, useCallback } from 'react';
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
  const { currentMeasure, isPlaying: isMusicPlaying, pause: pauseMusic, seek } = usePlaybackStore();
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

  return {
    currentMeasure,
    isNarrating,
    isMusicPlaying,
    playNarration: () => commentary && speak(commentary, currentMeasure),
    stopNarration: stop,
  };
}

/**
 * Hook for managing narration during playback navigation
 */
export function useNarrationNavigation() {
  const { currentMeasure } = usePlaybackStore();
  const { stop, isPlaying } = useNarration();

  // Stop narration when navigating to different measure
  useEffect(() => {
    if (isPlaying) {
      stop();
    }
    // Only run when measure changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMeasure]);

  return {
    currentMeasure,
  };
}
