import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const book = searchParams.get('book');
    const type = searchParams.get('type');
    const key = searchParams.get('key');
    const mode = searchParams.get('mode');

    // Build where clause dynamically
    const where: Prisma.PieceWhereInput = {};

    if (book) {
      where.book = parseInt(book, 10);
    }

    if (type) {
      where.type = type as 'PRELUDE' | 'FUGUE';
    }

    if (key) {
      where.keyTonic = key;
    }

    if (mode) {
      where.keyMode = mode as 'MAJOR' | 'MINOR';
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
    });

    const total = await db.piece.count({ where });

    return NextResponse.json({
      pieces,
      total,
    });
  } catch (error) {
    console.error('Error fetching pieces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pieces' },
      { status: 500 }
    );
  }
}
