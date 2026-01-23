/**
 * usePlayback Hook
 * React hook for controlling MIDI playback with store synchronization
 *
 * Features:
 * - Load MIDI from API response or MIDIData format
 * - Play, pause, stop, seek controls
 * - Tempo adjustment with multiplier
 * - Loop region support
 * - Active note tracking for visualization
 * - Keyboard shortcuts for transport control
 */

import { useEffect, useRef, useCallback, useMemo } from 'react'
import { MIDIPlayer } from '@/lib/audio/midi-player'
import { AudioEngine } from '@/lib/audio/audio-engine'
import { MIDIData, MeasureBeat, NoteEvent, PlaybackState } from '@/lib/audio/types'
import { convertAPIMidiData, APIMidiData, MIDIConversionConfig } from '@/lib/audio/midi-converter'
import { usePlaybackStore } from '@/lib/stores/playback-store'

export interface UsePlaybackOptions {
  /** Called when a note starts playing */
  onNoteOn?: (note: NoteEvent) => void
  /** Called when a note stops playing */
  onNoteOff?: (note: NoteEvent) => void
  /** Called when the measure changes */
  onMeasureChange?: (measure: number) => void
  /** Called when the beat changes */
  onBeatChange?: (beat: number) => void
  /** Called when playback ends */
  onPlaybackEnd?: () => void
  /** Called when playback starts */
  onPlaybackStart?: () => void
  /** Called when playback pauses */
  onPlaybackPause?: () => void
  /** MIDI conversion config (for API data) */
  conversionConfig?: MIDIConversionConfig
}

export interface UsePlaybackReturn {
  /** Start playback */
  play: () => void
  /** Pause playback */
  pause: () => void
  /** Stop playback and return to start */
  stop: () => void
  /** Seek to a specific measure and beat */
  seekToMeasure: (measure: number, beat?: number) => void
  /** Seek to a specific time in seconds */
  seekToTime: (timeSeconds: number) => void
  /** Set tempo multiplier (0.25 - 2.0) */
  setTempoMultiplier: (multiplier: number) => void
  /** Set loop region */
  setLoop: (start: MeasureBeat, end: MeasureBeat) => void
  /** Clear loop region */
  clearLoop: () => void
  /** Load MIDI data (internal format) */
  loadMIDI: (data: MIDIData) => void
  /** Load MIDI from API response */
  loadFromAPI: (apiData: APIMidiData) => void
  /** Currently active notes (for visualization) */
  activeNotes: Set<number>
  /** Current playback state */
  playbackState: PlaybackState
  /** Whether the player is ready */
  isPlayerReady: boolean
  /** Current position in measure/beat */
  currentPosition: MeasureBeat
  /** Current time in seconds */
  currentTimeSeconds: number
  /** Total duration in seconds */
  duration: number
  /** Total measures in the loaded MIDI */
  totalMeasures: number
  /** Current tempo multiplier */
  tempoMultiplier: number
  /** Effective tempo (base * multiplier) */
  effectiveTempo: number
  /** Whether looping is enabled */
  isLooping: boolean
  /** Access to underlying player for advanced use */
  player: MIDIPlayer | null
}

/**
 * Hook for MIDI playback control with store integration
 *
 * @example
 * ```tsx
 * function PlaybackControls({ engine }) {
 *   const {
 *     play, pause, stop,
 *     playbackState,
 *     loadFromAPI,
 *     currentPosition
 *   } = usePlayback(engine)
 *
 *   // Load MIDI when component mounts
 *   useEffect(() => {
 *     fetch(`/api/pieces/${pieceId}/midi`)
 *       .then(res => res.json())
 *       .then(data => loadFromAPI(data))
 *   }, [pieceId])
 *
 *   return (
 *     <div>
 *       <button onClick={play} disabled={playbackState === 'playing'}>Play</button>
 *       <button onClick={pause} disabled={playbackState !== 'playing'}>Pause</button>
 *       <button onClick={stop}>Stop</button>
 *       <span>Measure: {currentPosition.measure}</span>
 *     </div>
 *   )
 * }
 * ```
 */
