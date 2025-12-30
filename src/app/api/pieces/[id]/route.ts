import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const piece = await db.piece.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            measures: true,
            annotations: true,
            featureInstances: true,
          },
        },
      },
    });

    if (!piece) {
      return NextResponse.json(
        { error: 'Piece not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(piece);
  } catch (error) {
    console.error('Error fetching piece:', error);
    return NextResponse.json(
      { error: 'Failed to fetch piece' },
      { status: 500 }
    );
  }
}
