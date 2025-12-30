/**
 * Zustand Store Index
 *
 * Central export point for all application stores and utilities.
 *
 * Usage:
 * ```ts
 * import { usePlaybackStore, useViewStore } from '@/lib/stores';
 *
 * // In component
 * const { play, pause } = usePlaybackStore();
 * const { theme, setTheme } = useViewStore();
 * ```
 */

// Import stores for local use
import { usePlaybackStore as _usePlaybackStore } from './playback-store';
import { useViewStore as _useViewStore } from './view-store';
import { useWalkthroughStore as _useWalkthroughStore } from './walkthrough-store';
import { useCurriculumStore as _useCurriculumStore } from './curriculum-store';
import { useExplorerStore as _useExplorerStore } from './explorer-store';

// Store exports
export {
  usePlaybackStore,
  selectIsPlaying,
  selectCurrentPosition,
  selectTempo,
  selectVolume,
  selectLoop,
} from './playback-store';

export {
  useViewStore,
  selectCurrentMode,
  selectTheme,
  selectScoreSettings,
  selectLayoutSettings,
} from './view-store';

export {
  useWalkthroughStore,
  selectCurrentPosition as selectWalkthroughPosition,
  selectSettings as selectWalkthroughSettings,
  selectProgress as selectWalkthroughProgress,
  selectHasVisited,
} from './walkthrough-store';

export {
  useCurriculumStore,
  selectCurrentLesson,
  selectLessonProgress,
  selectCompletedLessons,
  selectOverallProgress,
  selectRecentLessons,
} from './curriculum-store';

export {
  useExplorerStore,
  selectSearchState,
  selectFilters,
  selectActiveFilters,
  selectResults,
  selectPagination,
} from './explorer-store';

// Type exports
export type { FeatureInstance, SortOption, PieceType } from './explorer-store';
export type { LessonProgress } from './curriculum-store';
export type { AppMode, Theme } from './view-store';
export type { LoopPoint } from './playback-store';

/**
 * Combined store hook for accessing all stores
 * Useful for complex components that need multiple stores
 */
export const useStores = () => ({
  playback: _usePlaybackStore(),
  view: _useViewStore(),
  walkthrough: _useWalkthroughStore(),
  curriculum: _useCurriculumStore(),
  explorer: _useExplorerStore(),
});

/**
 * Reset all stores to initial state
 * Useful for logout or app reset
 */
export const resetAllStores = () => {
  _usePlaybackStore.getState().reset();
  _useViewStore.getState().reset();
  _useWalkthroughStore.getState().reset();
  _useCurriculumStore.getState().reset();
  _useExplorerStore.getState().reset();
};

/**
 * Get snapshot of all store states
 * Useful for debugging or state export
 */
export const getStoreSnapshot = () => ({
  playback: _usePlaybackStore.getState(),
  view: _useViewStore.getState(),
  walkthrough: _useWalkthroughStore.getState(),
  curriculum: _useCurriculumStore.getState(),
  explorer: _useExplorerStore.getState(),
});

/**
 * Check if any store is in a loading state
 */
export const isAnyStoreLoading = () => {
  return _useExplorerStore.getState().isLoading;
};

/**
 * Get all active errors from stores
 */
export const getAllStoreErrors = () => {
  const errors: { store: string; error: string }[] = [];

  const explorerError = _useExplorerStore.getState().error;
  if (explorerError) {
    errors.push({ store: 'explorer', error: explorerError });
  }

  return errors;
};
