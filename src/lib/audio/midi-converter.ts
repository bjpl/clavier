/**
 * MIDI Data Converter
 * Converts various MIDI data formats to the internal MIDIData format used by the player
 */

import { MIDIData, MIDIEvent, NoteMIDIEvent } from './types'
import { VoiceName } from '@/types/music'

/**
 * API MIDI response format from /api/pieces/[id]/midi
 */
export interface APIMidiNote {
  midiNumber: number
  startBeat: number
  durationBeats: number
  voice: number
  startTimeSeconds?: number
  durationSeconds?: number
}

export interface APIMidiMeasure {
  measureNumber: number
  notes: APIMidiNote[]
}

export interface APIMidiData {
  pieceId: string
  bwvNumber: number
  timeSignature: string
  totalMeasures: number
  totalDurationSeconds?: number
  measures: APIMidiMeasure[]
}

/**
 * Configuration for MIDI conversion
 */
export interface MIDIConversionConfig {
  /** Default tempo in BPM (used if not specified in data) */
  defaultTempo?: number
  /** Default velocity for notes (0-127) */
  defaultVelocity?: number
  /** Whether to include voice information in events */
  preserveVoiceInfo?: boolean
}

const DEFAULT_CONVERSION_CONFIG: MIDIConversionConfig = {
  defaultTempo: 80,
  defaultVelocity: 80,
  preserveVoiceInfo: true
}

/**
 * Parse time signature string (e.g., "4/4", "3/4") into numerator and denominator
 */
export function parseTimeSignature(timeSignature: string): { numerator: number; denominator: number } {
  const parts = timeSignature.split('/')
  if (parts.length !== 2) {
    console.warn(`Invalid time signature format: ${timeSignature}, defaulting to 4/4`)
    return { numerator: 4, denominator: 4 }
  }

  const numerator = parseInt(parts[0], 10)
  const denominator = parseInt(parts[1], 10)

  if (isNaN(numerator) || isNaN(denominator)) {
    console.warn(`Invalid time signature values: ${timeSignature}, defaulting to 4/4`)
    return { numerator: 4, denominator: 4 }
  }

  return { numerator, denominator }
}

/**
 * Convert voice number to voice name
 */
export function voiceNumberToName(voice: number): VoiceName | undefined {
  const voiceMap: Record<number, VoiceName> = {
    1: 'SOPRANO',
    2: 'ALTO',
    3: 'TENOR',
    4: 'BASS'
  }
  return voiceMap[voice]
}

/**
 * Calculate time in seconds from beat position
 */
export function beatToSeconds(
  beat: number,
  tempo: number,
  timeSignature: { numerator: number; denominator: number }
): number {
  // Tempo is in quarter notes per minute
  // For other time signatures, we need to adjust
  const quarterNotesPerBeat = 4 / timeSignature.denominator
  const secondsPerQuarterNote = 60 / tempo
  const secondsPerBeat = secondsPerQuarterNote * quarterNotesPerBeat

  return beat * secondsPerBeat
}

/**
 * Calculate duration in seconds from beat duration
 */
export function beatsToSeconds(
  durationBeats: number,
  tempo: number,
  timeSignature: { numerator: number; denominator: number }
): number {
  return beatToSeconds(durationBeats, tempo, timeSignature)
}

/**
 * Convert API MIDI data to internal MIDIData format
 */
export function convertAPIMidiData(
  apiData: APIMidiData,
  config: MIDIConversionConfig = {}
): MIDIData {
  const cfg = { ...DEFAULT_CONVERSION_CONFIG, ...config }
  const timeSignature = parseTimeSignature(apiData.timeSignature)
  const tempo = cfg.defaultTempo!

  const events: MIDIEvent[] = []
  const beatsPerMeasure = timeSignature.numerator

  // Process each measure and extract notes
  for (const measure of apiData.measures) {
    const measureStartBeat = (measure.measureNumber - 1) * beatsPerMeasure

    for (const note of measure.notes) {
      // Calculate absolute beat position
      const absoluteStartBeat = measureStartBeat + note.startBeat

      // Convert to time in seconds
      const startTimeSeconds = note.startTimeSeconds ??
        beatToSeconds(absoluteStartBeat, tempo, timeSignature)

      const durationSeconds = note.durationSeconds ??
        beatsToSeconds(note.durationBeats, tempo, timeSignature)

      // Create noteOn event
      const noteOnEvent: NoteMIDIEvent = {
        type: 'noteOn',
        time: startTimeSeconds,
        data: {
          midiNote: note.midiNumber,
          velocity: cfg.defaultVelocity!
        }
      }

      // Create noteOff event
      const noteOffEvent: NoteMIDIEvent = {
        type: 'noteOff',
        time: startTimeSeconds + durationSeconds,
        data: {
          midiNote: note.midiNumber,
          velocity: 0
        }
      }

      events.push(noteOnEvent)
      events.push(noteOffEvent)
    }
  }

  // Sort events by time, with noteOff events before noteOn at same time
  events.sort((a, b) => {
    if (a.time !== b.time) {
      return a.time - b.time
    }
    // At same time, noteOff comes before noteOn
    if (a.type === 'noteOff' && b.type === 'noteOn') return -1
    if (a.type === 'noteOn' && b.type === 'noteOff') return 1
    return 0
  })

  // Calculate total duration
  const lastEvent = events[events.length - 1]
  const duration = apiData.totalDurationSeconds ??
    (lastEvent ? lastEvent.time + 0.5 : 0)

  return {
    name: `BWV ${apiData.bwvNumber}`,
    tempo,
    timeSignature,
    events,
    duration,
    measures: apiData.totalMeasures
  }
}

