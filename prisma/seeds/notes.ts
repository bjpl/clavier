import { PrismaClient } from '@prisma/client';

/**
 * BWV 846 - Prelude in C Major (Well-Tempered Clavier Book I)
 * Famous broken chord pattern - each measure has arpeggiated figures
 *
 * Note data structure:
 * - midiNumber: MIDI note number (60 = C4)
 * - startBeat: Beat position in measure (1-based)
 * - durationBeats: Duration in beats
 * - voice: Voice number (1-5)
 */

interface NoteData {
  midiNumber: number;
  startBeat: number;
  durationBeats: number;
  voice: number;
  pitchClass: string;
  octave: number;
}

// BWV 846 Prelude - Broken chord pattern
// Each measure has the pattern: bass, inner voices arpeggiated
// Time signature: 4/4, each beat divided into 16th notes

function createMeasureNotes(
  measureNumber: number,
  bass: number,
  chord: number[], // Array of MIDI numbers for the chord
  bassOctave: number = 2
): NoteData[] {
  const notes: NoteData[] = [];

  // The pattern repeats twice per measure (beats 1-2 and 3-4)
  // Each half has: bass (held), then 3 chord tones arpeggiated twice

  const pattern = [
    // First half (beats 1-2)
    { startBeat: 1.0, duration: 2.0, note: bass, voice: 5 },      // Bass, held
    { startBeat: 1.0, duration: 0.25, note: chord[0], voice: 3 }, // Arpeggio
    { startBeat: 1.25, duration: 0.25, note: chord[1], voice: 2 },
    { startBeat: 1.5, duration: 0.25, note: chord[2], voice: 1 },
    { startBeat: 1.75, duration: 0.25, note: chord[1], voice: 2 },
    { startBeat: 2.0, duration: 0.25, note: chord[0], voice: 3 },
    { startBeat: 2.25, duration: 0.25, note: chord[1], voice: 2 },
    { startBeat: 2.5, duration: 0.25, note: chord[2], voice: 1 },
    { startBeat: 2.75, duration: 0.25, note: chord[1], voice: 2 },
    // Second half (beats 3-4) - repeat pattern
    { startBeat: 3.0, duration: 2.0, note: bass, voice: 5 },      // Bass, held
    { startBeat: 3.0, duration: 0.25, note: chord[0], voice: 3 },
    { startBeat: 3.25, duration: 0.25, note: chord[1], voice: 2 },
    { startBeat: 3.5, duration: 0.25, note: chord[2], voice: 1 },
    { startBeat: 3.75, duration: 0.25, note: chord[1], voice: 2 },
    { startBeat: 4.0, duration: 0.25, note: chord[0], voice: 3 },
    { startBeat: 4.25, duration: 0.25, note: chord[1], voice: 2 },
    { startBeat: 4.5, duration: 0.25, note: chord[2], voice: 1 },
    { startBeat: 4.75, duration: 0.25, note: chord[1], voice: 2 },
  ];

  for (const p of pattern) {
    const midiNumber = p.note;
    const octave = Math.floor((midiNumber - 12) / 12);
    const pitchClass = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][midiNumber % 12];

    notes.push({
      midiNumber,
      startBeat: p.startBeat,
      durationBeats: p.duration,
      voice: p.voice,
      pitchClass,
      octave,
    });
  }

  return notes;
}

