/**
 * Playback Coordinator
 * Central hub for synchronizing MIDI playback, score display, and keyboard visualization
 *
 * Coordinates:
 * - MIDI player events (note on/off, measure/beat changes)
 * - Score cursor position and auto-scrolling
 * - Keyboard note highlighting with voice colors
 * - Transport controls state
 */

import { EventEmitter } from 'events'
import { VoiceName } from '@/types/music'
import { NoteEvent } from '@/lib/audio/types'

/**
 * Active note with voice information for visual coordination
 */
export interface ActiveNoteInfo {
  /** MIDI note number */
  midiNote: number
  /** Voice this note belongs to */
  voice?: VoiceName
  /** Note velocity (0-127) */
  velocity: number
  /** Timestamp when note started */
  startTime: number
}

/**
 * Cursor position in the score
 */
export interface CursorPosition {
  /** Current measure (1-indexed) */
  measure: number
  /** Current beat within measure (1-indexed) */
  beat: number
  /** Precise position within beat (0-1) for smooth cursor movement */
  beatProgress: number
}

/**
 * Playback state for coordination
 */
export interface PlaybackCoordinatorState {
  /** Current playback state */
  state: 'stopped' | 'playing' | 'paused'
  /** Current cursor position */
  cursor: CursorPosition
  /** Currently active notes */
  activeNotes: Map<number, ActiveNoteInfo>
  /** Current tempo multiplier */
  tempoMultiplier: number
  /** Whether auto-scroll is enabled */
  autoScroll: boolean
  /** Highlighted measures for loop region */
  highlightedMeasures: number[]
}

/**
 * Event types emitted by the coordinator
 */
export interface PlaybackCoordinatorEvents {
  /** Playback state changed (playing, paused, stopped) */
  'state-change': (state: 'stopped' | 'playing' | 'paused') => void
  /** Note started playing */
  'note-on': (note: ActiveNoteInfo) => void
  /** Note stopped playing */
  'note-off': (midiNote: number) => void
  /** Measure changed */
  'measure-change': (measure: number, beat: number) => void
  /** Beat tick for metronome/visual feedback */
  'beat-tick': (measure: number, beat: number) => void
  /** Cursor position updated (smooth movement) */
  'cursor-update': (position: CursorPosition) => void
  /** All active notes cleared */
  'notes-clear': () => void
  /** Tempo changed */
  'tempo-change': (multiplier: number) => void
  /** Loop region changed */
  'loop-change': (measures: number[]) => void
}

/**
 * Central coordination hub for playback synchronization
 */
export class PlaybackCoordinator extends EventEmitter {
  private state: PlaybackCoordinatorState
  private animationFrameId: number | null = null
  private lastUpdateTime = 0
  private beatsPerMeasure = 4 // Default, will be updated from MIDI data
  private baseTempo = 120 // Default BPM, will be updated from MIDI data

  constructor() {
    super()

    this.state = {
      state: 'stopped',
      cursor: {
        measure: 1,
        beat: 1,
        beatProgress: 0
      },
      activeNotes: new Map(),
      tempoMultiplier: 1.0,
      autoScroll: true,
      highlightedMeasures: []
    }
  }

  /**
   * Initialize coordinator with time signature and optional tempo
   */
  initialize(beatsPerMeasure: number, tempo: number = 120): void {
    this.beatsPerMeasure = beatsPerMeasure
    this.setBaseTempo(tempo)
  }

  /**
   * Set base tempo from MIDI data
   * @param bpm - Beats per minute (clamped to 20-300 range)
   */
  setBaseTempo(bpm: number): void {
    this.baseTempo = Math.max(20, Math.min(300, bpm))
  }

  /**
   * Get current base tempo
   */
  getBaseTempo(): number {
    return this.baseTempo
  }

  /**
   * Start playback coordination
   */
  startPlayback(): void {
    if (this.state.state === 'playing') return

    this.state.state = 'playing'
    this.emit('state-change', 'playing')
    this.startCursorAnimation()
  }

  /**
   * Pause playback coordination
   */
  pausePlayback(): void {
    if (this.state.state !== 'playing') return

    this.state.state = 'paused'
    this.emit('state-change', 'paused')
    this.stopCursorAnimation()
  }

  /**
   * Stop playback and reset to start
   */
  stopPlayback(): void {
    this.state.state = 'stopped'
    this.clearAllNotes()
    this.setCursorPosition({ measure: 1, beat: 1, beatProgress: 0 })
    this.emit('state-change', 'stopped')
    this.stopCursorAnimation()
  }

