import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { PieceType } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Support both ID and slug lookup
    const feature = await db.feature.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            description: true,
            difficultyLevel: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      );
    }

    // Check if stats were requested
    const includeStats = request.nextUrl.searchParams.get('stats') === 'true';

    if (includeStats) {
      // Fetch instances for statistics
      const instances = await db.featureInstance.findMany({
        where: { featureId: feature.id },
        include: {
          piece: {
            select: {
              id: true,
              book: true,
              keyTonic: true,
              keyMode: true,
              type: true,
            },
          },
        },
      });

      // Calculate statistics
      const keyDistribution: Record<string, number> = {};
      const bookDistribution: Record<string, number> = { '1': 0, '2': 0 };
      const typeDistribution: Record<PieceType, number> = { PRELUDE: 0, FUGUE: 0 };
      const pieceSet = new Set<string>();

      for (const instance of instances) {
        const piece = instance.piece;
        pieceSet.add(piece.id);

        // Key distribution
        const keyLabel = `${piece.keyTonic} ${piece.keyMode.toLowerCase()}`;
        keyDistribution[keyLabel] = (keyDistribution[keyLabel] || 0) + 1;

        // Book distribution
        bookDistribution[String(piece.book)] = (bookDistribution[String(piece.book)] || 0) + 1;

        // Type distribution
        typeDistribution[piece.type] = (typeDistribution[piece.type] || 0) + 1;
      }

      return NextResponse.json({
        ...feature,
        stats: {
          instanceCount: instances.length,
          pieceCount: pieceSet.size,
          keyDistribution,
          bookDistribution,
          typeDistribution,
        },
      });
    }

    // Return basic feature without stats (faster)
    const instanceCount = await db.featureInstance.count({
      where: { featureId: feature.id },
    });

    return NextResponse.json({
      ...feature,
      instanceCount,
    });
  } catch (error) {
    console.error('Error fetching feature:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature' },
      { status: 500 }
    );
  }
}
