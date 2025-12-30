/**
 * usePlaybackSync Hook
 * React hook for subscribing to playback synchronization events
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  PlaybackCoordinator,
  getPlaybackCoordinator,
  CursorPosition,
  ActiveNoteInfo
} from '../playback-coordinator'
import { ScoreSync, ScoreSyncConfig } from '../score-sync'
import { KeyboardSync, KeyboardSyncConfig, KeyHighlight } from '../keyboard-sync'

/**
 * Hook configuration options
 */
export interface UsePlaybackSyncOptions {
  /** Enable score synchronization */
  enableScoreSync?: boolean
  /** Enable keyboard synchronization */
  enableKeyboardSync?: boolean
  /** Score sync configuration */
  scoreSyncConfig?: Partial<ScoreSyncConfig>
  /** Keyboard sync configuration */
  keyboardSyncConfig?: Partial<KeyboardSyncConfig>
  /** Callback when playback state changes */
  onStateChange?: (state: 'stopped' | 'playing' | 'paused') => void
}

/**
 * Hook return value
 */
export interface UsePlaybackSyncReturn {
  /** Current cursor position */
  cursorPosition: CursorPosition
  /** Currently highlighted notes on keyboard */
  keyboardHighlights: KeyHighlight[]
  /** Current measure */
  currentMeasure: number
  /** Highlighted measures (loop region) */
  highlightedMeasures: number[]
  /** Playback state */
  playbackState: 'stopped' | 'playing' | 'paused'
  /** Score sync manager */
  scoreSync: ScoreSync | null
  /** Keyboard sync manager */
  keyboardSync: KeyboardSync | null
  /** Coordinator instance */
  coordinator: PlaybackCoordinator
}

/**
 * Hook for playback synchronization
 *
 * Subscribes to coordinator events and manages score/keyboard sync
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {
 *     cursorPosition,
 *     keyboardHighlights,
 *     scoreSync
 *   } = usePlaybackSync({
 *     enableScoreSync: true,
 *     enableKeyboardSync: true
 *   })
 *
 *   return (
 *     <>
 *       <ScoreViewer currentMeasure={cursorPosition.measure} />
 *       <PianoKeyboard activeNotes={keyboardHighlights} />
 *     </>
 *   )
 * }
 * ```
 */
export function usePlaybackSync(
  options: UsePlaybackSyncOptions = {}
): UsePlaybackSyncReturn {
  const {
    enableScoreSync = true,
    enableKeyboardSync = true,
    scoreSyncConfig = {},
    keyboardSyncConfig = {},
    onStateChange
  } = options

  // Get coordinator instance
  const coordinator = useRef(getPlaybackCoordinator()).current

  // Create sync managers
  const [scoreSync] = useState<ScoreSync | null>(() =>
    enableScoreSync ? new ScoreSync(scoreSyncConfig) : null
  )

  const [keyboardSync] = useState<KeyboardSync | null>(() =>
    enableKeyboardSync ? new KeyboardSync(keyboardSyncConfig) : null
  )

  // State
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({
    measure: 1,
    beat: 1,
    beatProgress: 0
  })

  const [keyboardHighlights, setKeyboardHighlights] = useState<KeyHighlight[]>([])
  const [currentMeasure, setCurrentMeasure] = useState(1)
  const [highlightedMeasures, setHighlightedMeasures] = useState<number[]>([])
  const [playbackState, setPlaybackState] = useState<'stopped' | 'playing' | 'paused'>('stopped')

  // Update keyboard highlights from sync manager
  const updateKeyboardHighlights = useCallback(() => {
    if (keyboardSync) {
      setKeyboardHighlights(keyboardSync.getHighlights())
    }
  }, [keyboardSync])

  // Subscribe to coordinator events
  useEffect(() => {
    // Cursor update
    const handleCursorUpdate = (position: CursorPosition) => {
      setCursorPosition(position)
      if (scoreSync) {
        scoreSync.updateCursor(position)
      }
    }

    // Note on
    const handleNoteOn = (note: ActiveNoteInfo) => {
      if (keyboardSync) {
        keyboardSync.addNoteHighlight(note)
        updateKeyboardHighlights()
      }
    }

    // Note off
    const handleNoteOff = (midiNote: number) => {
      if (keyboardSync) {
        keyboardSync.removeNoteHighlight(midiNote)
        updateKeyboardHighlights()
      }
    }

    // Measure change
    const handleMeasureChange = (measure: number) => {
      setCurrentMeasure(measure)
    }

    // Notes clear
    const handleNotesClear = () => {
      if (keyboardSync) {
        keyboardSync.clearAllHighlights()
        updateKeyboardHighlights()
      }
    }

    // State change
    const handleStateChange = (state: 'stopped' | 'playing' | 'paused') => {
      setPlaybackState(state)
      onStateChange?.(state)

      if (state === 'stopped' && keyboardSync) {
        keyboardSync.clearAllHighlights()
        updateKeyboardHighlights()
      }
    }

    // Loop change
    const handleLoopChange = (measures: number[]) => {
      setHighlightedMeasures(measures)
      if (scoreSync) {
        scoreSync.highlightMeasures(measures)
      }
    }

    // Register listeners
    coordinator.on('cursor-update', handleCursorUpdate)
    coordinator.on('note-on', handleNoteOn)
    coordinator.on('note-off', handleNoteOff)
    coordinator.on('measure-change', handleMeasureChange)
    coordinator.on('notes-clear', handleNotesClear)
    coordinator.on('state-change', handleStateChange)
    coordinator.on('loop-change', handleLoopChange)

    // Cleanup
    return () => {
      coordinator.off('cursor-update', handleCursorUpdate)
      coordinator.off('note-on', handleNoteOn)
      coordinator.off('note-off', handleNoteOff)
      coordinator.off('measure-change', handleMeasureChange)
      coordinator.off('notes-clear', handleNotesClear)
      coordinator.off('state-change', handleStateChange)
      coordinator.off('loop-change', handleLoopChange)
    }
  }, [coordinator, scoreSync, keyboardSync, updateKeyboardHighlights, onStateChange])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      scoreSync?.dispose()
      keyboardSync?.dispose()
    }
  }, [scoreSync, keyboardSync])

  return {
    cursorPosition,
    keyboardHighlights,
    currentMeasure,
    highlightedMeasures,
    playbackState,
    scoreSync,
    keyboardSync,
    coordinator
  }
}

/**
 * Hook variant that also provides transport control functions
 */
export function usePlaybackSyncWithControls(
  options: UsePlaybackSyncOptions = {}
) {
  const syncState = usePlaybackSync(options)
  const { coordinator } = syncState

  const play = useCallback(() => {
    coordinator.startPlayback()
  }, [coordinator])

  const pause = useCallback(() => {
    coordinator.pausePlayback()
  }, [coordinator])

  const stop = useCallback(() => {
    coordinator.stopPlayback()
  }, [coordinator])

  const seekTo = useCallback((measure: number, beat = 1) => {
    coordinator.seekTo(measure, beat)
  }, [coordinator])

  const setTempoMultiplier = useCallback((multiplier: number) => {
    coordinator.setTempoMultiplier(multiplier)
  }, [coordinator])

  return {
    ...syncState,
    play,
    pause,
    stop,
    seekTo,
    setTempoMultiplier
  }
}
