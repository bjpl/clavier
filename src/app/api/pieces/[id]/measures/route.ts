import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
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

    return addRateLimitHeaders(
      NextResponse.json({ measures }, {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      }),
      rateLimitResult
    );
  } catch (error) {
    console.error('Error fetching measures:', error);
    return addRateLimitHeaders(
      NextResponse.json({ error: 'Failed to fetch measures' }, { status: 500 }),
      rateLimitResult
    );
  }
}
