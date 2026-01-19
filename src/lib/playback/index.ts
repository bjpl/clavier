/**
 * Playback Synchronization System
 * Exports for centralized playback coordination
 */

export {
  PlaybackCoordinator,
  getPlaybackCoordinator,
  type ActiveNoteInfo,
  type CursorPosition,
  type PlaybackCoordinatorState,
  type PlaybackCoordinatorEvents
} from './playback-coordinator'

export {
  ScoreSync,
  type ScoreViewport,
  type ScoreSyncConfig
} from './score-sync'

export {
  KeyboardSync,
  VOICE_COLORS,
  type KeyHighlight,
  type KeyboardSyncConfig
} from './keyboard-sync'

export {
  SyncManager,
  getSyncManager,
  resetSyncManager,
  type MeasureTimeMap,
  type BeatPosition,
  type SyncManagerConfig
} from './sync-manager'

export {
  usePlaybackSync,
  usePlaybackSyncWithControls,
  type UsePlaybackSyncOptions,
  type UsePlaybackSyncReturn
} from './hooks/use-playback-sync'