/**
 * Create MIDIData from measure-based note arrays
 * Useful for creating test data or programmatic sequences
 */
export function createMIDIDataFromNotes(
  notes: Array<{
    midiNote: number
    measure: number
    beat: number
    duration: number
    velocity?: number
    voice?: VoiceName
  }>,
  config: {
    name?: string
    tempo?: number
    timeSignature?: { numerator: number; denominator: number }
    totalMeasures?: number
  } = {}
): MIDIData {
  const {
    name = 'Untitled',
    tempo = 120,
    timeSignature = { numerator: 4, denominator: 4 }
  } = config

  const beatsPerMeasure = timeSignature.numerator
  const events: MIDIEvent[] = []

  let maxMeasure = 1

  for (const note of notes) {
    maxMeasure = Math.max(maxMeasure, note.measure)

    // Calculate absolute beat position
    const absoluteBeat = (note.measure - 1) * beatsPerMeasure + (note.beat - 1)

    // Convert to time in seconds
    const startTime = beatToSeconds(absoluteBeat, tempo, timeSignature)
    const durationSeconds = beatsToSeconds(note.duration, tempo, timeSignature)

    // Create noteOn event
    events.push({
      type: 'noteOn',
      time: startTime,
      data: {
        midiNote: note.midiNote,
        velocity: note.velocity ?? 80
      }
    } as NoteMIDIEvent)

    // Create noteOff event
    events.push({
      type: 'noteOff',
      time: startTime + durationSeconds,
      data: {
        midiNote: note.midiNote,
        velocity: 0
      }
    } as NoteMIDIEvent)
  }

  // Sort events
  events.sort((a, b) => {
    if (a.time !== b.time) {
      return a.time - b.time
    }
    if (a.type === 'noteOff' && b.type === 'noteOn') return -1
    if (a.type === 'noteOn' && b.type === 'noteOff') return 1
    return 0
  })

  const totalMeasures = config.totalMeasures ?? maxMeasure
  const duration = beatToSeconds(totalMeasures * beatsPerMeasure, tempo, timeSignature)

  return {
    name,
    tempo,
    timeSignature,
    events,
    duration,
    measures: totalMeasures
  }
}

/**
 * Create a simple scale for testing
 */
export function createTestScale(
  startNote: number = 60,
  tempo: number = 120
): MIDIData {
  const scaleNotes = [0, 2, 4, 5, 7, 9, 11, 12] // Major scale intervals

  const notes = scaleNotes.map((interval, index) => ({
    midiNote: startNote + interval,
    measure: 1,
    beat: index + 1,
    duration: 0.5,
    velocity: 80
  }))

  return createMIDIDataFromNotes(notes, {
    name: 'Test Scale',
    tempo,
    timeSignature: { numerator: 8, denominator: 4 },
    totalMeasures: 1
  })
}

/**
 * Create a simple chord progression for testing
 */
export function createTestChordProgression(tempo: number = 80): MIDIData {
  // I - IV - V - I progression in C major
  const chords = [
    { notes: [60, 64, 67], measure: 1 },      // C major (C-E-G)
    { notes: [60, 65, 69], measure: 2 },      // F major (C-F-A)
    { notes: [59, 62, 67], measure: 3 },      // G major (B-D-G)
    { notes: [60, 64, 67], measure: 4 }       // C major (C-E-G)
  ]

  const notes: Array<{
    midiNote: number
    measure: number
    beat: number
    duration: number
    velocity?: number
  }> = []

  for (const chord of chords) {
    for (const midiNote of chord.notes) {
      notes.push({
        midiNote,
        measure: chord.measure,
        beat: 1,
        duration: 4, // Whole note
        velocity: 70
      })
    }
  }

  return createMIDIDataFromNotes(notes, {
    name: 'Test Chord Progression',
    tempo,
    timeSignature: { numerator: 4, denominator: 4 },
    totalMeasures: 4
  })
}

/**
 * Validate MIDIData structure
 */
export function validateMIDIData(data: MIDIData): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.tempo || data.tempo <= 0) {
    errors.push('Invalid tempo: must be a positive number')
  }

  if (!data.timeSignature?.numerator || !data.timeSignature?.denominator) {
    errors.push('Invalid time signature')
  }

  if (!Array.isArray(data.events)) {
    errors.push('Events must be an array')
  } else {
    for (let i = 0; i < data.events.length; i++) {
      const event = data.events[i]
      if (typeof event.time !== 'number' || event.time < 0) {
        errors.push(`Event ${i}: Invalid time value`)
      }
      if (!['noteOn', 'noteOff', 'tempo', 'timeSignature', 'marker'].includes(event.type)) {
        errors.push(`Event ${i}: Invalid event type: ${event.type}`)
      }
    }
  }

  if (typeof data.duration !== 'number' || data.duration < 0) {
    errors.push('Invalid duration')
  }

  if (typeof data.measures !== 'number' || data.measures < 0) {
    errors.push('Invalid measures count')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
