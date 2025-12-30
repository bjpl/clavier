#!/usr/bin/env node

/**
 * Import Measure Commentary to Database
 *
 * Imports generated measure-by-measure commentary into the database
 * as Annotation records linked to Pieces and Measures.
 *
 * Usage:
 *   npx tsx scripts/content-generation/import-commentary-to-db.ts --bwv 846 --type prelude
 *   npx tsx scripts/content-generation/import-commentary-to-db.ts --all
 */

import { PrismaClient, AnnotationType, AnnotationSource } from '@prisma/client';
import { PieceCommentary, MeasureCommentary } from './generate-measure-commentary';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface ImportStats {
  piecesProcessed: number;
  annotationsCreated: number;
  annotationsUpdated: number;
  errors: Array<{ file: string; error: string }>;
}

class CommentaryImporter {
  private stats: ImportStats = {
    piecesProcessed: 0,
    annotationsCreated: 0,
    annotationsUpdated: 0,
    errors: [],
  };

  /**
   * Import commentary for a single piece
   */
  async importPieceCommentary(filePath: string): Promise<void> {
    console.log(`\n📥 Importing: ${filePath}`);

    try {
      const content = readFileSync(filePath, 'utf-8');
      const commentary: PieceCommentary = JSON.parse(content);

      // Find the piece in database
      const piece = await prisma.piece.findFirst({
        where: {
          bwvNumber: commentary.bwv,
          type: commentary.type.toUpperCase() as 'PRELUDE' | 'FUGUE',
        },
      });

      if (!piece) {
        throw new Error(`Piece not found: BWV ${commentary.bwv} ${commentary.type}`);
      }

      console.log(`   Found piece: ${piece.id}`);
      console.log(`   Measures to import: ${commentary.measures.length}`);

      // Import each measure's commentary
      for (const measureData of commentary.measures) {
        await this.importMeasureAnnotation(piece.id, measureData);
      }

      this.stats.piecesProcessed++;
      console.log(`✅ Imported ${commentary.measures.length} measure annotations\n`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error importing ${filePath}: ${errorMessage}\n`);
      this.stats.errors.push({ file: filePath, error: errorMessage });
    }
  }

  /**
   * Import a single measure's annotation
   */
  private async importMeasureAnnotation(
    pieceId: string,
    measureData: MeasureCommentary
  ): Promise<void> {
    // Check if annotation already exists
    const existing = await prisma.annotation.findFirst({
      where: {
        pieceId,
        measureStart: measureData.measure_number,
        measureEnd: measureData.measure_number,
        annotationType: 'HARMONY',
        displayText: { startsWith: 'Measure Commentary:' },
      },
    });

    const annotationContent = {
      measure: measureData.measure_number,
      harmony: measureData.harmony,
      commentary: measureData.commentary,
      voiceActivity: measureData.voice_activity || {},
      terminology: measureData.terminology_introduced,
      connections: measureData.connections,
      notableFeatures: measureData.notable_features,
      curriculumLinks: measureData.curriculum_links,
    };

    const displayText = `Measure Commentary: ${measureData.commentary.substring(0, 100)}...`;

    if (existing) {
      // Update existing annotation
      await prisma.annotation.update({
        where: { id: existing.id },
        data: {
          content: annotationContent as any,
          displayText,
          verified: true,
          updatedAt: new Date(),
        },
      });
      this.stats.annotationsUpdated++;
    } else {
      // Create new annotation
      await prisma.annotation.create({
        data: {
          pieceId,
          measureStart: measureData.measure_number,
          measureEnd: measureData.measure_number,
          annotationType: 'HARMONY',
          content: annotationContent as any,
          displayText,
          voicesInvolved: Object.keys(measureData.voice_activity || {}).map((_, i) => i + 1),
          source: 'GENERATED',
          verified: true,
        },
      });
      this.stats.annotationsCreated++;
    }
  }

  /**
   * Import all commentary files from a directory
   */
  async importAllCommentary(directory: string): Promise<void> {
    console.log(`\n🎼 Importing all commentary from: ${directory}\n`);

    const files = readdirSync(directory).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} commentary files\n`);

    for (const file of files) {
      const filePath = join(directory, file);
      await this.importPieceCommentary(filePath);
    }

    this.printStats();
  }

  /**
   * Print import statistics
   */
  printStats(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT STATISTICS');
    console.log('='.repeat(60));
    console.log(`\nPieces processed: ${this.stats.piecesProcessed}`);
    console.log(`Annotations created: ${this.stats.annotationsCreated}`);
    console.log(`Annotations updated: ${this.stats.annotationsUpdated}`);

    if (this.stats.errors.length > 0) {
      console.log(`\n❌ Errors: ${this.stats.errors.length}`);
      this.stats.errors.forEach(e => {
        console.log(`   - ${e.file}: ${e.error}`);
      });
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}

/**
 * Parse command-line arguments
 */
function parseArgs(): {
  all?: boolean;
  bwv?: number;
  type?: 'prelude' | 'fugue';
  directory?: string;
} {
  const args = process.argv.slice(2);
  const result: ReturnType<typeof parseArgs> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--all') {
      result.all = true;
    } else if (arg === '--bwv' && i + 1 < args.length) {
      result.bwv = parseInt(args[++i]);
    } else if (arg === '--type' && i + 1 < args.length) {
      const type = args[++i];
      if (type === 'prelude' || type === 'fugue') {
        result.type = type;
      }
    } else if (arg === '--directory' && i + 1 < args.length) {
      result.directory = args[++i];
    }
  }

  return result;
}

/**
 * Main execution
 */
async function main() {
  console.log('🎼 Clavier: Import Measure Commentary to Database');
  console.log('━'.repeat(60) + '\n');

  const args = parseArgs();
  const importer = new CommentaryImporter();

  try {
    if (args.all) {
      const dir = args.directory || join(process.cwd(), 'content', 'pieces', 'commentary', 'book1');
      await importer.importAllCommentary(dir);
    } else if (args.bwv && args.type) {
      const filename = `bwv-${args.bwv}-${args.type}.json`;
      const filePath = join(
        process.cwd(),
        'content',
        'pieces',
        'commentary',
        filename
      );
      await importer.importPieceCommentary(filePath);
      importer.printStats();
    } else {
      console.error('Usage:');
      console.error('  Import all:      --all');
      console.error('  Import specific: --bwv <number> --type <prelude|fugue>');
      console.error('\nOptions:');
      console.error('  --directory <path>  Override default commentary directory');
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Error:', error.message);
    prisma.$disconnect();
    process.exit(1);
  });
}

export { CommentaryImporter };
