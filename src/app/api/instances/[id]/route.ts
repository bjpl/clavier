import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch the instance with feature and piece details
    const instance = await db.featureInstance.findUnique({
      where: { id: params.id },
      include: {
        feature: {
          include: {
            parent: true,
            children: true,
          },
        },
        piece: true,
      },
    });

    if (!instance) {
      return NextResponse.json(
        { error: 'Feature instance not found' },
        { status: 404 }
      );
    }

    // Fetch measures within the instance range (with a buffer for context)
    const measureBuffer = 1;
    const measures = await db.measure.findMany({
      where: {
        pieceId: instance.pieceId,
        measureNumber: {
          gte: Math.max(1, instance.measureStart - measureBuffer),
          lte: instance.measureEnd + measureBuffer,
        },
      },
      include: {
        notes: {
          orderBy: [
            { voice: 'asc' },
            { startBeat: 'asc' },
          ],
        },
      },
      orderBy: {
        measureNumber: 'asc',
      },
    });

    // Fetch related annotations for this measure range
    const annotations = await db.annotation.findMany({
      where: {
        pieceId: instance.pieceId,
        OR: [
          // Annotations that start within the range
          {
            measureStart: {
              gte: instance.measureStart,
              lte: instance.measureEnd,
            },
          },
          // Annotations that span across the range
          {
            measureStart: { lte: instance.measureStart },
            measureEnd: { gte: instance.measureEnd },
          },
          // Annotations that overlap the range
          {
            measureStart: { lte: instance.measureEnd },
            measureEnd: { gte: instance.measureStart },
          },
        ],
      },
      orderBy: {
        measureStart: 'asc',
      },
    });

    // Find related instances (same feature in other pieces, limit to 5)
    const relatedInstances = await db.featureInstance.findMany({
      where: {
        featureId: instance.featureId,
        id: { not: instance.id },
      },
      include: {
        piece: {
          select: {
            id: true,
            bwvNumber: true,
            type: true,
            keyTonic: true,
            keyMode: true,
            book: true,
          },
        },
      },
      orderBy: [
        { qualityScore: 'desc' },
        { piece: { bwvNumber: 'asc' } },
      ],
      take: 5,
    });

    // Build the enhanced piece with filtered measures
    const enhancedPiece = {
      ...instance.piece,
      measures: measures.filter(
        m => m.measureNumber >= instance.measureStart &&
             m.measureNumber <= instance.measureEnd
      ),
      contextMeasures: measures,
    };

    return NextResponse.json({
      ...instance,
      piece: enhancedPiece,
      annotations,
      relatedInstances,
    });
  } catch (error) {
    console.error('Error fetching feature instance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature instance' },
      { status: 500 }
    );
  }
}
