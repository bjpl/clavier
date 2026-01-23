import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pieceIdSchema, validateOrError } from '@/lib/api/validation';
import { rateLimitApp, rateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit';

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
    // Validate piece ID
    const validation = validateOrError(pieceIdSchema, params.id);
    if (!validation.success) {
      return addRateLimitHeaders(
        NextResponse.json(
          { error: validation.error, details: validation.details },
          { status: 400 }
        ),
        rateLimitResult
      );
    }

    const piece = await db.piece.findUnique({
      where: { id: validation.data },
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
      return addRateLimitHeaders(
        NextResponse.json({ error: 'Piece not found' }, { status: 404 }),
        rateLimitResult
      );
    }

    return addRateLimitHeaders(
      NextResponse.json(piece, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        },
      }),
      rateLimitResult
    );
  } catch (error) {
    console.error('Error fetching piece:', error);
    return addRateLimitHeaders(
      NextResponse.json({ error: 'Failed to fetch piece' }, { status: 500 }),
      rateLimitResult
    );
  }
}
