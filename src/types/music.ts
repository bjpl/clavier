/**
 * Music-related type definitions for Clavier
 *
 * This module contains all core music theory types including:
 * - Piece metadata and structure
 * - Musical notation elements (notes, chords, measures)
 * - Harmonic analysis structures
 */

/**
 * Type of musical piece
 */
export type PieceType = 'PRELUDE' | 'FUGUE';

/**
 * Musical key mode
 */
export type KeyMode = 'MAJOR' | 'MINOR';

/**
 * Voice names in SATB four-part harmony
 */
export type VoiceName = 'SOPRANO' | 'ALTO' | 'TENOR' | 'BASS';

/**
 * Pitch class representation (enharmonic spellings included)
 */
export type PitchClass =
  | 'C' | 'C#' | 'Db'
  | 'D' | 'D#' | 'Eb'
  | 'E' | 'E#' | 'Fb'
  | 'F' | 'F#' | 'Gb'
  | 'G' | 'G#' | 'Ab'
  | 'A' | 'A#' | 'Bb'
  | 'B' | 'B#' | 'Cb';

/**
 * Time signature representation
 */
export interface TimeSignature {
  /** Number of beats per measure */
  numerator: number;
  /** Note value that gets one beat (4 = quarter note, 8 = eighth note, etc.) */
  denominator: number;
}

/**
 * Musical note with pitch and duration
 */
export interface Note {
  /** Unique identifier for this note */
  id: string;
  /** Pitch class (C, D, E, etc.) */
  pitchClass: PitchClass;
  /** Octave number (4 = middle C octave) */
  octave: number;
  /** Voice this note belongs to */
  voice: VoiceName;
  /** Start time in beats from beginning of piece */
  startBeat: number;
  /** Duration in beats */
  duration: number;
  /** MIDI note number (60 = middle C) */
  midiNumber: number;
  /** Optional accidental override */
  accidental?: 'sharp' | 'flat' | 'natural' | 'double-sharp' | 'double-flat';
  /** Whether this note is tied to the previous note */
  tiedToPrevious?: boolean;
  /** Whether this note is tied to the next note */
  tiedToNext?: boolean;
}

/**
 * Chord structure with multiple notes
 */
export interface Chord {
  /** Unique identifier for this chord */
  id: string;
  /** Notes that make up this chord */
  notes: Note[];
  /** Start time in beats from beginning of piece */
  startBeat: number;
  /** Duration in beats */
  duration: number;
  /** Measure number this chord appears in */
  measureNumber: number;
  /** Beat position within the measure */
  beatInMeasure: number;
}

/**
 * Roman numeral analysis for harmonic function
 */
export interface RomanNumeral {
  /** Roman numeral notation (I, ii, V7, etc.) */
  numeral: string;
  /** Scale degree (1-7) */
  scaleDegree: number;
  /** Quality (major, minor, diminished, augmented) */
  quality: 'major' | 'minor' | 'diminished' | 'augmented';
  /** Inversion (0 = root position, 1 = first inversion, etc.) */
  inversion: number;
  /** Additional symbols (7, sus4, etc.) */
  extensions?: string[];
  /** Applied/secondary chord target (e.g., "V/V") */
  applied?: string;
}

/**
 * Harmonic analysis for a chord
 */
export interface HarmonicAnalysis {
  /** Unique identifier for this analysis */
  id: string;
  /** Reference to the chord being analyzed */
  chordId: string;
  /** Roman numeral representation */
  romanNumeral: RomanNumeral;
  /** Functional harmony label (tonic, dominant, subdominant, etc.) */
  function: 'tonic' | 'dominant' | 'subdominant' | 'mediant' | 'submediant' | 'leading-tone' | 'applied' | 'chromatic';
  /** Notes that are non-chord tones */
  nonChordTones?: Array<{
    noteId: string;
    type: 'passing' | 'neighbor' | 'suspension' | 'anticipation' | 'escape' | 'appoggiatura' | 'pedal';
  }>;
  /** Cadence type if this chord is part of a cadence */
  cadence?: 'authentic' | 'half' | 'deceptive' | 'plagal' | 'phrygian';
}

/**
 * Measure structure containing all musical elements
 */
export interface Measure {
  /** Measure number (1-indexed) */
  number: number;
  /** Start time in beats from beginning of piece */
  startBeat: number;
  /** Duration in beats */
  duration: number;
  /** Time signature for this measure */
  timeSignature: TimeSignature;
  /** All notes in this measure */
  notes: Note[];
  /** All chords in this measure */
  chords: Chord[];
  /** Harmonic analyses for chords in this measure */
  harmonicAnalyses: HarmonicAnalysis[];
  /** Key signature (number of sharps/flats, positive = sharps, negative = flats) */
  keySignature: number;
  /** Tempo marking (BPM) */
  tempo?: number;
  /** Tempo text (e.g., "Allegro", "Andante") */
  tempoText?: string;
  /** Dynamic marking (pp, p, mp, mf, f, ff, etc.) */
  dynamic?: string;
}

/**
 * Complete musical piece
 */
export interface Piece {
  /** Unique identifier for this piece */
  id: string;
  /** Title of the piece */
  title: string;
  /** Type of piece (prelude or fugue) */
  type: PieceType;
  /** Book number (1 or 2) */
  book: 1 | 2;
  /** Number within the book (1-24) */
  number: number;
  /** Key of the piece */
  key: PitchClass;
  /** Mode (major or minor) */
  mode: KeyMode;
  /** BWV (Bach-Werke-Verzeichnis) number */
  bwv: number;
  /** Total duration in beats */
  totalBeats: number;
  /** All measures in the piece */
  measures: Measure[];
  /** Total number of measures */
  totalMeasures: number;
  /** Default tempo (BPM) */
  defaultTempo: number;
  /** Composer (always "J.S. Bach" for WTC) */
  composer: string;
  /** Optional piece description */
  description?: string;
  /** Tags for categorization */
  tags?: string[];
}
