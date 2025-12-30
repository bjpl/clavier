import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type AppMode = 'walkthrough' | 'curriculum' | 'explorer';
export type Theme = 'light' | 'dark' | 'system';
export type Orientation = 'horizontal' | 'vertical';

interface ViewState {
  // Current mode
  currentMode: AppMode;

  // Theme settings
  theme: Theme;

  // Score display settings
  scoreZoom: number;
  voiceColorsEnabled: boolean;
  showAnnotations: boolean;
  annotationLayers: string[];

  // Layout settings - Split View
  scoreVisible: boolean;
  keyboardVisible: boolean;
  splitRatio: number;
  splitOrientation: Orientation;
  sidebarOpen: boolean;

  // Actions - Mode & Theme
  setMode: (mode: AppMode) => void;
  setTheme: (theme: Theme) => void;

  // Actions - Score Display
  setScoreZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleVoiceColors: () => void;
  setVoiceColors: (enabled: boolean) => void;
  toggleAnnotations: () => void;
  setAnnotations: (enabled: boolean) => void;
  toggleAnnotationLayer: (layer: string) => void;
  setAnnotationLayers: (layers: string[]) => void;

  // Actions - Split View Layout
  toggleScore: () => void;
  setScoreVisible: (visible: boolean) => void;
  toggleKeyboard: () => void;
  setKeyboardVisible: (visible: boolean) => void;
  setSplitRatio: (ratio: number) => void;
  setSplitOrientation: (orientation: Orientation) => void;
  toggleOrientation: () => void;
  swapPanels: () => void;
  resetLayout: () => void;

  // Actions - Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Actions - Reset
  reset: () => void;
}

const DEFAULT_ZOOM = 1.0;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;
const DEFAULT_SPLIT_RATIO = 60; // Score takes 60% by default
const MIN_SPLIT_RATIO = 30;
const MAX_SPLIT_RATIO = 70;

const initialState = {
  currentMode: 'walkthrough' as AppMode,
  theme: 'system' as Theme,
  scoreZoom: DEFAULT_ZOOM,
  voiceColorsEnabled: true,
  showAnnotations: true,
  annotationLayers: ['harmonic', 'melodic', 'structural'],
  scoreVisible: true,
  keyboardVisible: true,
  splitRatio: DEFAULT_SPLIT_RATIO,
  splitOrientation: 'vertical' as Orientation,
  sidebarOpen: true,
};

