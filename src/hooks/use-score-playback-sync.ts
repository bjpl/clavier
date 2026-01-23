/**
 * useScorePlaybackSync Hook
 * Comprehensive hook for synchronizing audio playback with score display
 *
 * This hook:
 * - Connects MIDI player to score renderer via SyncManager
 * - Updates currentMeasure in real-time during playback
 * - Handles user seeking (click on measure to jump)
 * - Syncs state across components
 * - Handles edge cases like pickup measures and repeats
 */

'use client'

import { useEffect, useCallback, useRef, useState, useMemo } from 'react'
import { usePlaybackStore } from '@/lib/stores/playback-store'
import { MIDIPlayer } from '@/lib/audio/midi-player'
import { AudioEngine } from '@/lib/audio/audio-engine'
import { MIDIData } from '@/lib/audio/types'
import { APIMidiData, convertAPIMidiData, MIDIConversionConfig } from '@/lib/audio/midi-converter'
import {
  SyncManager,
  getSyncManager,
  SyncManagerConfig,
  BeatPosition
} from '@/lib/playback/sync-manager'
import { UseScoreRendererReturn } from './use-score-renderer'
import { getPlaybackCoordinator, CursorPosition } from '@/lib/playback/playback-coordinator'

/**
 * Hook options
 */
export interface UseScorePlaybackSyncOptions {
  /** Audio engine instance */
  engine: AudioEngine | null
  /** Score renderer instance from useScoreRenderer */
  scoreRenderer?: UseScoreRendererReturn | null
  /** MIDI conversion config */
  midiConversionConfig?: MIDIConversionConfig
  /** Sync manager config overrides */
  syncConfig?: Partial<SyncManagerConfig>
  /** Enable auto-scroll during playback */
  autoScroll?: boolean
  /** Callback when cursor position changes */
  onCursorChange?: (position: CursorPosition) => void
  /** Callback when measure changes */
  onMeasureChange?: (measure: number) => void
  /** Callback when playback state changes */
  onPlaybackStateChange?: (state: 'playing' | 'paused' | 'stopped') => void
}

/**
 * Hook return value
 */
export interface UseScorePlaybackSyncReturn {
  // State
  /** Whether sync is ready */
  isReady: boolean
  /** Current playback state */
  playbackState: 'stopped' | 'playing' | 'paused'
  /** Current cursor position */
  cursorPosition: CursorPosition
  /** Current measure (1-indexed) */
  currentMeasure: number
  /** Current beat (1-indexed) */
  currentBeat: number
  /** Beat progress (0-1) for smooth cursor */
  beatProgress: number
  /** Current time in seconds */
  currentTime: number
  /** Total duration in seconds */
  duration: number
  /** Total measures */
  totalMeasures: number
  /** Current effective tempo */
  effectiveTempo: number
  /** Tempo multiplier */
  tempoMultiplier: number

  // Controls
  /** Start playback */
  play: () => void
  /** Pause playback */
  pause: () => void
  /** Stop playback and reset */
  stop: () => void
  /** Toggle play/pause */
  togglePlayback: () => void
  /** Seek to specific measure and beat */
  seekToMeasure: (measure: number, beat?: number) => void
  /** Seek to specific time */
  seekToTime: (timeSeconds: number) => void
  /** Set tempo multiplier (0.25 - 2.0) */
  setTempoMultiplier: (multiplier: number) => void

  // MIDI Loading
  /** Load MIDI data directly */
  loadMIDI: (data: MIDIData) => void
  /** Load MIDI from API response */
  loadFromAPI: (apiData: APIMidiData) => void

  // Sync utilities
  /** Convert time to position */
  timeToPosition: (time: number) => BeatPosition | null
  /** Convert position to time */
  positionToTime: (measure: number, beat?: number) => number
  /** Get sync manager for advanced usage */
  getSyncManager: () => SyncManager

  // Score interaction
  /** Handle click on measure (seek to that measure) */
  handleMeasureClick: (measure: number) => void
}

/**
 * Hook for synchronized score playback
 */
