#!/usr/bin/env tsx
/**
 * Import parsed MusicXML data to Prisma database
 *
 * Creates Piece, Measure, Note records
 * Handles transactions properly
 * Verifies completeness
 */

import { PrismaClient } from '@prisma/client';
import { MusicXMLParser, type ParsedMusicXML } from './parse-musicxml';

const prisma = new PrismaClient();

class PiecesSeeder {
  private successCount = 0;
  private failCount = 0;

  /**
   * Import a single parsed piece into the database
   */
  async importPiece(fileName: string, parsed: ParsedMusicXML): Promise<boolean> {
    console.log(`\n→ Importing: ${fileName}`);

    try {
      await prisma.$transaction(async (tx: any) => {
        // Create piece
        const piece = await tx.piece.create({
          data: {
            bwvNumber: parsed.piece.bwv,
            book: parsed.piece.book,
            numberInBook: parsed.piece.numberInBook,
            type: parsed.piece.type,
            keyTonic: parsed.piece.keyTonic,
            keyMode: parsed.piece.keyMode,
            timeSignature: parsed.piece.timeSignature,
            totalMeasures: parsed.piece.totalMeasures,
            voiceCount: parsed.piece.voiceCount,
            musicxmlPath: `music/book${parsed.piece.book}/${fileName}`,
          },
        });

        console.log(`  ✓ Created piece: BWV ${parsed.piece.bwv} ${parsed.piece.type}`);

        // Create measures with notes
        for (const measureData of parsed.measures) {
          const measure = await tx.measure.create({
            data: {
              pieceId: piece.id,
              measureNumber: measureData.measureNumber,
              beatCount: measureData.beatCount,
              isPickup: measureData.isPickup,
              isFinal: measureData.isFinal,
            },
          });

          // Create notes for this measure
          if (measureData.notes.length > 0) {
            await tx.note.createMany({
              data: measureData.notes.map(note => ({
                measureId: measure.id,
                voice: note.voice,
                pitchClass: note.pitchClass,
                octave: note.octave,
                midiNumber: note.midiNumber,
                startBeat: note.startBeat,
                durationBeats: note.durationBeats,
                articulation: note.articulation || [],
                dynamic: note.dynamic,
              })),
            });
          }
        }

        console.log(`  ✓ Created ${parsed.measures.length} measures`);
        const totalNotes = parsed.measures.reduce((sum, m) => sum + m.notes.length, 0);
        console.log(`  ✓ Created ${totalNotes} notes`);
      });

      this.successCount++;
      return true;

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ Import failed: ${message}`);
      this.failCount++;
      return false;
    }
  }

  /**
   * Clear existing WTC data
   */
  async clearExistingData(): Promise<void> {
    console.log('\n→ Clearing existing WTC data...');

    const deleteResult = await prisma.piece.deleteMany({
      where: {
        bwvNumber: {
          gte: 846,
          lte: 893,
        },
      },
    });

    console.log(`  ✓ Deleted ${deleteResult.count} existing pieces`);
  }

  /**
   * Import all parsed pieces
   */
  async importAll(parsedPieces: Map<string, ParsedMusicXML>, clearFirst = false): Promise<void> {
    console.log('\n' + '='.repeat(60));
    console.log('Importing Pieces to Database');
    console.log('='.repeat(60));
    console.log(`Total pieces to import: ${parsedPieces.size}\n`);

    if (clearFirst) {
      await this.clearExistingData();
    }

    for (const [fileName, parsed] of parsedPieces) {
      await this.importPiece(fileName, parsed);
    }

    console.log('\n' + '='.repeat(60));
    console.log('Import Summary');
    console.log('='.repeat(60));
    console.log(`✓ Successful: ${this.successCount}`);
    console.log(`✗ Failed: ${this.failCount}`);
  }

  /**
   * Verify import completeness
   */
  async verifyImport(): Promise<void> {
    console.log('\n' + '='.repeat(60));
    console.log('Verifying Import');
    console.log('='.repeat(60));

    // Check piece count
    const pieceCount = await prisma.piece.count({
      where: {
        bwvNumber: {
          gte: 846,
          lte: 893,
        },
      },
    });

    console.log(`\nPieces imported: ${pieceCount} / 96 expected (48 preludes + 48 fugues)`);

    // Check by book
    for (const book of [1, 2]) {
      const bookCount = await prisma.piece.count({
        where: { book },
      });
      console.log(`  Book ${book}: ${bookCount} pieces`);
    }

    // Check measures and notes
    const measureCount = await prisma.measure.count();
    const noteCount = await prisma.note.count();

    console.log(`\nMeasures: ${measureCount.toLocaleString()}`);
    console.log(`Notes: ${noteCount.toLocaleString()}`);

    // Sample check: Get first and last pieces
    const firstPiece = await prisma.piece.findFirst({
      where: { bwvNumber: 846 },
      include: {
        measures: {
          include: {
            notes: true,
          },
        },
      },
    });

    const lastPiece = await prisma.piece.findFirst({
      where: { bwvNumber: 893 },
      include: {
        measures: {
          include: {
            notes: true,
          },
        },
      },
    });

    if (firstPiece) {
      const firstNotes = firstPiece.measures.reduce((sum: number, m: any) => sum + m.notes.length, 0);
      console.log(`\nBWV 846 (first): ${firstPiece.measures.length} measures, ${firstNotes} notes`);
    }

    if (lastPiece) {
      const lastNotes = lastPiece.measures.reduce((sum: number, m: any) => sum + m.notes.length, 0);
      console.log(`BWV 893 (last): ${lastPiece.measures.length} measures, ${lastNotes} notes`);
    }

    // Check for missing pieces
    const missingBwvs: number[] = [];
    for (let bwv = 846; bwv <= 893; bwv++) {
      const prelude = await prisma.piece.findFirst({
        where: { bwvNumber: bwv, type: 'PRELUDE' },
      });
      const fugue = await prisma.piece.findFirst({
        where: { bwvNumber: bwv, type: 'FUGUE' },
      });

      if (!prelude || !fugue) {
        missingBwvs.push(bwv);
      }
    }

    if (missingBwvs.length > 0) {
      console.log(`\n⚠ Missing pieces for BWV: ${missingBwvs.join(', ')}`);
    } else {
      console.log('\n✓ All 48 preludes and 48 fugues imported successfully');
    }
  }
}

// Main execution
async function main() {
  const seeder = new PiecesSeeder();

  try {
    // Parse all MusicXML files
    console.log('Step 1: Parsing MusicXML files...');
    const parser = new MusicXMLParser();
    const parsedPieces = await parser.parseAll();

    if (parsedPieces.size === 0) {
      console.error('\n✗ No MusicXML files found to parse');
      console.log('\nPlease run the download script first:');
      console.log('  npm run music:download');
      process.exit(1);
    }

    // Import to database
    console.log('\nStep 2: Importing to database...');
    const clearFirst = process.argv.includes('--clear');
    await seeder.importAll(parsedPieces, clearFirst);

    // Verify import
    console.log('\nStep 3: Verifying import...');
    await seeder.verifyImport();

    console.log('\n✓ Seed complete!');
    process.exit(0);

  } catch (error) {
    console.error('\n✗ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { PiecesSeeder };
