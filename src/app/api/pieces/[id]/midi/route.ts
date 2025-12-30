import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface MidiNote {
  midiNumber: number;
  startBeat: number;
  durationBeats: number;
  voice: number;
  startTimeSeconds?: number;
  durationSeconds?: number;
}

interface MidiData {
  pieceId: string;
  bwvNumber: number;
  timeSignature: string;
  totalMeasures: number;
  totalDurationSeconds?: number;
  measures: Array<{
    measureNumber: number;
    notes: MidiNote[];
  }>;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const piece = await db.piece.findUnique({
      where: { id: params.id },
      include: {
        measures: {
          include: {
            notes: {
              select: {
                midiNumber: true,
                startBeat: true,
                durationBeats: true,
                voice: true,
              },
              orderBy: [
                { voice: 'asc' },
                { startBeat: 'asc' },
              ],
            },
          },
          orderBy: { measureNumber: 'asc' },
        },
      },
    });

    if (!piece) {
      return NextResponse.json(
        { error: 'Piece not found' },
        { status: 404 }
      );
    }

    const midiData: MidiData = {
      pieceId: piece.id,
      bwvNumber: piece.bwvNumber,
      timeSignature: piece.timeSignature,
      totalMeasures: piece.totalMeasures,
      totalDurationSeconds: piece.totalDurationSeconds ?? undefined,
      measures: piece.measures.map(measure => ({
        measureNumber: measure.measureNumber,
        notes: measure.notes.map(note => ({
          midiNumber: note.midiNumber,
          startBeat: note.startBeat,
          durationBeats: note.durationBeats,
          voice: note.voice,
        })),
      })),
    };

    return NextResponse.json(midiData);
  } catch (error) {
    console.error('Error fetching MIDI data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MIDI data' },
      { status: 500 }
    );
  }
}
