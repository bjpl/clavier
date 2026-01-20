import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Force dynamic rendering since we use searchParams
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    const domains = await db.domain.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        units: {
          orderBy: { orderIndex: 'asc' },
          include: {
            modules: {
              orderBy: { orderIndex: 'asc' },
              include: {
                lessons: {
                  orderBy: { orderIndex: 'asc' },
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    orderIndex: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // If userId is provided, fetch progress data
    let progressMap: Record<string, any> = {};
    if (userId) {
      const progress = await db.userProgress.findMany({
        where: { userId },
      });

      progressMap = progress.reduce((acc, p) => {
        acc[`${p.entityType}:${p.entityId}`] = {
          status: p.status,
          startedAt: p.startedAt,
          completedAt: p.completedAt,
          lastAccessedAt: p.lastAccessedAt,
        };
        return acc;
      }, {} as Record<string, any>);
    }

    return NextResponse.json({
      domains,
      progress: progressMap,
    });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curriculum' },
      { status: 500 }
    );
  }
}