export function usePlayback(
  engine: AudioEngine | null,
  options: UsePlaybackOptions = {}
): UsePlaybackReturn {
  const playerRef = useRef<MIDIPlayer | null>(null)
  const activeNotesRef = useRef<Set<number>>(new Set())
  const optionsRef = useRef(options)

  // Update options ref - use individual callback refs to avoid re-render loops
  // NOTE: We compare individual callbacks, not the entire options object,
  // because the options object may be recreated on every render
  const onNoteOnRef = useRef(options.onNoteOn)
  const onNoteOffRef = useRef(options.onNoteOff)
  const onMeasureChangeRef = useRef(options.onMeasureChange)
  const onBeatChangeRef = useRef(options.onBeatChange)
  const onPlaybackEndRef = useRef(options.onPlaybackEnd)
  const onPlaybackStartRef = useRef(options.onPlaybackStart)
  const onPlaybackPauseRef = useRef(options.onPlaybackPause)

  // Update refs when callbacks change (stable update, no effect dependencies on object)
  onNoteOnRef.current = options.onNoteOn
  onNoteOffRef.current = options.onNoteOff
  onMeasureChangeRef.current = options.onMeasureChange
  onBeatChangeRef.current = options.onBeatChange
  onPlaybackEndRef.current = options.onPlaybackEnd
  onPlaybackStartRef.current = options.onPlaybackStart
  onPlaybackPauseRef.current = options.onPlaybackPause
  optionsRef.current = options

  // Get playback store state using PRIMITIVE SELECTORS to prevent re-render loops
  // IMPORTANT: Do NOT destructure entire store - each selector causes subscription
  const isPlaying = usePlaybackStore((s) => s.isPlaying)
  const currentMeasure = usePlaybackStore((s) => s.currentMeasure)
  const currentBeat = usePlaybackStore((s) => s.currentBeat)
  const tempo = usePlaybackStore((s) => s.tempo)
  const storeTempoMultiplier = usePlaybackStore((s) => s.tempoMultiplier)
  const loopEnabled = usePlaybackStore((s) => s.loopEnabled)

  // Get store actions (these are stable references)
  const storePlay = usePlaybackStore((s) => s.play)
  const storePause = usePlaybackStore((s) => s.pause)
  const storeStop = usePlaybackStore((s) => s.stop)
  const seek = usePlaybackStore((s) => s.seek)
  const setStoreTempo = usePlaybackStore((s) => s.setTempo)
  const setStoreTempoMultiplier = usePlaybackStore((s) => s.setTempoMultiplier)
  const enableLoop = usePlaybackStore((s) => s.enableLoop)
  const disableLoop = usePlaybackStore((s) => s.disableLoop)
  const addActiveNote = usePlaybackStore((s) => s.addActiveNote)
  const removeActiveNote = usePlaybackStore((s) => s.removeActiveNote)
  const clearActiveNotes = usePlaybackStore((s) => s.clearActiveNotes)
  const setPiece = usePlaybackStore((s) => s.setPiece)

  // Initialize player when engine is ready
  useEffect(() => {
    if (!engine || !engine.isReady) {
      return
    }

    if (!playerRef.current) {
      console.log('Creating MIDI player...')
      playerRef.current = new MIDIPlayer(engine, {
        lookahead: 0.1,
        updateInterval: 50,
        autoStop: true
      })
      setupCallbacks()
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [engine?.isReady])

  /**
   * Setup player callbacks
   * Uses refs for callbacks to avoid stale closures and prevent re-render loops
   */
  const setupCallbacks = useCallback(() => {
    if (!playerRef.current) return

    // Note on callback
    playerRef.current.onNoteOn((note) => {
      activeNotesRef.current.add(note.midiNote)
      addActiveNote(note.midiNote)
      onNoteOnRef.current?.(note)
    })

    // Note off callback
    playerRef.current.onNoteOff((note) => {
      activeNotesRef.current.delete(note.midiNote)
      removeActiveNote(note.midiNote)
      onNoteOffRef.current?.(note)
    })

    // Measure change callback
    playerRef.current.onMeasureChange((measure) => {
      seek(measure, 1)
      onMeasureChangeRef.current?.(measure)
    })

    // Beat change callback
    playerRef.current.onBeatChange((beat) => {
      const currentMeasure = playerRef.current?.position.measure || 1
      seek(currentMeasure, beat)
      onBeatChangeRef.current?.(beat)
    })

    // Playback start callback
    playerRef.current.onPlaybackStart(() => {
      onPlaybackStartRef.current?.()
    })

    // Playback pause callback
    playerRef.current.onPlaybackPause(() => {
      onPlaybackPauseRef.current?.()
    })

    // Playback end callback
    playerRef.current.onPlaybackEnd(() => {
      storeStop()
      clearActiveNotes()
      activeNotesRef.current.clear()
      onPlaybackEndRef.current?.()
    })
  }, [addActiveNote, removeActiveNote, seek, storeStop, clearActiveNotes])

  /**
   * Load MIDI data (internal format)
   */
  const loadMIDI = useCallback((data: MIDIData) => {
    if (!playerRef.current) {
      console.warn('Player not initialized')
      return
    }

    playerRef.current.loadMIDI(data)
    setStoreTempo(data.tempo)
    storeStop()
    seek(1, 1)
    clearActiveNotes()
    activeNotesRef.current.clear()

    console.log(`Loaded MIDI: ${data.name || 'Untitled'}, ${data.measures} measures`)
  }, [setStoreTempo, storeStop, seek, clearActiveNotes])

  /**
   * Load MIDI from API response
   */
  const loadFromAPI = useCallback((apiData: APIMidiData) => {
    const midiData = convertAPIMidiData(apiData, optionsRef.current.conversionConfig)

    // Set piece ID in store
    setPiece(apiData.pieceId, midiData.tempo)

    loadMIDI(midiData)
  }, [loadMIDI, setPiece])

  /**
   * Start playback
   */
  const play = useCallback(() => {
    if (!playerRef.current) {
      console.warn('Player not initialized')
      return
    }

    playerRef.current.play()
    storePlay()
  }, [storePlay])

  /**
   * Pause playback
   */
  const pause = useCallback(() => {
    if (!playerRef.current) {
      console.warn('Player not initialized')
      return
    }

    playerRef.current.pause()
    storePause()
  }, [storePause])

  /**
   * Stop playback
   */
  const stop = useCallback(() => {
    if (!playerRef.current) {
      console.warn('Player not initialized')
      return
    }

    playerRef.current.stop()
    storeStop()
    seek(1, 1)
    clearActiveNotes()
    activeNotesRef.current.clear()
  }, [storeStop, seek, clearActiveNotes])

  /**
   * Seek to specific measure and beat
   */
  const seekToMeasure = useCallback((measure: number, beat?: number) => {
    if (!playerRef.current) {
      console.warn('Player not initialized')
      return
    }

    playerRef.current.seekToMeasure(measure, beat)
    seek(measure, beat || 1)
    clearActiveNotes()
    activeNotesRef.current.clear()
  }, [seek, clearActiveNotes])

  /**
   * Seek to specific time in seconds
   */
  const seekToTime = useCallback((timeSeconds: number) => {
    if (!playerRef.current) {
      console.warn('Player not initialized')
      return
    }

    playerRef.current.seekToTime(timeSeconds)
    // Position will be updated via callback
    clearActiveNotes()
    activeNotesRef.current.clear()
  }, [clearActiveNotes])

  /**
   * Set tempo multiplier
   */
  const setTempoMultiplier = useCallback((multiplier: number) => {
    if (!playerRef.current) {
      console.warn('Player not initialized')
      return
    }

    playerRef.current.setTempoMultiplier(multiplier)
    setStoreTempoMultiplier(multiplier)
  }, [setStoreTempoMultiplier])

  /**
   * Set loop region
   */
  const setLoop = useCallback((start: MeasureBeat, end: MeasureBeat) => {
    if (!playerRef.current) {
      console.warn('Player not initialized')
      return
    }

    playerRef.current.setLoop(start, end)
    enableLoop(
      { measure: start.measure, beat: start.beat ?? 1 },
      { measure: end.measure, beat: end.beat ?? 1 }
    )
  }, [enableLoop])

  /**
   * Clear loop region
   */
  const clearLoop = useCallback(() => {
    if (!playerRef.current) {
      console.warn('Player not initialized')
      return
    }

    playerRef.current.clearLoop()
    disableLoop()
  }, [disableLoop])

  // Compute derived state - currently unused but kept for future use
  // const playbackState: PlaybackState = useMemo(() => {
  //   if (!playerRef.current) return 'stopped'
  //   return playerRef.current.state
  // }, [isPlaying])

  const currentPosition: MeasureBeat = useMemo(() => ({
    measure: currentMeasure,
    beat: currentBeat
  }), [currentMeasure, currentBeat])

  const effectiveTempo = tempo * storeTempoMultiplier

  // CRITICAL: Memoize the return object to prevent infinite re-render loops
  // Without useMemo, this creates a NEW object on every render, which causes
  // any useCallback/useEffect with this as a dependency to re-run infinitely
  return useMemo(() => ({
    play,
    pause,
    stop,
    seekToMeasure,
    seekToTime,
    setTempoMultiplier,
    setLoop,
    clearLoop,
    loadMIDI,
    loadFromAPI,
    activeNotes: activeNotesRef.current,
    playbackState: isPlaying ? 'playing' : (playerRef.current?.state ?? 'stopped'),
    isPlayerReady: playerRef.current !== null,
    currentPosition,
    currentTimeSeconds: playerRef.current?.currentTimeSeconds ?? 0,
    duration: playerRef.current?.duration ?? 0,
    totalMeasures: playerRef.current?.totalMeasures ?? 0,
    tempoMultiplier: storeTempoMultiplier,
    effectiveTempo,
    isLooping: loopEnabled,
    player: playerRef.current
  }), [
    play,
    pause,
    stop,
    seekToMeasure,
    seekToTime,
    setTempoMultiplier,
    setLoop,
    clearLoop,
    loadMIDI,
    loadFromAPI,
    isPlaying,
    currentPosition,
    storeTempoMultiplier,
    effectiveTempo,
    loopEnabled
  ])
}

/**
 * Hook variant that provides keyboard shortcuts for playback control
 *
 * Keyboard shortcuts:
 * - Space: Toggle play/pause
 * - Escape: Stop
 * - Shift+Left: Previous measure
 * - Shift+Right: Next measure
 * - Home: Go to beginning
 * - End: Go to end
 * - +/-: Increase/decrease tempo
 */
export function usePlaybackWithKeyboard(
  engine: AudioEngine | null,
  options: UsePlaybackOptions = {}
): UsePlaybackReturn {
  const playback = usePlayback(engine, options)
  // Use primitive selector to prevent re-render loops
  const isPlaying = usePlaybackStore((s) => s.isPlaying)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (isPlaying) {
            playback.pause()
          } else {
            playback.play()
          }
          break

        case 'Escape':
          e.preventDefault()
          playback.stop()
          break

        case 'ArrowLeft':
          if (e.shiftKey) {
            e.preventDefault()
            const { currentMeasure } = usePlaybackStore.getState()
            playback.seekToMeasure(Math.max(1, currentMeasure - 1))
          }
          break

        case 'ArrowRight':
          if (e.shiftKey) {
            e.preventDefault()
            const { currentMeasure } = usePlaybackStore.getState()
            const maxMeasure = playback.totalMeasures || 999
            playback.seekToMeasure(Math.min(maxMeasure, currentMeasure + 1))
          }
          break

        case 'Home':
          e.preventDefault()
          playback.seekToMeasure(1)
          break

        case 'End':
          e.preventDefault()
          if (playback.totalMeasures > 0) {
            playback.seekToMeasure(playback.totalMeasures)
          }
          break

        case '+':
        case '=':
          if (e.shiftKey || e.key === '+') {
            e.preventDefault()
            const newMultiplier = Math.min(2.0, playback.tempoMultiplier + 0.1)
            playback.setTempoMultiplier(newMultiplier)
          }
          break

        case '-':
        case '_':
          e.preventDefault()
          const newMultiplier = Math.max(0.25, playback.tempoMultiplier - 0.1)
          playback.setTempoMultiplier(newMultiplier)
          break

        case 'l':
        case 'L':
          // Toggle loop (when markers are set)
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            if (playback.isLooping) {
              playback.clearLoop()
            }
            // Note: To set loop, user needs to define start/end points
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, playback])

  return playback
}

/**
 * Hook for measure-by-measure playback (walkthrough mode)
 */
export function useMeasurePlayback(
  engine: AudioEngine | null,
  options: UsePlaybackOptions = {}
): UsePlaybackReturn & {
  playMeasure: (measure: number) => void
  playMeasureRange: (start: number, end: number) => void
} {
  const playback = usePlayback(engine, options)

  /**
   * Play a single measure
   */
  const playMeasure = useCallback((measure: number) => {
    playback.seekToMeasure(measure)
    playback.setLoop({ measure, beat: 1 }, { measure: measure + 1, beat: 1 })
    playback.play()
  }, [playback])

  /**
   * Play a range of measures
   */
  const playMeasureRange = useCallback((start: number, end: number) => {
    playback.seekToMeasure(start)
    playback.setLoop({ measure: start, beat: 1 }, { measure: end + 1, beat: 1 })
    playback.play()
  }, [playback])

  return {
    ...playback,
    playMeasure,
    playMeasureRange
  }
}