// MIDI note numbers: C4 = 60, C3 = 48, C2 = 36
// BWV 846 measures 1-35 chord progressions (simplified authentic voicings)
const BWV846_MEASURES: Array<{ bass: number; chord: number[] }> = [
  // Measure 1: C major
  { bass: 36, chord: [52, 55, 60, 64] },  // C2, E3-G3-C4-E4
  // Measure 2: Dm7/C (ii7)
  { bass: 36, chord: [50, 57, 60, 65] },  // C2, D3-A3-C4-F4
  // Measure 3: G7/B (V7)
  { bass: 35, chord: [50, 55, 59, 62] },  // B1, D3-G3-B3-D4
  // Measure 4: C major
  { bass: 36, chord: [52, 55, 60, 64] },  // C2, E3-G3-C4-E4
  // Measure 5: Am/E
  { bass: 40, chord: [52, 57, 60, 64] },  // E2, E3-A3-C4-E4
  // Measure 6: D7/F#
  { bass: 42, chord: [50, 57, 60, 66] },  // F#2, D3-A3-C4-F#4
  // Measure 7: G major
  { bass: 43, chord: [50, 55, 59, 62] },  // G2, D3-G3-B3-D4
  // Measure 8: C/G
  { bass: 43, chord: [52, 55, 60, 64] },  // G2, E3-G3-C4-E4
  // Measure 9: Am
  { bass: 45, chord: [52, 57, 60, 64] },  // A2, E3-A3-C4-E4
  // Measure 10: D7
  { bass: 38, chord: [54, 57, 60, 66] },  // D2, F#3-A3-C4-F#4
  // Measure 11: G7
  { bass: 43, chord: [50, 53, 59, 62] },  // G2, D3-F3-B3-D4
  // Measure 12: C
  { bass: 36, chord: [52, 55, 60, 64] },  // C2, E3-G3-C4-E4
  // Measure 13: F#dim7
  { bass: 42, chord: [48, 52, 57, 60] },  // F#2, C3-E3-A3-C4
  // Measure 14: Bdim/Ab
  { bass: 44, chord: [47, 53, 56, 59] },  // Ab2, B2-F3-Ab3-B3
  // Measure 15: G/B
  { bass: 35, chord: [50, 55, 59, 62] },  // B1, D3-G3-B3-D4
  // Measure 16: G7sus4
  { bass: 43, chord: [48, 53, 60, 65] },  // G2, C3-F3-C4-F4
  // Measure 17: G7
  { bass: 43, chord: [47, 53, 59, 62] },  // G2, B2-F3-B3-D4
  // Measure 18: Em/G
  { bass: 43, chord: [52, 55, 59, 64] },  // G2, E3-G3-B3-E4
  // Measure 19: Am7/G
  { bass: 43, chord: [52, 55, 60, 64] },  // G2, E3-G3-C4-E4
  // Measure 20: D7/F#
  { bass: 42, chord: [50, 54, 60, 66] },  // F#2, D3-F#3-C4-F#4
  // Measures 21-35: Continue with similar patterns
  { bass: 43, chord: [50, 55, 59, 62] },  // G
  { bass: 43, chord: [52, 55, 60, 64] },  // C/G
  { bass: 45, chord: [52, 57, 60, 64] },  // Am
  { bass: 40, chord: [52, 55, 59, 64] },  // Em/E
  { bass: 38, chord: [50, 57, 62, 66] },  // D
  { bass: 43, chord: [47, 53, 59, 62] },  // G7
  { bass: 36, chord: [52, 55, 60, 64] },  // C
  { bass: 36, chord: [52, 55, 60, 64] },  // C
  { bass: 41, chord: [53, 56, 60, 65] },  // F
  { bass: 42, chord: [51, 54, 57, 63] },  // F#dim
  { bass: 43, chord: [50, 55, 59, 62] },  // G
  { bass: 43, chord: [47, 53, 59, 65] },  // G7
  { bass: 36, chord: [52, 55, 60, 64] },  // C
  { bass: 36, chord: [52, 55, 60, 67] },  // C (final, higher voicing)
  { bass: 36, chord: [48, 55, 60, 67] },  // C (final chord)
];

