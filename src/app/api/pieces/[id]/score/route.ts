import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const piece = await db.piece.findUnique({
      where: { id: params.id },
      select: { musicxmlPath: true },
    });

    if (!piece) {
      return NextResponse.json(
        { error: 'Piece not found' },
        { status: 404 }
      );
    }

    if (!piece.musicxmlPath) {
      return NextResponse.json(
        { error: 'MusicXML not available for this piece' },
        { status: 404 }
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
        { status: 404 }
      );
    }

    const xmlContent = await response.text();

    return new NextResponse(xmlContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error fetching MusicXML:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MusicXML' },
      { status: 500 }
    );
  }
}
