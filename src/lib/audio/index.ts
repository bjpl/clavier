/**
 * Audio Module
 * Exports all audio-related functionality for the Clavier music learning app
 */

// Core audio engine
export {
  AudioEngine,
  getGlobalAudioEngine,
  resetGlobalAudioEngine,
  isWebAudioSupported
} from './audio-engine'
export type { AudioEngineState, AudioEngineCallbacks } from './audio-engine'

// MIDI playback
export { MIDIPlayer } from './midi-player'
export type { MIDIPlayerConfig, ExtendedNoteEvent } from './midi-player'

// MIDI converter (API data to internal format)
export {
  convertAPIMidiData,
  createMIDIDataFromNotes,
  createTestScale,
  createTestChordProgression,
  parseTimeSignature,
  voiceNumberToName,
  beatToSeconds,
  beatsToSeconds,
  validateMIDIData
} from './midi-converter'
export type {
  APIMidiData,
  APIMidiMeasure,
  APIMidiNote,
  MIDIConversionConfig
} from './midi-converter'

// Type definitions
export type {
  NoteEvent,
  MIDIEvent,
  MIDIEventType,
  NoteMIDIEvent,
  TempoEvent,
  TimeSignatureEvent,
  MeasureBeat,
  MIDIData,
  PlaybackState,
  LoopRegion,
  PlaybackCallbacks,
  AudioEngineConfig
} from './types'

export { PIANO_NOTES, midiToNoteName, noteNameToMidi } from './types'
