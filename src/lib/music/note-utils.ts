/**
 * Music theory utilities for note manipulation and conversion
 */

export type VoiceName = 'soprano' | 'alto' | 'tenor' | 'bass';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEY_OFFSETS = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#

/**
 * Convert MIDI note number to note name with octave
 * @example midiToNoteName(60) // "C4"
 */
export function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const pitchClass = midi % 12;
  return `${NOTE_NAMES[pitchClass]}${octave}`;
}

/**
 * Convert note name to MIDI number
 * @example noteNameToMidi("C4") // 60
 */
export function noteNameToMidi(name: string): number {
  const match = name.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) {
    throw new Error(`Invalid note name: ${name}`);
  }

  const [, noteName, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const pitchClass = NOTE_NAMES.indexOf(noteName);

  if (pitchClass === -1) {
    throw new Error(`Invalid note name: ${noteName}`);
  }

  return (octave + 1) * 12 + pitchClass;
}

/**
 * Check if a MIDI note is a black key
 */
export function isBlackKey(midi: number): boolean {
  const pitchClass = midi % 12;
  return BLACK_KEY_OFFSETS.includes(pitchClass);
}

/**
 * Get the octave number for a MIDI note
 */
export function getOctave(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

/**
 * Get the pitch class name (without octave)
 * @example getPitchClass(60) // "C"
 */
export function getPitchClass(midi: number): string {
  return NOTE_NAMES[midi % 12];
}

/**
 * Get the voice color for highlighting
 */
export function getVoiceColor(voice: VoiceName): string {
  const colors: Record<VoiceName, string> = {
    soprano: '#2563EB', // Blue
    alto: '#059669',    // Green
    tenor: '#D97706',   // Orange
    bass: '#7C3AED',    // Purple
  };
  return colors[voice];
}

/**
 * Get all white key MIDI notes in a range
 */
export function getWhiteKeys(startNote: number, endNote: number): number[] {
  const keys: number[] = [];
  for (let midi = startNote; midi <= endNote; midi++) {
    if (!isBlackKey(midi)) {
      keys.push(midi);
    }
  }
  return keys;
}

/**
 * Get all black key MIDI notes in a range
 */
export function getBlackKeys(startNote: number, endNote: number): number[] {
  const keys: number[] = [];
  for (let midi = startNote; midi <= endNote; midi++) {
    if (isBlackKey(midi)) {
      keys.push(midi);
    }
  }
  return keys;
}

/**
 * Calculate the position of a black key relative to white keys
 * Returns the index of the white key to the left and offset percentage
 */
export function getBlackKeyPosition(midi: number): { whiteKeyIndex: number; offsetPercent: number } {
  if (!isBlackKey(midi)) {
    throw new Error(`MIDI note ${midi} is not a black key`);
  }

  const pitchClass = midi % 12;

  // Count white keys before this black key
  let whiteKeyIndex = 0;
  for (let i = 0; i < pitchClass; i++) {
    if (!BLACK_KEY_OFFSETS.includes(i)) {
      whiteKeyIndex++;
    }
  }

  // Determine offset based on position in black key group
  // C# and F# are positioned at 70% of white key width
  // D#, G#, A# are positioned at 50% of white key width
  const offsetPercent = pitchClass === 1 || pitchClass === 6 ? 0.7 : 0.5;

  return { whiteKeyIndex, offsetPercent };
}
