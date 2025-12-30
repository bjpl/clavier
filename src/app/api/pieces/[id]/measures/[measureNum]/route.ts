import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; measureNum: string } }
) {
  try {
    const measureNumber = parseInt(params.measureNum, 10);

    if (isNaN(measureNumber)) {
      return NextResponse.json(
        { error: 'Invalid measure number' },
        { status: 400 }
      );
    }

    const measure = await db.measure.findUnique({
      where: {
        pieceId_measureNumber: {
          pieceId: params.id,
          measureNumber,
        },
      },
      include: {
        notes: {
          orderBy: [
            { voice: 'asc' },
            { startBeat: 'asc' },
          ],
        },
        annotations: true,
        piece: {
          select: {
            keyTonic: true,
            keyMode: true,
            timeSignature: true,
          },
        },
      },
    });

    if (!measure) {
      return NextResponse.json(
        { error: 'Measure not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(measure);
  } catch (error) {
    console.error('Error fetching measure:', error);
    return NextResponse.json(
      { error: 'Failed to fetch measure' },
      { status: 500 }
    );
  }
}
