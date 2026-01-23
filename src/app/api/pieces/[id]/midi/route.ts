import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimitApp, rateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit';

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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Apply rate limiting: 100 requests per minute
  const rateLimitResult = await rateLimitApp(request, {
    interval: 60 * 1000,
    uniqueTokenPerInterval: 100,
  });

  if (!rateLimitResult.allowed) {
    return rateLimitResponse(rateLimitResult);
  }

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
      return addRateLimitHeaders(
        NextResponse.json({ error: 'Piece not found' }, { status: 404 }),
        rateLimitResult
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

    return addRateLimitHeaders(
      NextResponse.json(midiData, {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      }),
      rateLimitResult
    );
  } catch (error) {
    console.error('Error fetching MIDI data:', error);
    return addRateLimitHeaders(
      NextResponse.json({ error: 'Failed to fetch MIDI data' }, { status: 500 }),
      rateLimitResult
    );
  }
}