  /**
   * Handle note on event from MIDI player
   */
  handleNoteOn(note: NoteEvent, voice?: VoiceName): void {
    const noteInfo: ActiveNoteInfo = {
      midiNote: note.midiNote,
      voice,
      velocity: note.velocity,
      startTime: performance.now()
    }

    this.state.activeNotes.set(note.midiNote, noteInfo)
    this.emit('note-on', noteInfo)
  }

  /**
   * Handle note off event from MIDI player
   */
  handleNoteOff(midiNote: number): void {
    this.state.activeNotes.delete(midiNote)
    this.emit('note-off', midiNote)
  }

  /**
   * Handle measure change from MIDI player
   */
  handleMeasureChange(measure: number, beat = 1): void {
    this.setCursorPosition({
      measure,
      beat,
      beatProgress: 0
    })
    this.emit('measure-change', measure, beat)
  }

  /**
   * Handle beat tick from MIDI player
   */
  handleBeatTick(measure: number, beat: number): void {
    this.setCursorPosition({
      measure,
      beat,
      beatProgress: 0
    })
    this.emit('beat-tick', measure, beat)
  }

  /**
   * Set cursor position explicitly
   */
  setCursorPosition(position: Partial<CursorPosition>): void {
    this.state.cursor = {
      ...this.state.cursor,
      ...position
    }
    this.emit('cursor-update', this.state.cursor)
  }

  /**
   * Seek to specific measure and beat
   */
  seekTo(measure: number, beat = 1): void {
    this.clearAllNotes()
    this.setCursorPosition({
      measure,
      beat,
      beatProgress: 0
    })
    this.emit('measure-change', measure, beat)
  }

  /**
   * Set tempo multiplier
   */
  setTempoMultiplier(multiplier: number): void {
    this.state.tempoMultiplier = multiplier
    this.emit('tempo-change', multiplier)
  }

  /**
   * Set highlighted measures for loop region
   */
  setHighlightedMeasures(measures: number[]): void {
    this.state.highlightedMeasures = measures
    this.emit('loop-change', measures)
  }

  /**
   * Clear all active notes
   */
  clearAllNotes(): void {
    this.state.activeNotes.clear()
    this.emit('notes-clear')
  }

  /**
   * Toggle auto-scroll
   */
  setAutoScroll(enabled: boolean): void {
    this.state.autoScroll = enabled
  }

  /**
   * Get current state
   */
  getState(): PlaybackCoordinatorState {
    return {
      ...this.state,
      activeNotes: new Map(this.state.activeNotes)
    }
  }

  /**
   * Get currently active notes as array
   */
  getActiveNotes(): ActiveNoteInfo[] {
    return Array.from(this.state.activeNotes.values())
  }

  /**
   * Start smooth cursor animation (60fps)
   */
  private startCursorAnimation(): void {
    this.lastUpdateTime = performance.now()
    this.animateCursor()
  }

  /**
   * Stop cursor animation
   */
  private stopCursorAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * Animate cursor position smoothly between beats
   */
  private animateCursor = (): void => {
    if (this.state.state !== 'playing') return

    const now = performance.now()
    const deltaTime = (now - this.lastUpdateTime) / 1000 // Convert to seconds
    this.lastUpdateTime = now

    // Calculate beat progress based on tempo
    // Use configured base tempo, adjusted by multiplier
    const effectiveTempo = this.baseTempo * this.state.tempoMultiplier
    const secondsPerBeat = 60 / effectiveTempo
    const beatProgress = deltaTime / secondsPerBeat

    // Update cursor progress
    const newProgress = this.state.cursor.beatProgress + beatProgress

    if (newProgress >= 1.0) {
      // Move to next beat
      const nextBeat = this.state.cursor.beat + 1
      if (nextBeat > this.beatsPerMeasure) {
        // Move to next measure
        this.state.cursor = {
          measure: this.state.cursor.measure + 1,
          beat: 1,
          beatProgress: newProgress - 1.0
        }
      } else {
        this.state.cursor.beat = nextBeat
        this.state.cursor.beatProgress = newProgress - 1.0
      }
    } else {
      this.state.cursor.beatProgress = newProgress
    }

    this.emit('cursor-update', this.state.cursor)

    // Continue animation
    this.animationFrameId = requestAnimationFrame(this.animateCursor)
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopCursorAnimation()
    this.removeAllListeners()
    this.state.activeNotes.clear()
  }
}

/**
 * Global singleton instance
 */
let coordinatorInstance: PlaybackCoordinator | null = null

/**
 * Get or create the global coordinator instance
 */
export function getPlaybackCoordinator(): PlaybackCoordinator {
  if (!coordinatorInstance) {
    coordinatorInstance = new PlaybackCoordinator()
  }
  return coordinatorInstance
}
