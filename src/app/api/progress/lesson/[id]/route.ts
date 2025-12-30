import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, sectionIndex, completed } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const lessonId = params.id;

    // Verify lesson exists
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Get or create progress record
    const now = new Date();
    const progress = await db.userProgress.upsert({
      where: {
        userId_entityType_entityId: {
          userId,
          entityType: 'LESSON',
          entityId: lessonId,
        },
      },
      update: {
        lastAccessedAt: now,
        metadata: {
          sections: {
            [sectionIndex]: {
              completed,
              completedAt: completed ? now : null,
            },
          },
        },
        ...(completed && { status: 'COMPLETED', completedAt: now }),
      },
      create: {
        userId,
        entityType: 'LESSON',
        entityId: lessonId,
        status: completed ? 'COMPLETED' : 'IN_PROGRESS',
        startedAt: now,
        lastAccessedAt: now,
        completedAt: completed ? now : null,
        metadata: {
          sections: {
            [sectionIndex]: {
              completed,
              completedAt: completed ? now : null,
            },
          },
        },
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson progress' },
      { status: 500 }
    );
  }
}
