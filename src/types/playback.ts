/**
 * Playback state and control type definitions for Clavier
 *
 * Defines all types related to audio playback, MIDI control,
 * and interactive music player functionality.
 */

import { VoiceName } from './music';

/**
 * Main playback state
 */
export interface PlaybackState {
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Currently loaded piece ID */
  currentPieceId?: string;
  /** Current measure number */
  currentMeasure: number;
  /** Current beat within the measure */
  currentBeat: number;
  /** Absolute beat position from start of piece */
  absoluteBeat: number;
  /** Current tempo in BPM */
  tempo: number;
  /** Master volume (0-1) */
  volume: number;
  /** Individual voice volumes (0-1) */
  voiceVolumes: {
    [K in VoiceName]: number;
  };
  /** Muted voices */
  mutedVoices: VoiceName[];
  /** Solo voice (if any) */
  soloVoice?: VoiceName;
  /** Loop configuration */
  loop: LoopConfig;
  /** Currently sounding notes */
  activeNotes: ActiveNote[];
  /** Playback mode */
  mode: PlaybackMode;
  /** Whether to follow along visually during playback */
  followPlayback: boolean;
  /** Metronome settings */
  metronome: MetronomeSettings;
  /** Audio context state */
  audioContextState: 'running' | 'suspended' | 'closed';
}

/**
 * Playback mode options
 */
export type PlaybackMode =
  | 'normal'        // Standard playback
  | 'practice'      // Slower tempo, can pause between measures
  | 'loop'          // Loop the current selection
  | 'analysis';     // Step through measure by measure

/**
 * Loop configuration
 */
export interface LoopConfig {
  /** Whether looping is enabled */
  enabled: boolean;
  /** Start measure for loop */
  startMeasure: number;
  /** End measure for loop */
  endMeasure: number;
  /** Number of times to loop (0 = infinite) */
  repeatCount: number;
  /** Current loop iteration */
  currentIteration: number;
}

/**
 * Currently playing note
 */
export interface ActiveNote {
  /** Note ID from the piece */
  noteId: string;
  /** MIDI note number */
  midiNumber: number;
  /** Voice this note belongs to */
  voice: VoiceName;
  /** Start time (performance time in seconds) */
  startTime: number;
  /** Scheduled end time (performance time in seconds) */
  endTime: number;
  /** Current velocity (0-127) */
  velocity: number;
}

/**
 * Metronome settings
 */
export interface MetronomeSettings {
  /** Whether metronome is enabled */
  enabled: boolean;
  /** Volume of metronome (0-1) */
  volume: number;
  /** Sound type */
  sound: 'click' | 'beep' | 'wood-block' | 'hi-hat';
  /** Accent first beat of measure */
  accentFirstBeat: boolean;
  /** Count-in measures before playback starts */
  countIn: number;
}

/**
 * Playback event types
 */
export type PlaybackEventType =
  | 'play'
  | 'pause'
  | 'stop'
  | 'seek'
  | 'note-on'
  | 'note-off'
  | 'measure-change'
  | 'beat-change'
  | 'loop-start'
  | 'loop-end'
  | 'tempo-change'
  | 'volume-change'
  | 'piece-loaded'
  | 'piece-ended';

/**
 * Playback event
 */
export interface PlaybackEvent {
  /** Event type */
  type: PlaybackEventType;
  /** Timestamp when event occurred */
  timestamp: number;
  /** Event-specific data */
  data?: unknown;
}

/**
 * Note-on event data
 */
export interface NoteOnEvent extends PlaybackEvent {
  type: 'note-on';
  data: {
    noteId: string;
    midiNumber: number;
    voice: VoiceName;
    velocity: number;
  };
}

/**
 * Note-off event data
 */
export interface NoteOffEvent extends PlaybackEvent {
  type: 'note-off';
  data: {
    noteId: string;
    midiNumber: number;
    voice: VoiceName;
  };
}

/**
 * Measure change event data
 */
