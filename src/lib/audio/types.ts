/**
 * Audio Engine Types
 * Type definitions for MIDI playback and audio synthesis
 */

/**
 * MIDI note event
 */
export interface NoteEvent {
  /** MIDI note number (0-127) */
  midiNote: number
  /** Note velocity (0-127) */
  velocity: number
  /** Duration in seconds */
  duration: number
  /** Absolute time in seconds from start */
  time: number
  /** Measure number (1-indexed) */
  measure?: number
  /** Beat within measure (1-indexed) */
  beat?: number
}

/**
 * MIDI event types
 */
export type MIDIEventType = 'noteOn' | 'noteOff' | 'tempo' | 'timeSignature' | 'marker'

/**
 * Generic MIDI event
 */
export interface MIDIEvent {
  type: MIDIEventType
  time: number
  data: unknown
}

/**
 * Note-specific MIDI event
 */
export interface NoteMIDIEvent extends MIDIEvent {
  type: 'noteOn' | 'noteOff'
  data: {
    midiNote: number
    velocity: number
  }
}

/**
 * Tempo change event
 */
export interface TempoEvent extends MIDIEvent {
  type: 'tempo'
  data: {
    bpm: number
  }
}

/**
 * Time signature event
 */
export interface TimeSignatureEvent extends MIDIEvent {
  type: 'timeSignature'
  data: {
    numerator: number
    denominator: number
  }
}

/**
 * Musical position in measure and beat
 */
export interface MeasureBeat {
  measure: number
  beat?: number
}

/**
 * MIDI file data structure
 */
export interface MIDIData {
  /** Track name */
  name?: string
  /** Initial tempo in BPM */
  tempo: number
  /** Time signature */
  timeSignature: {
    numerator: number
    denominator: number
  }
  /** All MIDI events sorted by time */
  events: MIDIEvent[]
  /** Duration in seconds */
  duration: number
  /** Total number of measures */
  measures: number
}

/**
 * Playback state
 */
export type PlaybackState = 'stopped' | 'playing' | 'paused' | 'loading'

/**
 * Loop region configuration
 */
export interface LoopRegion {
  start: MeasureBeat
  end: MeasureBeat
  enabled: boolean
}

/**
 * Playback callbacks for event notifications
 */
export interface PlaybackCallbacks {
  onNoteOn?: (note: NoteEvent) => void
  onNoteOff?: (note: NoteEvent) => void
  onMeasureChange?: (measure: number) => void
  onBeatChange?: (beat: number) => void
  onPlaybackEnd?: () => void
  onPlaybackStart?: () => void
  onPlaybackPause?: () => void
}

/**
 * Audio engine configuration
 */
export interface AudioEngineConfig {
  /** URL template for piano samples (e.g., 'https://cdn.example.com/samples/{note}.mp3') */
  sampleBaseUrl: string
  /** Volume level (0-1) */
  volume?: number
  /** Whether to start muted */
  muted?: boolean
}

/**
 * Piano sample note names
 */
export const PIANO_NOTES = [
  'C1', 'D#1', 'F#1', 'A1',
  'C2', 'D#2', 'F#2', 'A2',
  'C3', 'D#3', 'F#3', 'A3',
  'C4', 'D#4', 'F#4', 'A4',
  'C5', 'D#5', 'F#5', 'A5',
  'C6', 'D#6', 'F#6', 'A6',
  'C7', 'D#7', 'F#7', 'A7',
  'C8'
] as const

/**
 * MIDI note number to note name mapping helper
 */
export function midiToNoteName(midiNote: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = Math.floor(midiNote / 12) - 1
  const noteName = noteNames[midiNote % 12]
  return `${noteName}${octave}`
}

/**
 * Note name to MIDI number conversion
 */
export function noteNameToMidi(noteName: string): number {
  const noteMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  }

  const match = noteName.match(/^([A-G]#?)(-?\d+)$/)
  if (!match) throw new Error(`Invalid note name: ${noteName}`)

  const [, note, octave] = match
  return noteMap[note] + (parseInt(octave) + 1) * 12
}
