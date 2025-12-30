import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instance = await db.featureInstance.findUnique({
      where: { id: params.id },
      include: {
        feature: {
          include: {
            parent: true,
          },
        },
        piece: {
          include: {
            measures: {
              where: {
                measureNumber: {
                  gte: 0, // Will be replaced by actual range
                },
              },
              include: {
                notes: true,
              },
            },
          },
        },
      },
    });

    if (!instance) {
      return NextResponse.json(
        { error: 'Feature instance not found' },
        { status: 404 }
      );
    }

    // Filter measures to only include the relevant range
    const filteredPiece = {
      ...instance.piece,
      measures: instance.piece.measures.filter(
        m => m.measureNumber >= instance.measureStart &&
             m.measureNumber <= instance.measureEnd
      ),
    };

    return NextResponse.json({
      ...instance,
      piece: filteredPiece,
    });
  } catch (error) {
    console.error('Error fetching feature instance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature instance' },
      { status: 500 }
    );
  }
}
