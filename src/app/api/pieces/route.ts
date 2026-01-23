import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { piecesQuerySchema, parseSearchParams } from '@/lib/api/validation';
import { createSuccessBody, createErrorBody } from '@/lib/api/response';
import { rateLimitApp, rateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit';

// Force dynamic rendering since we use searchParams
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Apply rate limiting: 100 requests per minute
  const rateLimitResult = await rateLimitApp(request, {
    interval: 60 * 1000,
    uniqueTokenPerInterval: 100,
  });

  if (!rateLimitResult.allowed) {
    return rateLimitResponse(rateLimitResult);
  }

  try {
    const searchParams = request.nextUrl.searchParams;

    // Validate query parameters
    const validation = parseSearchParams(piecesQuerySchema, searchParams);
    if (!validation.success) {
      return addRateLimitHeaders(
        NextResponse.json(
          createErrorBody(validation.error, validation.details, 'VALIDATION_ERROR'),
          { status: 400 }
        ),
        rateLimitResult
      );
    }

    const { bwv, book, type, key, mode, limit = 50, offset = 0 } = validation.data;

    // Build where clause dynamically
    const where: Prisma.PieceWhereInput = {};

    if (bwv !== undefined) {
      where.bwvNumber = bwv;
    }

    if (book !== undefined) {
      where.book = book;
    }

    if (type !== undefined) {
      where.type = type;
    }

    if (key !== undefined) {
      where.keyTonic = key;
    }

    if (mode !== undefined) {
      where.keyMode = mode;
    }

    const pieces = await db.piece.findMany({
      where,
      orderBy: [
        { book: 'asc' },
        { numberInBook: 'asc' },
      ],
      select: {
        id: true,
        bwvNumber: true,
        book: true,
        numberInBook: true,
        type: true,
        keyTonic: true,
        keyMode: true,
        timeSignature: true,
        tempoSuggestionBpm: true,
        totalMeasures: true,
        voiceCount: true,
        totalDurationSeconds: true,
        metadata: true,
      },
      take: limit,
      skip: offset,
    });

    const total = await db.piece.count({ where });

    return addRateLimitHeaders(
      NextResponse.json(
        createSuccessBody(pieces, {
          total,
          limit,
          offset,
          hasMore: offset + pieces.length < total,
        })
      ),
      rateLimitResult
    );
  } catch (error) {
    console.error('Error fetching pieces:', error);
    return addRateLimitHeaders(
      NextResponse.json(
        createErrorBody('Failed to fetch pieces', undefined, 'INTERNAL_ERROR'),
        { status: 500 }
      ),
      rateLimitResult
    );
  }
}