export async function seedNotes(prisma: PrismaClient) {
  console.log('Seeding notes for BWV 846 Prelude...');

  // Find BWV 846 Prelude piece
  const piece = await prisma.piece.findFirst({
    where: {
      bwvNumber: 846,
      type: 'PRELUDE',
    },
    include: {
      measures: {
        orderBy: { measureNumber: 'asc' },
      },
    },
  });

  if (!piece) {
    console.log('⚠ BWV 846 Prelude not found. Run seedPieces first.');
    return;
  }

  // Update the musicxmlPath for BWV 846 Prelude
  if (!piece.musicxmlPath) {
    await prisma.piece.update({
      where: { id: piece.id },
      data: { musicxmlPath: 'public/scores/bwv846-prelude.musicxml' },
    });
    console.log('  ✓ Updated musicxmlPath for BWV 846 Prelude');
  }

  // Check if notes already exist
  const existingNotes = await prisma.note.count({
    where: {
      measure: {
        pieceId: piece.id,
      },
    },
  });

  if (existingNotes > 0) {
    console.log(`⚠ Notes already exist for BWV 846 (${existingNotes} notes). Skipping.`);
    return;
  }

  let totalNotes = 0;
  const measureCount = Math.min(piece.measures.length, BWV846_MEASURES.length);

  for (let i = 0; i < measureCount; i++) {
    const measure = piece.measures[i];
    const chordData = BWV846_MEASURES[i];

    const notes = createMeasureNotes(
      measure.measureNumber,
      chordData.bass,
      chordData.chord
    );

    // Create notes for this measure
    await prisma.note.createMany({
      data: notes.map(note => ({
        measureId: measure.id,
        voice: note.voice,
        pitchClass: note.pitchClass,
        octave: note.octave,
        midiNumber: note.midiNumber,
        startBeat: note.startBeat,
        durationBeats: note.durationBeats,
      })),
    });

    totalNotes += notes.length;
  }

  console.log(`✓ Created ${totalNotes} notes for BWV 846 Prelude (${measureCount} measures)`);
}

/**
 * Seed simple notes for all other pieces (placeholder data)
 * Creates a basic chord pattern so playback works
 */
export async function seedPlaceholderNotes(prisma: PrismaClient) {
  console.log('Seeding placeholder notes for other pieces...');

  // Get all pieces that don't have notes yet
  const piecesWithoutNotes = await prisma.piece.findMany({
    where: {
      NOT: {
        bwvNumber: 846,
        type: 'PRELUDE',
      },
    },
    include: {
      measures: {
        include: {
          notes: true,
        },
        orderBy: { measureNumber: 'asc' },
        take: 5, // Only seed first 5 measures for demo
      },
    },
  });

  let totalPieces = 0;
  let totalNotes = 0;

  for (const piece of piecesWithoutNotes) {
    // Skip if piece already has notes
    const hasNotes = piece.measures.some(m => m.notes.length > 0);
    if (hasNotes) continue;

    // Create simple chord based on key
    const keyToMidi: Record<string, number> = {
      'C': 60, 'C#': 61, 'Db': 61,
      'D': 62, 'D#': 63, 'Eb': 63,
      'E': 64,
      'F': 65, 'F#': 66, 'Gb': 66,
      'G': 67, 'G#': 68, 'Ab': 68,
      'A': 69, 'A#': 70, 'Bb': 70,
      'B': 71,
    };

    const rootMidi = keyToMidi[piece.keyTonic] || 60;
    const thirdOffset = piece.keyMode === 'MAJOR' ? 4 : 3;

    // Basic triad
    const chord = [
      rootMidi - 12,      // Bass
      rootMidi,           // Root
      rootMidi + thirdOffset, // Third
      rootMidi + 7,       // Fifth
    ];

    for (const measure of piece.measures) {
      const notes = createMeasureNotes(measure.measureNumber, chord[0], chord.slice(1));

      await prisma.note.createMany({
        data: notes.map(note => ({
          measureId: measure.id,
          voice: note.voice,
          pitchClass: note.pitchClass,
          octave: note.octave,
          midiNumber: note.midiNumber,
          startBeat: note.startBeat,
          durationBeats: note.durationBeats,
        })),
      });

      totalNotes += notes.length;
    }

    totalPieces++;
  }

  console.log(`✓ Created ${totalNotes} placeholder notes for ${totalPieces} pieces`);
}