export interface MeasureChangeEvent extends PlaybackEvent {
  type: 'measure-change';
  data: {
    previousMeasure: number;
    currentMeasure: number;
  };
}

/**
 * Beat change event data
 */
export interface BeatChangeEvent extends PlaybackEvent {
  type: 'beat-change';
  data: {
    measure: number;
    beat: number;
    absoluteBeat: number;
  };
}

/**
 * Transport controls
 */
export interface TransportControls {
  /** Start playback */
  play: () => void;
  /** Pause playback */
  pause: () => void;
  /** Stop playback and return to start */
  stop: () => void;
  /** Seek to specific measure */
  seekToMeasure: (measure: number) => void;
  /** Seek to specific beat */
  seekToBeat: (absoluteBeat: number) => void;
  /** Skip forward one measure */
  skipForward: () => void;
  /** Skip backward one measure */
  skipBackward: () => void;
  /** Set tempo */
  setTempo: (bpm: number) => void;
  /** Set volume */
  setVolume: (volume: number) => void;
  /** Set voice volume */
  setVoiceVolume: (voice: VoiceName, volume: number) => void;
  /** Mute/unmute voice */
  toggleVoiceMute: (voice: VoiceName) => void;
  /** Solo a voice */
  setSoloVoice: (voice?: VoiceName) => void;
  /** Configure loop */
  setLoop: (config: Partial<LoopConfig>) => void;
  /** Toggle loop */
  toggleLoop: () => void;
}

/**
 * Audio engine configuration
 */
export interface AudioEngineConfig {
  /** Sample rate */
  sampleRate: number;
  /** Latency hint for Web Audio API */
  latencyHint: 'interactive' | 'balanced' | 'playback';
  /** Whether to use Web MIDI API if available */
  useMidi: boolean;
  /** MIDI output device ID */
  midiOutputId?: string;
  /** Audio output device ID */
  audioOutputId?: string;
  /** Buffer size */
  bufferSize: number;
  /** Whether to use AudioWorklet (vs ScriptProcessor) */
  useAudioWorklet: boolean;
}

/**
 * Instrument/voice configuration
 */
export interface VoiceConfig {
  /** Voice name */
  voice: VoiceName;
  /** Instrument sound */
  instrument: InstrumentType;
  /** Pan position (-1 to 1) */
  pan: number;
  /** Reverb amount (0-1) */
  reverb: number;
  /** Chorus amount (0-1) */
  chorus: number;
  /** ADSR envelope */
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

/**
 * Available instrument types
 */
export type InstrumentType =
  | 'piano'
  | 'harpsichord'
  | 'organ'
  | 'strings'
  | 'choir'
  | 'synthesizer';

/**
 * Visualization sync data
 */
export interface VisualizationSync {
  /** Current measure to highlight */
  currentMeasure: number;
  /** Current beat to highlight */
  currentBeat: number;
  /** Notes to highlight */
  highlightNotes: string[];
  /** Playhead position (0-1) within current measure */
  playheadPosition: number;
}

/**
 * Practice mode settings
 */
export interface PracticeModeSettings {
  /** Slow down tempo by percentage (0.5 = 50% speed) */
  tempoMultiplier: number;
  /** Pause between measures */
  pauseBetweenMeasures: boolean;
  /** Pause duration in seconds */
  pauseDuration: number;
  /** Show note names during playback */
  showNoteNames: boolean;
  /** Highlight upcoming notes (beats ahead) */
  highlightAhead: number;
  /** Allow manual advancing to next measure */
  manualAdvance: boolean;
}

/**
 * Recording state (for student recordings)
 */
export interface RecordingState {
  /** Whether recording is active */
  isRecording: boolean;
  /** Recording start time */
  startTime?: number;
  /** Recorded MIDI events */
  recordedEvents: Array<{
    type: 'note-on' | 'note-off';
    midiNumber: number;
    velocity: number;
    timestamp: number;
  }>;
  /** Audio recording blob (if recording audio) */
  audioBlob?: Blob;
}
