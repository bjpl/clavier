#!/usr/bin/env node

/**
 * Import Generated Piece Introductions to Database
 * Reads JSON output and updates Piece records with introduction data
 */

import { PrismaClient, PieceType } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface PieceIntroduction {
  bwv: number;
  type: 'prelude' | 'fugue';
  key: string;
  book: 1 | 2;
  introduction: {
    opening_hook: string;
    character_description: string;
    notable_features: string[];
    listening_focus: string;
    technical_overview: string;
    historical_context?: string;
  };
  metadata: {
    difficulty_level: number;
    estimated_study_time_minutes: number;
    prerequisite_concepts: string[];
    concepts_introduced: string[];
  };
}

async function importIntroductions(): Promise<void> {
  console.log('💾 Importing piece introductions to database...\n');

  // Load JSON file
  const inputPath = join(process.cwd(), 'content', 'pieces', 'introductions.json');

  if (!existsSync(inputPath)) {
    console.error('❌ Input file not found:', inputPath);
    console.log('\n   Run generation first:');
    console.log('   npx tsx scripts/content-generation/generate-piece-intros.ts\n');
    process.exit(1);
  }

  const content = readFileSync(inputPath, 'utf-8');
  const introductions: PieceIntroduction[] = JSON.parse(content);

  console.log(`Found ${introductions.length} introductions to import\n`);

  let successCount = 0;
  let updateCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;

  for (const intro of introductions) {
    try {
      // Convert type to database enum
      const pieceType: PieceType = intro.type.toUpperCase() as PieceType;

      // Find piece in database
      const piece = await prisma.piece.findFirst({
        where: {
          bwvNumber: intro.bwv,
          type: pieceType,
        },
      });

      if (!piece) {
        console.log(`⚠️  Not found: BWV ${intro.bwv} ${intro.type}`);
        notFoundCount++;
        continue;
      }

      // Check if already has introduction
      const existingMetadata = piece.metadata as any;
      const hasIntroduction = existingMetadata?.introduction;

      // Update piece with introduction data
      await prisma.piece.update({
        where: { id: piece.id },
        data: {
          metadata: {
            ...(existingMetadata || {}),
            introduction: intro.introduction,
            difficulty_level: intro.metadata.difficulty_level,
            estimated_study_time_minutes: intro.metadata.estimated_study_time_minutes,
            prerequisite_concepts: intro.metadata.prerequisite_concepts,
            concepts_introduced: intro.metadata.concepts_introduced,
            introduction_generated_at: new Date().toISOString(),
          },
        },
      });

      if (hasIntroduction) {
        console.log(`🔄 Updated: BWV ${intro.bwv} ${intro.type} (${intro.key})`);
        updateCount++;
      } else {
        console.log(`✓ Added: BWV ${intro.bwv} ${intro.type} (${intro.key})`);
        successCount++;
      }

    } catch (error) {
      console.error(`✗ Error: BWV ${intro.bwv} ${intro.type}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log('  IMPORT SUMMARY');
  console.log('━'.repeat(60));
  console.log(`Total introductions: ${introductions.length}`);
  console.log(`Successfully added:  ${successCount}`);
  console.log(`Updated existing:    ${updateCount}`);
  console.log(`Pieces not found:    ${notFoundCount}`);
  console.log(`Errors:              ${errorCount}`);
  console.log('━'.repeat(60));
  console.log();

  if (notFoundCount > 0) {
    console.log('⚠️  Some pieces were not found in the database.');
    console.log('   You may need to seed the piece data first:');
    console.log('   npm run db:seed\n');
  }

  if (successCount + updateCount === introductions.length - notFoundCount) {
    console.log('✅ Import completed successfully!\n');
  } else {
    console.log('⚠️  Import completed with some failures.\n');
  }
}

async function verifyImport(): Promise<void> {
  console.log('🔍 Verifying imported introductions...\n');

  // Count pieces with introductions
  const piecesWithIntros = await prisma.piece.findMany({
    where: {
      metadata: {
        path: ['introduction'],
        not: null,
      },
    },
    select: {
      bwvNumber: true,
      type: true,
      keyTonic: true,
      keyMode: true,
    },
  });

  console.log(`Pieces with introductions: ${piecesWithIntros.length}/48`);

  // Group by book
  const book1Count = piecesWithIntros.filter(p => p.bwvNumber < 870).length;
  const book2Count = piecesWithIntros.filter(p => p.bwvNumber >= 870).length;

  console.log(`  Book I:  ${book1Count}/24`);
  console.log(`  Book II: ${book2Count}/24`);

  // Sample a few to verify structure
  if (piecesWithIntros.length > 0) {
    console.log('\n📋 Sample verification (first 3 pieces):');

    const samples = await prisma.piece.findMany({
      where: {
        metadata: {
          path: ['introduction'],
          not: null,
        },
      },
      take: 3,
      select: {
        bwvNumber: true,
        type: true,
        metadata: true,
      },
    });

    for (const piece of samples) {
      const metadata = piece.metadata as any;
      const intro = metadata?.introduction;

      console.log(`\n  BWV ${piece.bwvNumber} ${piece.type}:`);
      console.log(`    - Opening hook: ${intro?.opening_hook?.substring(0, 60)}...`);
      console.log(`    - Notable features: ${intro?.notable_features?.length || 0} items`);
      console.log(`    - Difficulty: ${metadata?.difficulty_level}/5`);
      console.log(`    - Study time: ${metadata?.estimated_study_time_minutes} min`);
    }
  }

  console.log('\n✅ Verification complete!\n');
}

async function exportToMarkdown(): Promise<void> {
  console.log('📄 Exporting to Markdown format...\n');

  const pieces = await prisma.piece.findMany({
    where: {
      metadata: {
        path: ['introduction'],
        not: null,
      },
    },
    orderBy: [
      { bwvNumber: 'asc' },
      { type: 'asc' },
    ],
  });

  let markdown = '# Well-Tempered Clavier - Piece Introductions\n\n';
  markdown += `Generated from database: ${new Date().toISOString()}\n`;
  markdown += `Total pieces: ${pieces.length}/48\n\n`;
  markdown += '---\n\n';

  for (const piece of pieces) {
    const metadata = piece.metadata as any;
    const intro = metadata?.introduction;

    if (!intro) continue;

    const key = `${piece.keyTonic} ${piece.keyMode.toLowerCase()}`;

    markdown += `## BWV ${piece.bwvNumber} - ${key} ${piece.type.toLowerCase()}\n\n`;
    markdown += `**Book ${piece.book}** | `;
    markdown += `Difficulty: ${metadata.difficulty_level}/5 | `;
    markdown += `Study time: ${metadata.estimated_study_time_minutes} min\n\n`;

    markdown += `### ${intro.opening_hook}\n\n`;
    markdown += `${intro.character_description}\n\n`;

    markdown += `**Notable Features:**\n`;
    for (const feature of intro.notable_features) {
      markdown += `- ${feature}\n`;
    }
    markdown += `\n`;

    markdown += `**Listening Focus:** ${intro.listening_focus}\n\n`;
    markdown += `**Technical Overview:** ${intro.technical_overview}\n\n`;

    if (intro.historical_context) {
      markdown += `**Historical Context:** ${intro.historical_context}\n\n`;
    }

    markdown += `**Prerequisites:** ${metadata.prerequisite_concepts?.join(', ') || 'None'}\n\n`;
    markdown += `**Introduces:** ${metadata.concepts_introduced?.join(', ') || 'None'}\n\n`;
    markdown += '---\n\n';
  }

  const outputPath = join(process.cwd(), 'content', 'pieces', 'introductions-from-db.md');
  require('fs').writeFileSync(outputPath, markdown, 'utf-8');

  console.log(`✅ Exported to: ${outputPath}\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    if (command === 'verify') {
      await verifyImport();
    } else if (command === 'export') {
      await exportToMarkdown();
    } else {
      await importIntroductions();
      await verifyImport();
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { importIntroductions, verifyImport, exportToMarkdown };
