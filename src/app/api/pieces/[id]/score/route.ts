import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { readFile } from 'fs/promises';
import path from 'path';

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

    // Read the MusicXML file from the file system
    const filePath = path.join(process.cwd(), piece.musicxmlPath);
    const xmlContent = await readFile(filePath, 'utf-8');

    return new NextResponse(xmlContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="piece-${params.id}.musicxml"`,
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
