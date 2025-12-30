/**
 * usePlayback Hook
 * React hook for controlling MIDI playback with store synchronization
 */

import { useEffect, useRef, useCallback } from 'react'
import { MIDIPlayer } from '@/lib/audio/midi-player'
import { AudioEngine } from '@/lib/audio/audio-engine'
import { MIDIData, MeasureBeat, NoteEvent } from '@/lib/audio/types'
import { usePlaybackStore } from '@/lib/stores/playback-store'

interface UsePlaybackOptions {
  onNoteOn?: (note: NoteEvent) => void
  onNoteOff?: (note: NoteEvent) => void
  onMeasureChange?: (measure: number) => void
  onBeatChange?: (beat: number) => void
}

interface UsePlaybackReturn {
  play: () => void
  pause: () => void
  stop: () => void
  seekToMeasure: (measure: number, beat?: number) => void
  setTempoMultiplier: (multiplier: number) => void
  setLoop: (start: MeasureBeat, end: MeasureBeat) => void
  clearLoop: () => void
  loadMIDI: (data: MIDIData) => void
  activeNotes: Set<number>
}

/**
 * Hook for MIDI playback control with store integration
 */
export function usePlayback(
  engine: AudioEngine | null,
  options: UsePlaybackOptions = {}
): UsePlaybackReturn {
  const playerRef = useRef<MIDIPlayer | null>(null)
  const activeNotesRef = useRef<Set<number>>(new Set())

  // Get playback store actions
  const {
    play: storePlay,
    pause: storePause,
    stop: storeStop,
    seek,
    setTempoMultiplier: setStoreTempoMultiplier,
    enableLoop,
    disableLoop,
    addActiveNote,
    removeActiveNote,
    clearActiveNotes
  } = usePlaybackStore()

  // Initialize player when engine is ready
  useEffect(() => {
    if (!engine || !engine.isReady) return

    if (!playerRef.current) {
      console.log('Creating MIDI player...')
      playerRef.current = new MIDIPlayer(engine)
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
   */
  const setupCallbacks = () => {
    if (!playerRef.current) return

    // Note on callback
    playerRef.current.onNoteOn((note) => {
      activeNotesRef.current.add(note.midiNote)
      addActiveNote(note.midiNote)
      options.onNoteOn?.(note)
    })

    // Note off callback
    playerRef.current.onNoteOff((note) => {
      activeNotesRef.current.delete(note.midiNote)
      removeActiveNote(note.midiNote)
      options.onNoteOff?.(note)
    })

    // Measure change callback
    playerRef.current.onMeasureChange((measure) => {
      seek(measure, 1)
      options.onMeasureChange?.(measure)
    })

    // Beat change callback
    playerRef.current.onBeatChange((beat) => {
      const currentMeasure = playerRef.current?.position.measure || 1
      seek(currentMeasure, beat)
      options.onBeatChange?.(beat)
    })

    // Playback end callback
    playerRef.current.onPlaybackEnd(() => {
      storeStop()
      clearActiveNotes()
      activeNotesRef.current.clear()
    })
  }

  /**
   * Load MIDI data
   */
  const loadMIDI = useCallback((data: MIDIData) => {
    if (!playerRef.current) {
      console.warn('Player not initialized')
      return
    }

    playerRef.current.loadMIDI(data)
    storeStop()
    seek(1, 1)
    clearActiveNotes()
    activeNotesRef.current.clear()
  }, [storeStop, seek, clearActiveNotes])

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

  return {
    play,
    pause,
    stop,
    seekToMeasure,
    setTempoMultiplier,
    setLoop,
    clearLoop,
    loadMIDI,
    activeNotes: activeNotesRef.current
  }
}

/**
 * Hook variant that provides keyboard shortcuts for playback control
 */
export function usePlaybackWithKeyboard(
  engine: AudioEngine | null,
  options: UsePlaybackOptions = {}
): UsePlaybackReturn {
  const playback = usePlayback(engine, options)
  const isPlaying = usePlaybackStore((state) => state.isPlaying)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
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
          e.preventDefault()
          if (e.shiftKey) {
            // Shift+Left: Jump to previous measure
            const currentMeasure = usePlaybackStore.getState().currentMeasure
            playback.seekToMeasure(Math.max(1, currentMeasure - 1))
          }
          break

        case 'ArrowRight':
          e.preventDefault()
          if (e.shiftKey) {
            // Shift+Right: Jump to next measure
            const currentMeasure = usePlaybackStore.getState().currentMeasure
            playback.seekToMeasure(currentMeasure + 1)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, playback])

  return playback
}
