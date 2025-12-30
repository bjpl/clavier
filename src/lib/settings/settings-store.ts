/**
 * Settings Store
 *
 * Zustand store for managing user preferences with localStorage persistence.
 * All settings are reactive and automatically sync across the app.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  UserSettings,
  DEFAULT_SETTINGS,
  CONSTRAINTS,
  clampValue,
  migrateSettings,
  validateSettings,
  type Theme,
  type AnnotationLayer,
} from './settings-schema';

interface SettingsState extends UserSettings {
  // Actions - Appearance
  setTheme: (theme: Theme) => void;
  setScoreZoom: (zoom: number) => void;
  increaseZoom: () => void;
  decreaseZoom: () => void;
  resetZoom: () => void;
  toggleVoiceColors: () => void;

  // Actions - Annotations
  toggleAnnotations: () => void;
  toggleAnnotationLayer: (layer: AnnotationLayer) => void;
  setAnnotationLayers: (layers: AnnotationLayer[]) => void;

  // Actions - Layout
  toggleKeyboard: () => void;
  setKeyboardVisible: (visible: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSplitPosition: (position: number) => void;

  // Actions - Audio & Playback
  toggleNarrationAutoPlay: () => void;
  setDefaultTempo: (tempo: number) => void;
  setDefaultTempoMultiplier: (multiplier: number) => void;
  setMasterVolume: (volume: number) => void;
  setNarrationVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;

  // Actions - Playback Behavior
  toggleLoopByDefault: () => void;
  toggleAutoAdvance: () => void;

  // Utility actions
  resetSettings: () => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        ...DEFAULT_SETTINGS,

        // Appearance actions
        setTheme: (theme) => set({ theme }, false, 'settings/setTheme'),

        setScoreZoom: (zoom) =>
          set(
            { scoreZoom: clampValue(zoom, CONSTRAINTS.scoreZoom) },
            false,
            'settings/setScoreZoom'
          ),

        increaseZoom: () =>
          set(
            (state) => ({
              scoreZoom: clampValue(
                state.scoreZoom + CONSTRAINTS.scoreZoom.step,
                CONSTRAINTS.scoreZoom
              ),
            }),
            false,
            'settings/increaseZoom'
          ),

        decreaseZoom: () =>
          set(
            (state) => ({
              scoreZoom: clampValue(
                state.scoreZoom - CONSTRAINTS.scoreZoom.step,
                CONSTRAINTS.scoreZoom
              ),
            }),
            false,
            'settings/decreaseZoom'
          ),

        resetZoom: () =>
          set({ scoreZoom: DEFAULT_SETTINGS.scoreZoom }, false, 'settings/resetZoom'),

        toggleVoiceColors: () =>
          set(
            (state) => ({ voiceColorsEnabled: !state.voiceColorsEnabled }),
            false,
            'settings/toggleVoiceColors'
          ),

        // Annotation actions
        toggleAnnotations: () =>
          set(
            (state) => ({ showAnnotations: !state.showAnnotations }),
            false,
            'settings/toggleAnnotations'
          ),

        toggleAnnotationLayer: (layer) =>
          set(
            (state) => ({
              annotationLayers: state.annotationLayers.includes(layer)
                ? state.annotationLayers.filter((l) => l !== layer)
                : [...state.annotationLayers, layer],
            }),
            false,
            'settings/toggleAnnotationLayer'
          ),

        setAnnotationLayers: (layers) =>
          set({ annotationLayers: layers }, false, 'settings/setAnnotationLayers'),

        // Layout actions
        toggleKeyboard: () =>
          set(
            (state) => ({ keyboardVisible: !state.keyboardVisible }),
            false,
            'settings/toggleKeyboard'
          ),

        setKeyboardVisible: (visible) =>
          set({ keyboardVisible: visible }, false, 'settings/setKeyboardVisible'),

        toggleSidebar: () =>
          set(
            (state) => ({ sidebarOpen: !state.sidebarOpen }),
            false,
            'settings/toggleSidebar'
          ),

        setSidebarOpen: (open) =>
          set({ sidebarOpen: open }, false, 'settings/setSidebarOpen'),

        setSplitPosition: (position) =>
          set(
            { splitPosition: clampValue(position, CONSTRAINTS.splitPosition) },
            false,
            'settings/setSplitPosition'
          ),

        // Audio & Playback actions
        toggleNarrationAutoPlay: () =>
          set(
            (state) => ({ narrationAutoPlay: !state.narrationAutoPlay }),
            false,
            'settings/toggleNarrationAutoPlay'
          ),

        setDefaultTempo: (tempo) =>
          set(
            { defaultTempo: clampValue(tempo, CONSTRAINTS.tempo) },
            false,
            'settings/setDefaultTempo'
          ),

        setDefaultTempoMultiplier: (multiplier) =>
          set(
            {
              defaultTempoMultiplier: clampValue(multiplier, CONSTRAINTS.tempoMultiplier),
            },
            false,
            'settings/setDefaultTempoMultiplier'
          ),

        setMasterVolume: (volume) =>
          set(
            { masterVolume: clampValue(volume, CONSTRAINTS.volume) },
            false,
            'settings/setMasterVolume'
          ),

        setNarrationVolume: (volume) =>
          set(
            { narrationVolume: clampValue(volume, CONSTRAINTS.volume) },
            false,
            'settings/setNarrationVolume'
          ),

        setMusicVolume: (volume) =>
          set(
            { musicVolume: clampValue(volume, CONSTRAINTS.volume) },
            false,
            'settings/setMusicVolume'
          ),

        // Playback behavior actions
        toggleLoopByDefault: () =>
          set(
            (state) => ({ loopByDefault: !state.loopByDefault }),
            false,
            'settings/toggleLoopByDefault'
          ),

        toggleAutoAdvance: () =>
          set(
            (state) => ({ autoAdvance: !state.autoAdvance }),
            false,
            'settings/toggleAutoAdvance'
          ),

        // Utility actions
        resetSettings: () => set(DEFAULT_SETTINGS, false, 'settings/reset'),

        updateSettings: (partial) =>
          set(
            (state) => {
              const updated = { ...state, ...partial };
              return validateSettings(updated) ? updated : state;
            },
            false,
            'settings/update'
          ),
      }),
      {
        name: 'clavier-settings',
        version: 1,
        migrate: (persistedState: unknown, _version: number) => {
          // Migration logic for persisted state
          if (typeof persistedState === 'object' && persistedState !== null) {
            return migrateSettings(persistedState as Partial<UserSettings>);
          }
          return DEFAULT_SETTINGS;
        },
      }
    ),
    { name: 'SettingsStore' }
  )
);

// Selectors for optimized component subscriptions
export const selectTheme = (state: SettingsState) => state.theme;

export const selectScoreSettings = (state: SettingsState) => ({
  zoom: state.scoreZoom,
  voiceColorsEnabled: state.voiceColorsEnabled,
  showAnnotations: state.showAnnotations,
  annotationLayers: state.annotationLayers,
});

export const selectLayoutSettings = (state: SettingsState) => ({
  keyboardVisible: state.keyboardVisible,
  sidebarOpen: state.sidebarOpen,
  splitPosition: state.splitPosition,
});

export const selectAudioSettings = (state: SettingsState) => ({
  narrationAutoPlay: state.narrationAutoPlay,
  defaultTempo: state.defaultTempo,
  defaultTempoMultiplier: state.defaultTempoMultiplier,
  masterVolume: state.masterVolume,
  narrationVolume: state.narrationVolume,
  musicVolume: state.musicVolume,
});

export const selectPlaybackSettings = (state: SettingsState) => ({
  loopByDefault: state.loopByDefault,
  autoAdvance: state.autoAdvance,
});
