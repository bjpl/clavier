import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const layer = searchParams.get('layer');
    const type = searchParams.get('type');

    const where: Prisma.AnnotationWhereInput = {
      pieceId: params.id,
    };

    if (layer !== null) {
      where.layer = parseInt(layer, 10);
    }

    if (type) {
      where.annotationType = type as any;
    }

    const annotations = await db.annotation.findMany({
      where,
      orderBy: [
        { measureStart: 'asc' },
        { layer: 'asc' },
      ],
    });

    return NextResponse.json({ annotations });
  } catch (error) {
    console.error('Error fetching annotations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annotations' },
      { status: 500 }
    );
  }
}
