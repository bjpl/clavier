import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { rateLimitApp, rateLimitResponse } from '@/lib/rate-limit';

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
    const piece = await db.piece.findUnique({
      where: { id: params.id },
      select: { musicxmlPath: true },
    });

    if (!piece) {
      return NextResponse.json(
        { error: 'Piece not found' },
        {
          status: 404,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      );
    }

    if (!piece.musicxmlPath) {
      return NextResponse.json(
        { error: 'MusicXML not available for this piece' },
        {
          status: 404,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      );
    }

    // Convert the file path to a URL path
    // musicxmlPath is stored as 'public/scores/file.musicxml'
    // We need to serve it as '/scores/file.musicxml' from the public folder
    const urlPath = piece.musicxmlPath.replace(/^public\//, '/');

    // Get the host from the request to build the full URL
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const fullUrl = `${protocol}://${host}${urlPath}`;

    // Fetch the MusicXML file from the public URL
    const response = await fetch(fullUrl);

    if (!response.ok) {
      console.error(`Failed to fetch MusicXML from ${fullUrl}: ${response.status}`);
      return NextResponse.json(
        { error: 'MusicXML file not found' },
        {
          status: 404,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      );
    }

    const xmlContent = await response.text();

    return new NextResponse(xmlContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
      },
    });
  } catch (error) {
    console.error('Error fetching MusicXML:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MusicXML' },
      {
        status: 500,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        },
      }
    );
  }
}
