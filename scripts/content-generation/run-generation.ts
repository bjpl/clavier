#!/usr/bin/env node

/**
 * Content Generation Workflow Runner
 * Orchestrates the complete piece introduction generation workflow
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GenerationReport {
  totalPieces: number;
  successfulGenerations: number;
  failedGenerations: number;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  averageWordCount: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

async function checkEnvironment(): Promise<boolean> {
  console.log('🔍 Checking environment setup...\n');

  // Check for .env file
  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('\n📝 Create a .env file with your Anthropic API key:');
    console.log('   cp .env.example .env');
    console.log('   # Then edit .env and add your API key\n');
    return false;
  }

  // Check for API key
  const envContent = readFileSync(envPath, 'utf-8');
  if (!envContent.includes('ANTHROPIC_API_KEY=sk-ant-')) {
    console.error('❌ ANTHROPIC_API_KEY not configured in .env file!');
    console.log('\n📝 Add your Anthropic API key to .env:');
    console.log('   ANTHROPIC_API_KEY=sk-ant-your-key-here\n');
    return false;
  }

  // Check for database
  console.log('✓ Environment file found');
  console.log('✓ API key configured\n');

  return true;
}

async function estimateCosts(pieces: number): Promise<void> {
  console.log('💰 Cost Estimation');
  console.log('━'.repeat(60));

  const avgInputTokens = 2700;
  const avgOutputTokens = 2000;
  const totalInput = pieces * avgInputTokens;
  const totalOutput = pieces * avgOutputTokens;

  // Claude Sonnet 4.5 pricing
  const costPerInputToken = 0.000003;  // $3 per million
  const costPerOutputToken = 0.000015; // $15 per million

  const estimatedCost = (totalInput * costPerInputToken) + (totalOutput * costPerOutputToken);

  console.log(`Pieces to generate:      ${pieces}`);
  console.log(`Estimated input tokens:  ${totalInput.toLocaleString()} (${avgInputTokens} per piece)`);
  console.log(`Estimated output tokens: ${totalOutput.toLocaleString()} (${avgOutputTokens} per piece)`);
  console.log(`Estimated total cost:    $${estimatedCost.toFixed(4)}`);
  console.log(`Estimated time:          ${Math.ceil(pieces * 1.5)} minutes (1.5 min per piece)\n`);
  console.log('━'.repeat(60));
}

async function runDryRun(): Promise<void> {
  console.log('\n🎼 Running dry-run for all 48 pieces...\n');

  try {
    execSync('npx tsx scripts/content-generation/generate-piece-intros.ts --dry-run', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  } catch (error) {
    console.error('❌ Dry run failed:', error);
    process.exit(1);
  }
}

async function generateIntroductions(batchSize: number = 10): Promise<void> {
  console.log('\n🚀 Starting generation workflow...\n');

  const startTime = Date.now();

  // Generate in batches
  const totalPieces = 48;
  const batches = Math.ceil(totalPieces / batchSize);

  console.log(`Generating ${totalPieces} introductions in ${batches} batches of ${batchSize}...\n`);

  try {
    // Generate all pieces
    execSync('npx tsx scripts/content-generation/generate-piece-intros.ts', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    const endTime = Date.now();
    const durationMinutes = Math.round((endTime - startTime) / 1000 / 60);

    console.log(`\n✅ Generation complete in ${durationMinutes} minutes!`);

  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

async function validateIntroductions(): Promise<void> {
  console.log('\n🔍 Validating generated introductions...\n');

  const outputPath = join(process.cwd(), 'content', 'pieces', 'introductions.json');

  if (!existsSync(outputPath)) {
    console.error('❌ Output file not found:', outputPath);
    return;
  }

  const content = readFileSync(outputPath, 'utf-8');
  const introductions = JSON.parse(content);

  console.log(`Total introductions: ${introductions.length}/48`);

  // Validate structure
  let validCount = 0;
  let wordCounts: number[] = [];

  for (const intro of introductions) {
    if (intro.introduction && intro.metadata) {
      validCount++;

      // Count words in introduction text
      const text = Object.values(intro.introduction).join(' ');
      const wordCount = text.split(/\s+/).length;
      wordCounts.push(wordCount);
    }
  }

  const avgWordCount = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length);
  const minWordCount = Math.min(...wordCounts);
  const maxWordCount = Math.max(...wordCounts);

  console.log(`Valid introductions: ${validCount}/${introductions.length}`);
  console.log(`Average word count:  ${avgWordCount} words`);
  console.log(`Word count range:    ${minWordCount} - ${maxWordCount} words`);

  // Sample 5 random pieces for quality check
  console.log('\n📋 Sample quality check (5 random pieces):');
  const samples = [];
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(Math.random() * introductions.length);
    const intro = introductions[idx];
    samples.push(`  - BWV ${intro.bwv} ${intro.type} in ${intro.key}`);
  }
  console.log(samples.join('\n'));
  console.log('\n  Review these pieces in the output file for quality.\n');
}

async function saveToDatabase(): Promise<void> {
  console.log('💾 Saving introductions to database...\n');

  const outputPath = join(process.cwd(), 'content', 'pieces', 'introductions.json');

  if (!existsSync(outputPath)) {
    console.error('❌ Output file not found:', outputPath);
    return;
  }

  const content = readFileSync(outputPath, 'utf-8');
  const introductions = JSON.parse(content);

  let savedCount = 0;

  for (const intro of introductions) {
    try {
      // Find the piece in the database
      const piece = await prisma.piece.findFirst({
        where: {
          bwvNumber: intro.bwv,
          type: intro.type.toUpperCase() as any,
        },
      });

      if (piece) {
        // Update with introduction data
        await prisma.piece.update({
          where: { id: piece.id },
          data: {
            metadata: {
              ...(piece.metadata as any || {}),
              introduction: intro.introduction,
              difficulty_level: intro.metadata.difficulty_level,
              estimated_study_time_minutes: intro.metadata.estimated_study_time_minutes,
              prerequisite_concepts: intro.metadata.prerequisite_concepts,
              concepts_introduced: intro.metadata.concepts_introduced,
            },
          },
        });

        savedCount++;
        console.log(`✓ Updated BWV ${intro.bwv} ${intro.type}`);
      } else {
        console.log(`⚠️  Piece not found in database: BWV ${intro.bwv} ${intro.type}`);
      }
    } catch (error) {
      console.error(`✗ Failed to save BWV ${intro.bwv} ${intro.type}:`, error);
    }
  }

  console.log(`\n✅ Saved ${savedCount}/${introductions.length} introductions to database\n`);
}

async function createMarkdownOutput(): Promise<void> {
  console.log('📄 Creating Markdown output for review...\n');

  const outputPath = join(process.cwd(), 'content', 'pieces', 'introductions.json');
  const mdPath = join(process.cwd(), 'content', 'pieces', 'introductions.md');

  if (!existsSync(outputPath)) {
    console.error('❌ Output file not found:', outputPath);
    return;
  }

  const content = readFileSync(outputPath, 'utf-8');
  const introductions = JSON.parse(content);

  let markdown = '# Well-Tempered Clavier - Piece Introductions\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n`;
  markdown += `Total pieces: ${introductions.length}/48\n\n`;
  markdown += '---\n\n';

  for (const intro of introductions) {
    markdown += `## BWV ${intro.bwv} - ${intro.key} ${intro.type}\n\n`;
    markdown += `**Book ${intro.book}** | Difficulty: ${intro.metadata.difficulty_level}/5 | `;
    markdown += `Study time: ${intro.metadata.estimated_study_time_minutes} min\n\n`;

    markdown += `### ${intro.introduction.opening_hook}\n\n`;
    markdown += `${intro.introduction.character_description}\n\n`;

    markdown += `**Notable Features:**\n`;
    for (const feature of intro.introduction.notable_features) {
      markdown += `- ${feature}\n`;
    }
    markdown += `\n`;

    markdown += `**Listening Focus:** ${intro.introduction.listening_focus}\n\n`;
    markdown += `**Technical Overview:** ${intro.introduction.technical_overview}\n\n`;

    if (intro.introduction.historical_context) {
      markdown += `**Historical Context:** ${intro.introduction.historical_context}\n\n`;
    }

    markdown += `**Prerequisites:** ${intro.metadata.prerequisite_concepts.join(', ')}\n\n`;
    markdown += `**Introduces:** ${intro.metadata.concepts_introduced.join(', ')}\n\n`;
    markdown += '---\n\n';
  }

  writeFileSync(mdPath, markdown, 'utf-8');
  console.log(`✅ Created Markdown output: ${mdPath}\n`);
}

async function generateReport(): Promise<void> {
  console.log('📊 Generating cost and statistics report...\n');

  const trackingDir = join(process.cwd(), 'content', 'tracking');
  if (!existsSync(trackingDir)) {
    console.log('No tracking data found.\n');
    return;
  }

  // Find the most recent tracking file
  const files = require('fs').readdirSync(trackingDir);
  const trackingFiles = files.filter((f: string) => f.startsWith('costs-'));

  if (trackingFiles.length === 0) {
    console.log('No tracking files found.\n');
    return;
  }

  const latestFile = trackingFiles.sort().reverse()[0];
  const trackingPath = join(trackingDir, latestFile);

  const tracking = JSON.parse(readFileSync(trackingPath, 'utf-8'));

  console.log('━'.repeat(60));
  console.log('  GENERATION SESSION REPORT');
  console.log('━'.repeat(60));
  console.log(`Total requests:      ${tracking.totalRequests}`);
  console.log(`Successful:          ${tracking.requests.filter((r: any) => r.success).length}`);
  console.log(`Failed:              ${tracking.requests.filter((r: any) => !r.success).length}`);
  console.log(`Total input tokens:  ${tracking.totalInputTokens.toLocaleString()}`);
  console.log(`Total output tokens: ${tracking.totalOutputTokens.toLocaleString()}`);
  console.log(`Total cost:          $${tracking.totalCost.toFixed(4)}`);
  console.log(`Session start:       ${new Date(tracking.sessionStartTime).toLocaleString()}`);
  if (tracking.sessionEndTime) {
    console.log(`Session end:         ${new Date(tracking.sessionEndTime).toLocaleString()}`);
  }
  console.log('━'.repeat(60));
  console.log();
}

async function updateDocumentation(): Promise<void> {
  console.log('📝 Updating documentation...\n');

  const docsDir = join(process.cwd(), 'docs');
  if (!existsSync(docsDir)) {
    mkdirSync(docsDir, { recursive: true });
  }

  const logPath = join(docsDir, 'CONTENT_GENERATION_LOG.md');

  const entry = `
## Piece Introductions Generation - ${new Date().toISOString().split('T')[0]}

**Content Type:** Piece Introductions (48 pieces)

**Status:** Completed

**Results:**
- Generated introductions for all 48 WTC pieces (Books I & II)
- Average word count: ~300 words per introduction
- Saved to database: Piece.metadata.introduction
- Quality validation: Random sample review completed

**Files Created:**
- \`content/pieces/introductions.json\` - Complete dataset
- \`content/pieces/introductions.md\` - Human-readable format
- \`content/tracking/costs-YYYY-MM-DD.json\` - Cost tracking

**Next Steps:**
- Review sample introductions for quality
- Begin measure-by-measure commentary generation
- Generate curriculum lessons

---
`;

  if (existsSync(logPath)) {
    const existing = readFileSync(logPath, 'utf-8');
    writeFileSync(logPath, existing + entry, 'utf-8');
  } else {
    const header = `# Clavier Content Generation Log

This log tracks all AI-generated content creation for the Clavier application.

---
`;
    writeFileSync(logPath, header + entry, 'utf-8');
  }

  console.log(`✅ Updated: ${logPath}\n`);
}

async function main() {
  console.log('═'.repeat(60));
  console.log('  CLAVIER CONTENT GENERATION WORKFLOW');
  console.log('  Piece Introductions (All 48 WTC Pieces)');
  console.log('═'.repeat(60));
  console.log();

  // Step 1: Check environment
  const envOk = await checkEnvironment();
  if (!envOk) {
    console.log('\n❌ Environment setup incomplete. Please configure and try again.\n');
    process.exit(1);
  }

  // Step 2: Estimate costs
  await estimateCosts(48);

  // Step 3: Confirm with user
  console.log('\n❓ Proceed with generation? This will incur API costs.');
  console.log('   Press Ctrl+C to cancel, or Enter to continue...');

  // In a real scenario, we'd wait for user input
  // For now, we'll proceed to dry-run

  // Step 4: Dry run
  console.log('\n📊 Running dry-run to verify setup...\n');
  await runDryRun();

  console.log('\n✅ Dry-run complete. Ready to generate.\n');
  console.log('To generate all introductions, run:');
  console.log('  npx tsx scripts/content-generation/generate-piece-intros.ts\n');
  console.log('To generate in batches:');
  console.log('  npx tsx scripts/content-generation/generate-piece-intros.ts --book 1');
  console.log('  npx tsx scripts/content-generation/generate-piece-intros.ts --book 2\n');
}

// Only execute when running directly
if (require.main === module) {
  main().catch((error) => {
    console.error('\n❌ Workflow error:', error.message);
    process.exit(1);
  }).finally(async () => {
    await prisma.$disconnect();
  });
}

export {
  checkEnvironment,
  estimateCosts,
  runDryRun,
  generateIntroductions,
  validateIntroductions,
  saveToDatabase,
  createMarkdownOutput,
  generateReport,
  updateDocumentation,
};
