import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const book = searchParams.get('book');
    const key = searchParams.get('key');
    const type = searchParams.get('type');
    const sort = searchParams.get('sort') || 'piece';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: Prisma.FeatureInstanceWhereInput = {
      featureId: params.id,
    };

    // Add piece filters
    if (book || key || type) {
      where.piece = {};
      if (book) {
        where.piece.book = parseInt(book, 10);
      }
      if (key) {
        where.piece.keyTonic = key;
      }
      if (type) {
        where.piece.type = type as 'PRELUDE' | 'FUGUE';
      }
    }

    // Determine sort order
    let orderBy: Prisma.FeatureInstanceOrderByWithRelationInput[] = [];
    switch (sort) {
      case 'measure':
        orderBy = [
          { piece: { book: 'asc' } },
          { piece: { numberInBook: 'asc' } },
          { measureStart: 'asc' },
        ];
        break;
      case 'complexity':
        orderBy = [{ complexityScore: 'desc' }];
        break;
      case 'quality':
        orderBy = [{ qualityScore: 'desc' }];
        break;
      case 'piece':
      default:
        orderBy = [
          { piece: { book: 'asc' } },
          { piece: { numberInBook: 'asc' } },
        ];
    }

    const [instances, total] = await Promise.all([
      db.featureInstance.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          piece: {
            select: {
              id: true,
              bwvNumber: true,
              book: true,
              numberInBook: true,
              type: true,
              keyTonic: true,
              keyMode: true,
            },
          },
        },
      }),
      db.featureInstance.count({ where }),
    ]);

    return NextResponse.json({
      instances,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching feature instances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature instances' },
      { status: 500 }
    );
  }
}