export const useViewStore = create<ViewState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setMode: (mode: AppMode) => set({ currentMode: mode }, false, 'view/setMode'),

        setTheme: (theme: Theme) => set({ theme }, false, 'view/setTheme'),

        setScoreZoom: (zoom: number) =>
          set(
            { scoreZoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)) },
            false,
            'view/setScoreZoom'
          ),

        zoomIn: () =>
          set(
            (state) => ({
              scoreZoom: Math.min(MAX_ZOOM, state.scoreZoom + ZOOM_STEP),
            }),
            false,
            'view/zoomIn'
          ),

        zoomOut: () =>
          set(
            (state) => ({
              scoreZoom: Math.max(MIN_ZOOM, state.scoreZoom - ZOOM_STEP),
            }),
            false,
            'view/zoomOut'
          ),

        resetZoom: () => set({ scoreZoom: DEFAULT_ZOOM }, false, 'view/resetZoom'),

        toggleVoiceColors: () =>
          set(
            (state) => ({ voiceColorsEnabled: !state.voiceColorsEnabled }),
            false,
            'view/toggleVoiceColors'
          ),

        setVoiceColors: (enabled: boolean) =>
          set({ voiceColorsEnabled: enabled }, false, 'view/setVoiceColors'),

        toggleAnnotations: () =>
          set(
            (state) => ({ showAnnotations: !state.showAnnotations }),
            false,
            'view/toggleAnnotations'
          ),

        setAnnotations: (enabled: boolean) =>
          set({ showAnnotations: enabled }, false, 'view/setAnnotations'),

        toggleAnnotationLayer: (layer: string) =>
          set(
            (state) => ({
              annotationLayers: state.annotationLayers.includes(layer)
                ? state.annotationLayers.filter((l) => l !== layer)
                : [...state.annotationLayers, layer],
            }),
            false,
            'view/toggleAnnotationLayer'
          ),

        setAnnotationLayers: (layers: string[]) =>
          set({ annotationLayers: layers }, false, 'view/setAnnotationLayers'),

        toggleScore: () =>
          set(
            (state) => ({ scoreVisible: !state.scoreVisible }),
            false,
            'view/toggleScore'
          ),

        setScoreVisible: (visible: boolean) =>
          set({ scoreVisible: visible }, false, 'view/setScoreVisible'),

        toggleKeyboard: () =>
          set(
            (state) => ({ keyboardVisible: !state.keyboardVisible }),
            false,
            'view/toggleKeyboard'
          ),

        setKeyboardVisible: (visible: boolean) =>
          set({ keyboardVisible: visible }, false, 'view/setKeyboardVisible'),

        setSplitRatio: (ratio: number) =>
          set(
            { splitRatio: Math.max(MIN_SPLIT_RATIO, Math.min(MAX_SPLIT_RATIO, ratio)) },
            false,
            'view/setSplitRatio'
          ),

        setSplitOrientation: (orientation: Orientation) =>
          set({ splitOrientation: orientation }, false, 'view/setSplitOrientation'),

        toggleOrientation: () =>
          set(
            (state) => ({
              splitOrientation: state.splitOrientation === 'horizontal' ? 'vertical' : 'horizontal',
            }),
            false,
            'view/toggleOrientation'
          ),

        swapPanels: () =>
          set(
            (state) => ({
              splitRatio: 100 - state.splitRatio,
            }),
            false,
            'view/swapPanels'
          ),

        resetLayout: () =>
          set(
            {
              scoreVisible: true,
              keyboardVisible: true,
              splitRatio: DEFAULT_SPLIT_RATIO,
              splitOrientation: 'vertical',
            },
            false,
            'view/resetLayout'
          ),

        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'view/toggleSidebar'),

        setSidebarOpen: (open: boolean) =>
          set({ sidebarOpen: open }, false, 'view/setSidebarOpen'),

        reset: () => set(initialState, false, 'view/reset'),
      }),
      {
        name: 'clavier-view-settings',
        partialize: (state) => ({
          theme: state.theme,
          scoreZoom: state.scoreZoom,
          voiceColorsEnabled: state.voiceColorsEnabled,
          showAnnotations: state.showAnnotations,
          annotationLayers: state.annotationLayers,
          scoreVisible: state.scoreVisible,
          keyboardVisible: state.keyboardVisible,
          splitRatio: state.splitRatio,
          splitOrientation: state.splitOrientation,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    { name: 'ViewStore' }
  )
);

// Selectors
export const selectCurrentMode = (state: ViewState) => state.currentMode;
export const selectTheme = (state: ViewState) => state.theme;
export const selectScoreSettings = (state: ViewState) => ({
  zoom: state.scoreZoom,
  voiceColorsEnabled: state.voiceColorsEnabled,
  showAnnotations: state.showAnnotations,
  annotationLayers: state.annotationLayers,
});
export const selectLayoutSettings = (state: ViewState) => ({
  scoreVisible: state.scoreVisible,
  keyboardVisible: state.keyboardVisible,
  splitRatio: state.splitRatio,
  splitOrientation: state.splitOrientation,
  sidebarOpen: state.sidebarOpen,
});
export const selectSplitViewSettings = (state: ViewState) => ({
  splitRatio: state.splitRatio,
  orientation: state.splitOrientation,
  showScore: state.scoreVisible,
  showKeyboard: state.keyboardVisible,
});
