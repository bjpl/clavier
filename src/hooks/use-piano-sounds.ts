/**
 * usePianoSounds Hook
 * React hook for interactive piano keyboard sound playback
 *
 * Features:
 * - Attack/release model for sustained notes
 * - Velocity-sensitive playback
 * - QWERTY keyboard to piano key mapping
 * - Multi-touch support for mobile devices
 * - Active note tracking for visual feedback
 */

import { useCallback, useRef, useEffect, useState } from 'react'
import { AudioEngine } from '@/lib/audio/audio-engine'

export interface UsePianoSoundsOptions {
  /** Default velocity (0-1, default: 0.8) */
  velocity?: number
  /** Whether to sustain notes until explicit release (default: true) */
  sustainMode?: boolean
  /** Fixed duration when not in sustain mode (seconds, default: 0.5) */
  fixedDuration?: number
}

export interface UsePianoSoundsReturn {
  /** Start playing a note (attack) */
  noteOn: (midiNote: number, velocity?: number) => void
  /** Stop playing a note (release) */
  noteOff: (midiNote: number) => void
  /** Play a note with fixed duration (attack + scheduled release) */
  playNote: (midiNote: number, duration?: number, velocity?: number) => void
  /** Stop a specific note (alias for noteOff) */
  stopNote: (midiNote: number) => void
  /** Stop all playing notes */
  stopAllNotes: () => void
  /** Check if a note is currently playing */
  isNotePlaying: (midiNote: number) => boolean
  /** Set of currently active MIDI notes */
  activeNotes: Set<number>
  /** Whether the audio engine is ready */
  isReady: boolean
}

/**
 * Hook for interactive piano keyboard sounds
 * Manages note playback with proper attack/release for realistic piano behavior
 *
 * @example
 * ```tsx
 * function PianoKey({ midiNote, engine }) {
 *   const { noteOn, noteOff, isNotePlaying } = usePianoSounds(engine)
 *   const isActive = isNotePlaying(midiNote)
 *
 *   return (
 *     <button
 *       className={isActive ? 'active' : ''}
 *       onMouseDown={() => noteOn(midiNote)}
 *       onMouseUp={() => noteOff(midiNote)}
 *       onMouseLeave={() => noteOff(midiNote)}
 *     >
 *       {midiNote}
 *     </button>
 *   )
 * }
 * ```
 */
