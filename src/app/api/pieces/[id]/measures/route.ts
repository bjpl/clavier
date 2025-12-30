import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const measures = await db.measure.findMany({
      where: { pieceId: params.id },
      orderBy: { measureNumber: 'asc' },
      include: {
        notes: {
          orderBy: [
            { voice: 'asc' },
            { startBeat: 'asc' },
          ],
        },
        annotations: {
          where: {
            annotationType: 'HARMONY',
          },
        },
      },
    });

    return NextResponse.json({ measures });
  } catch (error) {
    console.error('Error fetching measures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch measures' },
      { status: 500 }
    );
  }
}
