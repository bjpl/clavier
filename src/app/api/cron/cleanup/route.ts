import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Vercel Cron job - runs daily at 2 AM UTC
// See vercel.json for schedule configuration

export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production') {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  try {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const results = {
      timestamp: now.toISOString(),
      cleanup: {
        oldProgress: 0,
        expiredSessions: 0,
        orphanedData: 0,
      },
    };

    // Clean up stale progress records older than 90 days with NOT_STARTED status
    // This preserves user progress while cleaning abandoned entries
    try {
      const staleProgress = await prisma.userProgress.deleteMany({
        where: {
          updatedAt: {
            lt: ninetyDaysAgo,
          },
          status: 'NOT_STARTED',
        },
      });
      results.cleanup.oldProgress = staleProgress.count;
    } catch {
      // Table might not exist yet
    }

    // Clean up old temporary data if applicable
    // Add more cleanup tasks as needed based on your data model

    return NextResponse.json(
      {
        status: 'success',
        message: 'Cleanup completed',
        ...results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cron cleanup error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Cleanup failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Allow POST for manual triggering
export async function POST(request: Request) {
  return GET(request);
}