export function useScorePlaybackSync(
  options: UseScorePlaybackSyncOptions
): UseScorePlaybackSyncReturn {
  const {
    engine,
    scoreRenderer,
    midiConversionConfig,
    syncConfig,
    autoScroll = true,
    onCursorChange,
    onMeasureChange,
    onPlaybackStateChange
  } = options

  // Refs for stable references
  const playerRef = useRef<MIDIPlayer | null>(null)
  const syncManagerRef = useRef<SyncManager | null>(null)
  const optionsRef = useRef(options)

  // Refs for callbacks to prevent effect re-runs (fixes lines 278-286 audit issue)
  const onCursorChangeRef = useRef(onCursorChange)
  const onMeasureChangeRef = useRef(onMeasureChange)
  const onPlaybackStateChangeRef = useRef(onPlaybackStateChange)

  // Update options ref synchronously (no useEffect to avoid render loops)
  optionsRef.current = options
  onCursorChangeRef.current = onCursorChange
  onMeasureChangeRef.current = onMeasureChange
  onPlaybackStateChangeRef.current = onPlaybackStateChange

  // Zustand store - use PRIMITIVE SELECTORS to prevent re-render loops
  const isPlaying = usePlaybackStore((s) => s.isPlaying)
  const tempo = usePlaybackStore((s) => s.tempo)
  const storeTempoMultiplier = usePlaybackStore((s) => s.tempoMultiplier)
  const storePlay = usePlaybackStore((s) => s.play)
  const storePause = usePlaybackStore((s) => s.pause)
  const storeStop = usePlaybackStore((s) => s.stop)
  const storeSeek = usePlaybackStore((s) => s.seek)
  const setStoreTempo = usePlaybackStore((s) => s.setTempo)
  const setStoreTempoMultiplier = usePlaybackStore((s) => s.setTempoMultiplier)
  const setPiece = usePlaybackStore((s) => s.setPiece)
  const addActiveNote = usePlaybackStore((s) => s.addActiveNote)
  const removeActiveNote = usePlaybackStore((s) => s.removeActiveNote)
  const clearActiveNotes = usePlaybackStore((s) => s.clearActiveNotes)

  // Local state for smooth updates
  const [isReady, setIsReady] = useState(false)
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({
    measure: 1,
    beat: 1,
    beatProgress: 0
  })
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [totalMeasures, setTotalMeasures] = useState(0)

  // Derived state
  const playbackState = useMemo((): 'playing' | 'paused' | 'stopped' => {
    if (isPlaying) return 'playing'
    if (playerRef.current?.state === 'paused') return 'paused'
    return 'stopped'
  }, [isPlaying])

  const effectiveTempo = tempo * storeTempoMultiplier

  // Stable reference for syncConfig to prevent effect re-runs
  const syncConfigRef = useRef(syncConfig)
  syncConfigRef.current = syncConfig

  // Track engine readiness separately to avoid optional chaining in dependencies
  const engineIsReady = engine?.isReady ?? false

  // Initialize player and sync manager
  useEffect(() => {
    if (!engine || !engineIsReady) {
      setIsReady(false)
      return
    }

    // Create MIDI player
    if (!playerRef.current) {
      playerRef.current = new MIDIPlayer(engine, {
        lookahead: 0.1,
        updateInterval: 50,
        autoStop: true
      })
    }

    // Create sync manager
    if (!syncManagerRef.current) {
      syncManagerRef.current = getSyncManager({
        autoScroll,
        smoothCursor: true,
        ...syncConfigRef.current
      })
    }

    // Connect player to sync manager
    syncManagerRef.current.connectPlayer(playerRef.current)

    setIsReady(true)

    return () => {
      // Dispose player to prevent resource leaks (audit fix)
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
      if (syncManagerRef.current) {
        syncManagerRef.current.disconnectPlayer()
      }
    }
  }, [engine, engineIsReady, autoScroll])

  // Connect score renderer when available
  useEffect(() => {
    if (!syncManagerRef.current || !scoreRenderer) return

    syncManagerRef.current.connectScoreRenderer(scoreRenderer)

    return () => {
      if (syncManagerRef.current) {
        syncManagerRef.current.disconnectScoreRenderer()
      }
    }
  }, [scoreRenderer])

  // Subscribe to coordinator events
  // Uses refs for callbacks to prevent effect re-runs when callbacks change
  useEffect(() => {
    const coordinator = getPlaybackCoordinator()

    const handleCursorUpdate = (position: CursorPosition) => {
      setCursorPosition(position)
      onCursorChangeRef.current?.(position)

      // Update time
      if (syncManagerRef.current) {
        const time = syncManagerRef.current.positionToTime(
          position.measure,
          position.beat,
          position.beatProgress
        )
        setCurrentTime(time)
      }
    }

    const handleMeasureChange = (measure: number, beat: number) => {
      storeSeek(measure, beat)
      onMeasureChangeRef.current?.(measure)
    }

    const handleStateChange = (state: 'playing' | 'paused' | 'stopped') => {
      onPlaybackStateChangeRef.current?.(state)

      if (state === 'stopped') {
        clearActiveNotes()
      }
    }

    const handleNoteOn = (note: { midiNote: number }) => {
      addActiveNote(note.midiNote)
    }

    const handleNoteOff = (midiNote: number) => {
      removeActiveNote(midiNote)
    }

    coordinator.on('cursor-update', handleCursorUpdate)
    coordinator.on('measure-change', handleMeasureChange)
    coordinator.on('state-change', handleStateChange)
    coordinator.on('note-on', handleNoteOn)
    coordinator.on('note-off', handleNoteOff)

    return () => {
      coordinator.off('cursor-update', handleCursorUpdate)
      coordinator.off('measure-change', handleMeasureChange)
      coordinator.off('state-change', handleStateChange)
      coordinator.off('note-on', handleNoteOn)
      coordinator.off('note-off', handleNoteOff)
    }
  }, [
    // Removed callback dependencies - now using refs
    storeSeek,
    addActiveNote,
    removeActiveNote,
    clearActiveNotes
  ])

  // Load MIDI data
  const loadMIDI = useCallback((data: MIDIData) => {
    if (!playerRef.current || !syncManagerRef.current) {
      console.warn('Player or sync manager not ready')
      return
    }

    playerRef.current.loadMIDI(data)
    syncManagerRef.current.loadMIDI(data)

    setStoreTempo(data.tempo)
    setDuration(data.duration)
    setTotalMeasures(data.measures)

    // Reset position
    storeStop()
    storeSeek(1, 1)
    setCursorPosition({ measure: 1, beat: 1, beatProgress: 0 })
    setCurrentTime(0)
    clearActiveNotes()

    console.log(`Loaded MIDI for sync: ${data.name || 'Untitled'}, ${data.measures} measures`)
  }, [setStoreTempo, storeStop, storeSeek, clearActiveNotes])

  // Load from API response
  const loadFromAPI = useCallback((apiData: APIMidiData) => {
    const midiData = convertAPIMidiData(apiData, midiConversionConfig)
    setPiece(apiData.pieceId, midiData.tempo)
    loadMIDI(midiData)
  }, [loadMIDI, setPiece, midiConversionConfig])

  // Playback controls
  const play = useCallback(() => {
    if (!playerRef.current) {
      console.warn('Player not ready')
      return
    }
    playerRef.current.play()
    storePlay()
  }, [storePlay])

  const pause = useCallback(() => {
    if (!playerRef.current) {
      console.warn('Player not ready')
      return
    }
    playerRef.current.pause()
    storePause()
  }, [storePause])

  const stop = useCallback(() => {
    if (!playerRef.current) {
      console.warn('Player not ready')
      return
    }
    playerRef.current.stop()
    storeStop()
    storeSeek(1, 1)
    setCursorPosition({ measure: 1, beat: 1, beatProgress: 0 })
    setCurrentTime(0)
    clearActiveNotes()
  }, [storeStop, storeSeek, clearActiveNotes])

  const togglePlayback = useCallback(() => {
    if (playbackState === 'playing') {
      pause()
    } else {
      play()
    }
  }, [playbackState, play, pause])

  // Seeking
  const seekToMeasure = useCallback((measure: number, beat: number = 1) => {
    if (!syncManagerRef.current) {
      console.warn('Sync manager not ready')
      return
    }

    syncManagerRef.current.seekToMeasure(measure, beat)
    storeSeek(measure, beat)
    clearActiveNotes()
  }, [storeSeek, clearActiveNotes])

  const seekToTime = useCallback((timeSeconds: number) => {
    if (!syncManagerRef.current) {
      console.warn('Sync manager not ready')
      return
    }

    syncManagerRef.current.seekToTime(timeSeconds)
    clearActiveNotes()
  }, [clearActiveNotes])

  // Tempo control
  const setTempoMultiplier = useCallback((multiplier: number) => {
    if (!playerRef.current) {
      console.warn('Player not ready')
      return
    }

    playerRef.current.setTempoMultiplier(multiplier)
    setStoreTempoMultiplier(multiplier)
  }, [setStoreTempoMultiplier])

  // Utility functions
  const timeToPosition = useCallback((time: number): BeatPosition | null => {
    if (!syncManagerRef.current) return null
    return syncManagerRef.current.timeToPosition(time)
  }, [])

  const positionToTime = useCallback((measure: number, beat: number = 1): number => {
    if (!syncManagerRef.current) return 0
    return syncManagerRef.current.positionToTime(measure, beat)
  }, [])

  const handleMeasureClick = useCallback((measure: number) => {
    seekToMeasure(measure, 1)
  }, [seekToMeasure])

  const getSyncManagerFn = useCallback(() => {
    if (!syncManagerRef.current) {
      throw new Error('Sync manager not initialized')
    }
    return syncManagerRef.current
  }, [])

  // CRITICAL: Memoize the return object to prevent infinite re-render loops
  return useMemo(() => ({
    // State
    isReady,
    playbackState,
    cursorPosition,
    currentMeasure: cursorPosition.measure,
    currentBeat: cursorPosition.beat,
    beatProgress: cursorPosition.beatProgress,
    currentTime,
    duration,
    totalMeasures,
    effectiveTempo,
    tempoMultiplier: storeTempoMultiplier,

    // Controls
    play,
    pause,
    stop,
    togglePlayback,
    seekToMeasure,
    seekToTime,
    setTempoMultiplier,

    // MIDI Loading
    loadMIDI,
    loadFromAPI,

    // Utilities
    timeToPosition,
    positionToTime,
    getSyncManager: getSyncManagerFn,

    // Score interaction
    handleMeasureClick
  }), [
    isReady,
    playbackState,
    cursorPosition,
    currentTime,
    duration,
    totalMeasures,
    effectiveTempo,
    storeTempoMultiplier,
    play,
    pause,
    stop,
    togglePlayback,
    seekToMeasure,
    seekToTime,
    setTempoMultiplier,
    loadMIDI,
    loadFromAPI,
    timeToPosition,
    positionToTime,
    getSyncManagerFn,
    handleMeasureClick
  ])
}

