/**
 * Settings Hooks
 *
 * React hooks for accessing and modifying user settings.
 * Provides type-safe, optimized access to the settings store.
 */

import { useCallback } from 'react';
import { useSettingsStore } from '@/lib/settings/settings-store';
import type { Theme, AnnotationLayer, UserSettings } from '@/lib/settings/settings-schema';

/**
 * Main hook for accessing settings
 * Uses the entire store - consider using specific selectors for better performance
 */
export function useSettings() {
  return useSettingsStore();
}

/**
 * Hook for theme settings
 */
export function useTheme() {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  return { theme, setTheme };
}

/**
 * Hook for score display settings
 */
export function useScoreSettings() {
  const zoom = useSettingsStore((state) => state.scoreZoom);
  const voiceColors = useSettingsStore((state) => state.voiceColorsEnabled);
  const showAnnotations = useSettingsStore((state) => state.showAnnotations);
  const annotationLayers = useSettingsStore((state) => state.annotationLayers);

  const setZoom = useSettingsStore((state) => state.setScoreZoom);
  const increaseZoom = useSettingsStore((state) => state.increaseZoom);
  const decreaseZoom = useSettingsStore((state) => state.decreaseZoom);
  const resetZoom = useSettingsStore((state) => state.resetZoom);
  const toggleVoiceColors = useSettingsStore((state) => state.toggleVoiceColors);
  const toggleAnnotations = useSettingsStore((state) => state.toggleAnnotations);
  const toggleAnnotationLayer = useSettingsStore((state) => state.toggleAnnotationLayer);
  const setAnnotationLayers = useSettingsStore((state) => state.setAnnotationLayers);

  return {
    // State
    zoom,
    voiceColors,
    showAnnotations,
    annotationLayers,
    // Actions
    setZoom,
    increaseZoom,
    decreaseZoom,
    resetZoom,
    toggleVoiceColors,
    toggleAnnotations,
    toggleAnnotationLayer,
    setAnnotationLayers,
  };
}

/**
 * Hook for layout settings
 */
export function useLayoutSettings() {
  const keyboardVisible = useSettingsStore((state) => state.keyboardVisible);
  const sidebarOpen = useSettingsStore((state) => state.sidebarOpen);
  const splitPosition = useSettingsStore((state) => state.splitPosition);

  const toggleKeyboard = useSettingsStore((state) => state.toggleKeyboard);
  const setKeyboardVisible = useSettingsStore((state) => state.setKeyboardVisible);
  const toggleSidebar = useSettingsStore((state) => state.toggleSidebar);
  const setSidebarOpen = useSettingsStore((state) => state.setSidebarOpen);
  const setSplitPosition = useSettingsStore((state) => state.setSplitPosition);

  return {
    // State
    keyboardVisible,
    sidebarOpen,
    splitPosition,
    // Actions
    toggleKeyboard,
    setKeyboardVisible,
    toggleSidebar,
    setSidebarOpen,
    setSplitPosition,
  };
}

/**
 * Hook for audio settings
 */
export function useAudioSettings() {
  const narrationAutoPlay = useSettingsStore((state) => state.narrationAutoPlay);
  const defaultTempo = useSettingsStore((state) => state.defaultTempo);
  const defaultTempoMultiplier = useSettingsStore((state) => state.defaultTempoMultiplier);
  const masterVolume = useSettingsStore((state) => state.masterVolume);
  const narrationVolume = useSettingsStore((state) => state.narrationVolume);
  const musicVolume = useSettingsStore((state) => state.musicVolume);

  const toggleNarrationAutoPlay = useSettingsStore((state) => state.toggleNarrationAutoPlay);
  const setDefaultTempo = useSettingsStore((state) => state.setDefaultTempo);
  const setDefaultTempoMultiplier = useSettingsStore(
    (state) => state.setDefaultTempoMultiplier
  );
  const setMasterVolume = useSettingsStore((state) => state.setMasterVolume);
  const setNarrationVolume = useSettingsStore((state) => state.setNarrationVolume);
  const setMusicVolume = useSettingsStore((state) => state.setMusicVolume);

  return {
    // State
    narrationAutoPlay,
    defaultTempo,
    defaultTempoMultiplier,
    masterVolume,
    narrationVolume,
    musicVolume,
    // Actions
    toggleNarrationAutoPlay,
    setDefaultTempo,
    setDefaultTempoMultiplier,
    setMasterVolume,
    setNarrationVolume,
    setMusicVolume,
  };
}

/**
 * Hook for playback behavior settings
 */
export function usePlaybackSettings() {
  const loopByDefault = useSettingsStore((state) => state.loopByDefault);
  const autoAdvance = useSettingsStore((state) => state.autoAdvance);

  const toggleLoopByDefault = useSettingsStore((state) => state.toggleLoopByDefault);
  const toggleAutoAdvance = useSettingsStore((state) => state.toggleAutoAdvance);

  return {
    // State
    loopByDefault,
    autoAdvance,
    // Actions
    toggleLoopByDefault,
    toggleAutoAdvance,
  };
}

/**
 * Hook for settings mutations
 * Provides methods to update settings in bulk
 */
export function useSettingsMutation() {
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const resetSettings = useSettingsStore((state) => state.resetSettings);

  const mutate = useCallback(
    (partial: Partial<UserSettings>) => {
      updateSettings(partial);
    },
    [updateSettings]
  );

  const reset = useCallback(() => {
    resetSettings();
  }, [resetSettings]);

  return {
    mutate,
    reset,
  };
}

/**
 * Hook to reset settings to defaults
 */
export function useResetSettings() {
  return useSettingsStore((state) => state.resetSettings);
}

/**
 * Hook for specific setting value
 * Generic hook that allows accessing any setting by key
 */
export function useSetting<K extends keyof UserSettings>(key: K): UserSettings[K] {
  return useSettingsStore((state) => state[key]);
}
