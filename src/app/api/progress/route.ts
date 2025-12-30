import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Get all progress for the user
    const progress = await db.userProgress.findMany({
      where: { userId },
      orderBy: { lastAccessedAt: 'desc' },
    });

    // Calculate summary statistics
    const summary = {
      total: progress.length,
      notStarted: progress.filter(p => p.status === 'NOT_STARTED').length,
      inProgress: progress.filter(p => p.status === 'IN_PROGRESS').length,
      completed: progress.filter(p => p.status === 'COMPLETED').length,
      byEntityType: progress.reduce((acc, p) => {
        acc[p.entityType] = (acc[p.entityType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      progress,
      summary,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, entityType, entityId, status, metadata } = body;

    if (!userId || !entityType || !entityId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, entityType, entityId, status' },
        { status: 400 }
      );
    }

    const now = new Date();
    const updateData: any = {
      status,
      lastAccessedAt: now,
      metadata,
    };

    // Set timestamps based on status
    if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
      updateData.startedAt = now;
    }

    if (status === 'COMPLETED') {
      updateData.completedAt = now;
    }

    const progress = await db.userProgress.upsert({
      where: {
        userId_entityType_entityId: {
          userId,
          entityType,
          entityId,
        },
      },
      update: updateData,
      create: {
        userId,
        entityType,
        entityId,
        ...updateData,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
