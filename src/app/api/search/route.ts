import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface SearchResult {
  id: string;
  type: 'feature' | 'instance';
  title: string;
  description: string;
  category?: string;
  pieceInfo?: {
    bwvNumber: number;
    book: number;
    type: string;
  };
  measureRange?: {
    start: number;
    end: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        message: 'Search query must be at least 2 characters',
      });
    }

    const results: SearchResult[] = [];

    // Search features
    const featureWhere: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { searchKeywords: { has: query.toLowerCase() } },
      ],
    };

    if (category) {
      featureWhere.category = category;
    }

    const features = await db.feature.findMany({
      where: featureWhere,
      take: Math.floor(limit / 2),
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
      },
    });

    features.forEach(feature => {
      results.push({
        id: feature.id,
        type: 'feature',
        title: feature.name,
        description: feature.description,
        category: feature.category,
      });
    });

    // Search feature instances
    const instances = await db.featureInstance.findMany({
      where: {
        OR: [
          { description: { contains: query, mode: 'insensitive' } },
          { feature: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      take: Math.floor(limit / 2),
      include: {
        feature: {
          select: {
            name: true,
            category: true,
          },
        },
        piece: {
          select: {
            bwvNumber: true,
            book: true,
            type: true,
          },
        },
      },
    });

    instances.forEach(instance => {
      results.push({
        id: instance.id,
        type: 'instance',
        title: instance.feature.name,
        description: instance.description || `${instance.feature.name} example`,
        category: instance.feature.category,
        pieceInfo: {
          bwvNumber: instance.piece.bwvNumber,
          book: instance.piece.book,
          type: instance.piece.type,
        },
        measureRange: {
          start: instance.measureStart,
          end: instance.measureEnd,
        },
      });
    });

    return NextResponse.json({
      results,
      total: results.length,
      query,
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