/**
 * Simplified hook variant with keyboard shortcuts
 */
export function useScorePlaybackSyncWithKeyboard(
  options: UseScorePlaybackSyncOptions
): UseScorePlaybackSyncReturn {
  const sync = useScorePlaybackSync(options)

  // Use a ref to store the sync object to prevent useEffect dependency issues
  // This avoids re-creating the keyboard handler on every render
  const syncRef = useRef(sync)
  syncRef.current = sync

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      const s = syncRef.current

      switch (e.key) {
        case ' ':
          e.preventDefault()
          s.togglePlayback()
          break

        case 'Escape':
          e.preventDefault()
          s.stop()
          break

        case 'ArrowLeft':
          if (e.shiftKey) {
            e.preventDefault()
            s.seekToMeasure(Math.max(1, s.currentMeasure - 1))
          }
          break

        case 'ArrowRight':
          if (e.shiftKey) {
            e.preventDefault()
            s.seekToMeasure(Math.min(s.totalMeasures, s.currentMeasure + 1))
          }
          break

        case 'Home':
          e.preventDefault()
          s.seekToMeasure(1)
          break

        case 'End':
          e.preventDefault()
          if (s.totalMeasures > 0) {
            s.seekToMeasure(s.totalMeasures)
          }
          break

        case '+':
        case '=':
          if (e.shiftKey || e.key === '+') {
            e.preventDefault()
            s.setTempoMultiplier(Math.min(2.0, s.tempoMultiplier + 0.1))
          }
          break

        case '-':
        case '_':
          e.preventDefault()
          s.setTempoMultiplier(Math.max(0.25, s.tempoMultiplier - 0.1))
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, []) // Empty dependency - uses ref for current values

  return sync
}