export function usePianoSounds(
  engine: AudioEngine | null,
  options: UsePianoSoundsOptions = {}
): UsePianoSoundsReturn {
  const activeNotesRef = useRef<Set<number>>(new Set())
  const [activeNotesState, setActiveNotesState] = useState<Set<number>>(new Set())
  const noteTimersRef = useRef<Map<number, number>>(new Map())

  const {
    velocity: defaultVelocity = 0.8,
    sustainMode: _sustainMode = true,
    fixedDuration = 0.5
  } = options

  // Check if engine is ready
  const isReady = engine?.isReady ?? false

  /**
   * Start playing a note (attack only)
   */
  const noteOn = useCallback((midiNote: number, velocity?: number) => {
    if (!engine || !engine.isReady) {
      console.warn('Audio engine not ready')
      return
    }

    const vel = velocity ?? defaultVelocity

    // Clear any existing timer for this note
    const existingTimer = noteTimersRef.current.get(midiNote)
    if (existingTimer) {
      window.clearTimeout(existingTimer)
      noteTimersRef.current.delete(midiNote)
    }

    // Add to active notes
    activeNotesRef.current.add(midiNote)
    setActiveNotesState(new Set(activeNotesRef.current))

    // Trigger attack (note will sustain until release)
    engine.triggerAttack(midiNote, vel)
  }, [engine, defaultVelocity])

  /**
   * Stop playing a note (release)
   */
  const noteOff = useCallback((midiNote: number) => {
    if (!engine || !engine.isReady) return

    // Only release if note is active
    if (!activeNotesRef.current.has(midiNote)) return

    // Remove from active notes
    activeNotesRef.current.delete(midiNote)
    setActiveNotesState(new Set(activeNotesRef.current))

    // Trigger release
    engine.triggerRelease(midiNote)

    // Clear any timer
    const timer = noteTimersRef.current.get(midiNote)
    if (timer) {
      window.clearTimeout(timer)
      noteTimersRef.current.delete(midiNote)
    }
  }, [engine])

  /**
   * Play a note with fixed duration (for non-sustain mode or programmatic playback)
   */
  const playNote = useCallback((midiNote: number, duration?: number, velocity?: number) => {
    if (!engine || !engine.isReady) {
      console.warn('Audio engine not ready')
      return
    }

    const noteDuration = duration ?? fixedDuration
    const vel = velocity ?? defaultVelocity

    // Clear any existing timer for this note
    const existingTimer = noteTimersRef.current.get(midiNote)
    if (existingTimer) {
      window.clearTimeout(existingTimer)
    }

    // Add to active notes
    activeNotesRef.current.add(midiNote)
    setActiveNotesState(new Set(activeNotesRef.current))

    // Play the note with duration
    engine.playNote(midiNote, noteDuration, undefined, vel)

    // Schedule removal from active notes
    const timer = window.setTimeout(() => {
      activeNotesRef.current.delete(midiNote)
      setActiveNotesState(new Set(activeNotesRef.current))
      noteTimersRef.current.delete(midiNote)
    }, noteDuration * 1000)

    noteTimersRef.current.set(midiNote, timer)
  }, [engine, fixedDuration, defaultVelocity])

  /**
   * Stop a specific note (alias for noteOff)
   */
  const stopNote = useCallback((midiNote: number) => {
    noteOff(midiNote)
  }, [noteOff])

  /**
   * Stop all playing notes
   */
  const stopAllNotes = useCallback(() => {
    if (!engine || !engine.isReady) return

    engine.stopAllNotes()
    activeNotesRef.current.clear()
    setActiveNotesState(new Set())

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      noteTimersRef.current.forEach(timer => window.clearTimeout(timer))
      noteTimersRef.current.clear()
    }
  }, [])

  return {
    noteOn,
    noteOff,
    playNote,
    stopNote,
    stopAllNotes,
    isNotePlaying,
    activeNotes: activeNotesState,
    isReady
  }
}

/**
 * QWERTY keyboard to MIDI note mapping
 * Maps two rows of the keyboard to two octaves starting from middle C
 */
