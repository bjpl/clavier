/**
 * Audio Module
 * Exports all audio-related functionality for the Clavier music learning app
 */

// Core audio engine
export { AudioEngine, getGlobalAudioEngine, resetGlobalAudioEngine } from './audio-engine'

// MIDI playback
export { MIDIPlayer } from './midi-player'

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
