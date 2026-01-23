import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { measureParamsSchema, validateOrError } from '@/lib/api/validation';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; measureNum: string } }
) {
  try {
    // Validate route parameters
    const validation = validateOrError(measureParamsSchema, params);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, details: validation.details },
        { status: 400 }
      );
    }

    const { id: pieceId, measureNum: measureNumber } = validation.data;

    const measure = await db.measure.findUnique({
      where: {
        pieceId_measureNumber: {
          pieceId,
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