export const QWERTY_TO_MIDI: Record<string, number> = {
  // Bottom row: C4 - B4 (middle C octave)
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
  ',': 72, // C5

  // Top row: C5 - C6
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

/**
 * Hook variant with QWERTY keyboard support
 * Maps computer keyboard to piano keys for playing without a MIDI controller
 */
export function usePianoSoundsWithKeyboard(
  engine: AudioEngine | null,
  options: UsePianoSoundsOptions & {
    /** Optional base octave offset (-2 to +2) */
    octaveOffset?: number
    /** Whether keyboard is enabled */
    enabled?: boolean
  } = {}
): UsePianoSoundsReturn & {
  /** Current octave offset */
  octaveOffset: number
  /** Increase octave */
  octaveUp: () => void
  /** Decrease octave */
  octaveDown: () => void
} {
  const pianoSounds = usePianoSounds(engine, options)
  const pressedKeysRef = useRef<Set<string>>(new Set())
  const [octaveOffset, setOctaveOffset] = useState(options.octaveOffset ?? 0)
  const enabled = options.enabled ?? true

  const octaveUp = useCallback(() => {
    setOctaveOffset(prev => Math.min(2, prev + 1))
  }, [])

  const octaveDown = useCallback(() => {
    setOctaveOffset(prev => Math.max(-2, prev - 1))
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Handle octave shift keys
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        octaveUp()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        octaveDown()
        return
      }

      const key = e.key.toLowerCase()
      const baseMidiNote = QWERTY_TO_MIDI[key]

      if (baseMidiNote !== undefined && !pressedKeysRef.current.has(key)) {
        e.preventDefault()
        pressedKeysRef.current.add(key)
        const midiNote = baseMidiNote + (octaveOffset * 12)
        pianoSounds.noteOn(midiNote)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const baseMidiNote = QWERTY_TO_MIDI[key]

      if (baseMidiNote !== undefined && pressedKeysRef.current.has(key)) {
        pressedKeysRef.current.delete(key)
        const midiNote = baseMidiNote + (octaveOffset * 12)
        pianoSounds.noteOff(midiNote)
      }
    }

    // Stop all notes when window loses focus
    const handleBlur = () => {
      pressedKeysRef.current.clear()
      pianoSounds.stopAllNotes()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [enabled, octaveOffset, pianoSounds, octaveUp, octaveDown])

  return {
    ...pianoSounds,
    octaveOffset,
    octaveUp,
    octaveDown
  }
}

/**
 * Hook for touch-optimized piano playback
 * Handles multi-touch for chord playback on mobile devices
 */
export function usePianoSoundsWithTouch(
  engine: AudioEngine | null,
  options: UsePianoSoundsOptions = {}
): UsePianoSoundsReturn & {
  /** Handle touch start event */
  handleTouchStart: (midiNote: number, touchId: number, velocity?: number) => void
  /** Handle touch end event */
  handleTouchEnd: (touchId: number) => void
  /** Handle touch move event (for glissando) */
  handleTouchMove: (touchId: number, newMidiNote: number) => void
  /** Handle all touches cancelled */
  handleTouchCancel: () => void
  /** Map of active touches to notes */
  touchNotes: Map<number, number>
} {
  const pianoSounds = usePianoSounds(engine, options)
  const touchNotesRef = useRef<Map<number, number>>(new Map())
  const [touchNotes, setTouchNotes] = useState<Map<number, number>>(new Map())

  /**
   * Handle touch start event
   */
  const handleTouchStart = useCallback((midiNote: number, touchId: number, velocity?: number) => {
    touchNotesRef.current.set(touchId, midiNote)
    setTouchNotes(new Map(touchNotesRef.current))
    pianoSounds.noteOn(midiNote, velocity)
  }, [pianoSounds])

  /**
   * Handle touch end event
   */
  const handleTouchEnd = useCallback((touchId: number) => {
    const midiNote = touchNotesRef.current.get(touchId)
    if (midiNote !== undefined) {
      pianoSounds.noteOff(midiNote)
      touchNotesRef.current.delete(touchId)
      setTouchNotes(new Map(touchNotesRef.current))
    }
  }, [pianoSounds])

  /**
   * Handle touch move event (for glissando effect)
   */
  const handleTouchMove = useCallback((touchId: number, newMidiNote: number) => {
    const currentNote = touchNotesRef.current.get(touchId)

    if (currentNote !== undefined && currentNote !== newMidiNote) {
      // Release old note
      pianoSounds.noteOff(currentNote)

      // Play new note
      pianoSounds.noteOn(newMidiNote)

      // Update tracking
      touchNotesRef.current.set(touchId, newMidiNote)
      setTouchNotes(new Map(touchNotesRef.current))
    }
  }, [pianoSounds])

  /**
   * Handle touch cancel event
   */
  const handleTouchCancel = useCallback(() => {
    touchNotesRef.current.forEach(midiNote => {
      pianoSounds.noteOff(midiNote)
    })
    touchNotesRef.current.clear()
    setTouchNotes(new Map())
  }, [pianoSounds])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      touchNotesRef.current.clear()
    }
  }, [])

  return {
    ...pianoSounds,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    handleTouchCancel,
    touchNotes
  }
}

/**
 * Hook combining keyboard and touch support
 * Best for cross-platform piano components
 */
export function usePianoSoundsComplete(
  engine: AudioEngine | null,
  options: UsePianoSoundsOptions & {
    keyboardEnabled?: boolean
    octaveOffset?: number
  } = {}
): UsePianoSoundsReturn & {
  // Keyboard
  octaveOffset: number
  octaveUp: () => void
  octaveDown: () => void
  // Touch
  handleTouchStart: (midiNote: number, touchId: number, velocity?: number) => void
  handleTouchEnd: (touchId: number) => void
  handleTouchMove: (touchId: number, newMidiNote: number) => void
  handleTouchCancel: () => void
  touchNotes: Map<number, number>
} {
  const keyboard = usePianoSoundsWithKeyboard(engine, {
    ...options,
    enabled: options.keyboardEnabled ?? true
  })
  const touch = usePianoSoundsWithTouch(engine, options)

  return {
    ...keyboard,
    handleTouchStart: touch.handleTouchStart,
    handleTouchEnd: touch.handleTouchEnd,
    handleTouchMove: touch.handleTouchMove,
    handleTouchCancel: touch.handleTouchCancel,
    touchNotes: touch.touchNotes
  }
}
