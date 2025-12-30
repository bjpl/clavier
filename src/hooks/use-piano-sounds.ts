/**
 * usePianoSounds Hook
 * React hook for interactive piano keyboard sound playback
 */

import { useCallback, useRef } from 'react'
import { AudioEngine } from '@/lib/audio/audio-engine'

interface UsePianoSoundsOptions {
  /** Note duration in seconds (default: 0.5) */
  duration?: number
  /** Velocity (0-1, default: 0.8) */
  velocity?: number
}

interface UsePianoSoundsReturn {
  playNote: (midiNote: number) => void
  stopNote: (midiNote: number) => void
  stopAllNotes: () => void
  isNotePlaying: (midiNote: number) => boolean
  activeNotes: Set<number>
}

/**
 * Hook for interactive piano keyboard sounds
 * Manages note playback with touch and click support
 */
export function usePianoSounds(
  engine: AudioEngine | null,
  options: UsePianoSoundsOptions = {}
): UsePianoSoundsReturn {
  const activeNotesRef = useRef<Set<number>>(new Set())
  const noteTimersRef = useRef<Map<number, number>>(new Map())

  const {
    duration = 0.5,
    velocity: _velocity = 0.8
  } = options

  /**
   * Play a note immediately
   */
  const playNote = useCallback((midiNote: number) => {
    if (!engine || !engine.isReady) {
      console.warn('Audio engine not ready')
      return
    }

    // Add to active notes
    activeNotesRef.current.add(midiNote)

    // Play the note
    engine.playNote(midiNote, duration)

    // Clear any existing timer for this note
    const existingTimer = noteTimersRef.current.get(midiNote)
    if (existingTimer) {
      window.clearTimeout(existingTimer)
    }

    // Schedule note removal from active set
    const timer = window.setTimeout(() => {
      activeNotesRef.current.delete(midiNote)
      noteTimersRef.current.delete(midiNote)
    }, duration * 1000)

    noteTimersRef.current.set(midiNote, timer)
  }, [engine, duration])

  /**
   * Stop a specific note
   */
  const stopNote = useCallback((midiNote: number) => {
    if (!engine || !engine.isReady) return

    engine.stopNote(midiNote)
    activeNotesRef.current.delete(midiNote)

    // Clear timer
    const timer = noteTimersRef.current.get(midiNote)
    if (timer) {
      window.clearTimeout(timer)
      noteTimersRef.current.delete(midiNote)
    }
  }, [engine])

  /**
   * Stop all playing notes
   */
  const stopAllNotes = useCallback(() => {
    if (!engine || !engine.isReady) return

    engine.stopAllNotes()
    activeNotesRef.current.clear()

    // Clear all timers
    noteTimersRef.current.forEach(timer => window.clearTimeout(timer))
    noteTimersRef.current.clear()
  }, [engine])

  /**
   * Check if a note is currently playing
   */
  const isNotePlaying = useCallback((midiNote: number) => {
    return activeNotesRef.current.has(midiNote)
  }, [])

  return {
    playNote,
    stopNote,
    stopAllNotes,
    isNotePlaying,
    activeNotes: activeNotesRef.current
  }
}

/**
 * Hook variant with keyboard support for QWERTY keyboard mapping to piano keys
 */
export function usePianoSoundsWithKeyboard(
  engine: AudioEngine | null,
  options: UsePianoSoundsOptions = {}
): UsePianoSoundsReturn {
  const pianoSounds = usePianoSounds(engine, options)
  const pressedKeysRef = useRef<Set<string>>(new Set())

  // QWERTY to MIDI mapping (middle C = 60)
  const keyToMidiMap: Record<string, number> = {
    // Bottom row: C4 - B4
    'z': 60, // C4
    's': 61, // C#4
    'x': 62, // D4
    'd': 63, // D#4
    'c': 64, // E4
    'v': 65, // F4
    'g': 66, // F#4
    'b': 67, // G4
    'h': 68, // G#4
    'n': 69, // A4
    'j': 70, // A#4
    'm': 71, // B4

    // Top row: C5 - B5
    'q': 72, // C5
    '2': 73, // C#5
    'w': 74, // D5
    '3': 75, // D#5
    'e': 76, // E5
    'r': 77, // F5
    '5': 78, // F#5
    't': 79, // G5
    '6': 80, // G#5
    'y': 81, // A5
    '7': 82, // A#5
    'u': 83, // B5
    'i': 84, // C6
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in input field
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return
    }

    const key = e.key.toLowerCase()
    const midiNote = keyToMidiMap[key]

    if (midiNote !== undefined && !pressedKeysRef.current.has(key)) {
      e.preventDefault()
      pressedKeysRef.current.add(key)
      pianoSounds.playNote(midiNote)
    }
  }, [pianoSounds])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase()
    pressedKeysRef.current.delete(key)
  }, [])

  // Setup keyboard listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  }

  return pianoSounds
}

/**
 * Hook for touch-optimized piano playback
 * Handles multi-touch for chord playback
 */
export function usePianoSoundsWithTouch(
  engine: AudioEngine | null,
  options: UsePianoSoundsOptions = {}
): UsePianoSoundsReturn {
  const pianoSounds = usePianoSounds(engine, options)
  const touchNotesRef = useRef<Map<number, number>>(new Map()) // touchId -> midiNote

  /**
   * Handle touch start event
   */
  const handleTouchStart = useCallback((midiNote: number, touchId: number) => {
    touchNotesRef.current.set(touchId, midiNote)
    pianoSounds.playNote(midiNote)
  }, [pianoSounds])

  /**
   * Handle touch end event
   */
  const handleTouchEnd = useCallback((touchId: number) => {
    const midiNote = touchNotesRef.current.get(touchId)
    if (midiNote !== undefined) {
      pianoSounds.stopNote(midiNote)
      touchNotesRef.current.delete(touchId)
    }
  }, [pianoSounds])

  /**
   * Handle touch cancel event
   */
  const handleTouchCancel = useCallback(() => {
    touchNotesRef.current.forEach(midiNote => {
      pianoSounds.stopNote(midiNote)
    })
    touchNotesRef.current.clear()
  }, [pianoSounds])

  return {
    ...pianoSounds,
    // Expose touch handlers for components
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel
  } as UsePianoSoundsReturn & {
    handleTouchStart: (midiNote: number, touchId: number) => void
    handleTouchEnd: (touchId: number) => void
    handleTouchCancel: () => void
  }
}
