/**
 * Unit Tests: Audio Types
 * Tests for MIDI-to-note conversions and type utilities
 */

import { describe, it, expect } from 'vitest'
import { midiToNoteName, noteNameToMidi, PIANO_NOTES } from '@/lib/audio/types'

describe('Audio Types', () => {
  describe('midiToNoteName', () => {
    it('should convert middle C (MIDI 60) correctly', () => {
      expect(midiToNoteName(60)).toBe('C4')
    })

    it('should convert A4 (MIDI 69) correctly', () => {
      expect(midiToNoteName(69)).toBe('A4')
    })

    it('should convert lowest piano note (MIDI 21, A0)', () => {
      expect(midiToNoteName(21)).toBe('A0')
    })

    it('should convert highest piano note (MIDI 108, C8)', () => {
      expect(midiToNoteName(108)).toBe('C8')
    })

    it('should handle sharps correctly', () => {
      expect(midiToNoteName(61)).toBe('C#4') // C#4
      expect(midiToNoteName(63)).toBe('D#4') // Eb4/D#4
      expect(midiToNoteName(66)).toBe('F#4') // F#4
      expect(midiToNoteName(68)).toBe('G#4') // G#4
      expect(midiToNoteName(70)).toBe('A#4') // Bb4/A#4
    })

    it('should handle octave boundaries correctly', () => {
      expect(midiToNoteName(23)).toBe('B0')
      expect(midiToNoteName(24)).toBe('C1')
      expect(midiToNoteName(35)).toBe('B1')
      expect(midiToNoteName(36)).toBe('C2')
    })

    it('should handle MIDI 0 (C-1)', () => {
      expect(midiToNoteName(0)).toBe('C-1')
    })

    it('should handle MIDI 127', () => {
      expect(midiToNoteName(127)).toBe('G9')
    })

    it('should handle full chromatic scale in one octave', () => {
      const octave4 = [
        { midi: 60, note: 'C4' },
        { midi: 61, note: 'C#4' },
        { midi: 62, note: 'D4' },
        { midi: 63, note: 'D#4' },
        { midi: 64, note: 'E4' },
        { midi: 65, note: 'F4' },
        { midi: 66, note: 'F#4' },
        { midi: 67, note: 'G4' },
        { midi: 68, note: 'G#4' },
        { midi: 69, note: 'A4' },
        { midi: 70, note: 'A#4' },
        { midi: 71, note: 'B4' },
      ]

      octave4.forEach(({ midi, note }) => {
        expect(midiToNoteName(midi)).toBe(note)
      })
    })
  })

  describe('noteNameToMidi', () => {
    it('should convert middle C (C4) correctly', () => {
      expect(noteNameToMidi('C4')).toBe(60)
    })

    it('should convert A4 correctly', () => {
      expect(noteNameToMidi('A4')).toBe(69)
    })

    it('should convert A0 correctly', () => {
      expect(noteNameToMidi('A0')).toBe(21)
    })

    it('should convert C8 correctly', () => {
      expect(noteNameToMidi('C8')).toBe(108)
    })

    it('should handle sharps correctly', () => {
      expect(noteNameToMidi('C#4')).toBe(61)
      expect(noteNameToMidi('D#4')).toBe(63)
      expect(noteNameToMidi('F#4')).toBe(66)
      expect(noteNameToMidi('G#4')).toBe(68)
      expect(noteNameToMidi('A#4')).toBe(70)
    })

    it('should handle negative octaves', () => {
      expect(noteNameToMidi('C-1')).toBe(0)
    })

    it('should throw on invalid note name format', () => {
      expect(() => noteNameToMidi('invalid')).toThrow('Invalid note name')
      expect(() => noteNameToMidi('X4')).toThrow('Invalid note name')
      expect(() => noteNameToMidi('')).toThrow('Invalid note name')
      expect(() => noteNameToMidi('C')).toThrow('Invalid note name')
    })

    it('should be reversible with midiToNoteName', () => {
      const midiNotes = [21, 36, 48, 60, 72, 84, 96, 108]
      midiNotes.forEach(midi => {
        const noteName = midiToNoteName(midi)
        expect(noteNameToMidi(noteName)).toBe(midi)
      })
    })
  })

  describe('PIANO_NOTES constant', () => {
    it('should contain expected number of notes', () => {
      // 7 octaves * 4 samples per octave + C8 = 29 notes
      expect(PIANO_NOTES.length).toBe(29)
    })

    it('should start with C1', () => {
      expect(PIANO_NOTES[0]).toBe('C1')
    })

    it('should end with C8', () => {
      expect(PIANO_NOTES[PIANO_NOTES.length - 1]).toBe('C8')
    })

    it('should contain sample points at intervals of major third', () => {
      // Check that we have expected sample points
      expect(PIANO_NOTES).toContain('C1')
      expect(PIANO_NOTES).toContain('D#1')
      expect(PIANO_NOTES).toContain('F#1')
      expect(PIANO_NOTES).toContain('A1')
      expect(PIANO_NOTES).toContain('C4')
      expect(PIANO_NOTES).toContain('A4')
    })

    it('should not contain flats (only sharps)', () => {
      PIANO_NOTES.forEach(note => {
        expect(note).not.toContain('b')
      })
    })
  })
})
