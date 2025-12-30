#!/usr/bin/env node

/**
 * Generate Piece Introductions for the Well-Tempered Clavier
 *
 * Creates brief, engaging introductions for each of the 48 preludes and fugues,
 * providing orientation, character description, and key features to listen for.
 *
 * Usage:
 *   npx tsx scripts/content-generation/generate-piece-intros.ts [options]
 *
 * Options:
 *   --book <1|2>         Generate only Book I or Book II
 *   --bwv <numbers>      Generate specific BWV numbers (comma-separated)
 *   --dry-run            Estimate costs without generating
 *   --output <path>      Custom output path
 */

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { loadConfig, CostTracker, RateLimiter, SYSTEM_PROMPT, GenerationConfig } from './config';

// Piece metadata for the Well-Tempered Clavier
interface PieceMetadata {
  bwv: number;
  book: 1 | 2;
  key: string;
  type: 'prelude' | 'fugue';
  timeSignature: string;
  measures: number;
  voices?: number; // For fugues
}

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

// Complete metadata for all 48 pieces
const WTC_PIECES: PieceMetadata[] = [
  // Book I
  { bwv: 846, book: 1, key: 'C major', type: 'prelude', timeSignature: '4/4', measures: 35 },
  { bwv: 846, book: 1, key: 'C major', type: 'fugue', timeSignature: '4/4', measures: 27, voices: 4 },
  { bwv: 847, book: 1, key: 'C minor', type: 'prelude', timeSignature: '4/4', measures: 38 },
  { bwv: 847, book: 1, key: 'C minor', type: 'fugue', timeSignature: '4/4', measures: 31, voices: 3 },
  { bwv: 848, book: 1, key: 'C# major', type: 'prelude', timeSignature: '4/4', measures: 21 },
  { bwv: 848, book: 1, key: 'C# major', type: 'fugue', timeSignature: '4/4', measures: 69, voices: 3 },
  { bwv: 849, book: 1, key: 'C# minor', type: 'prelude', timeSignature: '4/4', measures: 42 },
  { bwv: 849, book: 1, key: 'C# minor', type: 'fugue', timeSignature: '9/8', measures: 115, voices: 5 },
  { bwv: 850, book: 1, key: 'D major', type: 'prelude', timeSignature: '4/4', measures: 35 },
  { bwv: 850, book: 1, key: 'D major', type: 'fugue', timeSignature: '4/4', measures: 78, voices: 4 },
  { bwv: 851, book: 1, key: 'D minor', type: 'prelude', timeSignature: '4/4', measures: 36 },
  { bwv: 851, book: 1, key: 'D minor', type: 'fugue', timeSignature: '4/4', measures: 61, voices: 3 },
  { bwv: 852, book: 1, key: 'Eb major', type: 'prelude', timeSignature: '3/4', measures: 90 },
  { bwv: 852, book: 1, key: 'Eb major', type: 'fugue', timeSignature: '4/4', measures: 67, voices: 3 },
  { bwv: 853, book: 1, key: 'Eb minor', type: 'prelude', timeSignature: '4/4', measures: 76 },
  { bwv: 853, book: 1, key: 'Eb minor', type: 'fugue', timeSignature: '6/8', measures: 87, voices: 3 },
  { bwv: 854, book: 1, key: 'E major', type: 'prelude', timeSignature: '4/4', measures: 69 },
  { bwv: 854, book: 1, key: 'E major', type: 'fugue', timeSignature: '4/4', measures: 49, voices: 3 },
  { bwv: 855, book: 1, key: 'E minor', type: 'prelude', timeSignature: '4/4', measures: 24 },
  { bwv: 855, book: 1, key: 'E minor', type: 'fugue', timeSignature: '2/4', measures: 45, voices: 2 },
  { bwv: 856, book: 1, key: 'F major', type: 'prelude', timeSignature: '4/4', measures: 24 },
  { bwv: 856, book: 1, key: 'F major', type: 'fugue', timeSignature: '3/4', measures: 88, voices: 3 },
  { bwv: 857, book: 1, key: 'F minor', type: 'prelude', timeSignature: '12/8', measures: 25 },
  { bwv: 857, book: 1, key: 'F minor', type: 'fugue', timeSignature: '4/4', measures: 55, voices: 3 },
  { bwv: 858, book: 1, key: 'F# major', type: 'prelude', timeSignature: '4/4', measures: 32 },
  { bwv: 858, book: 1, key: 'F# major', type: 'fugue', timeSignature: '4/4', measures: 76, voices: 3 },
  { bwv: 859, book: 1, key: 'F# minor', type: 'prelude', timeSignature: '12/16', measures: 31 },
  { bwv: 859, book: 1, key: 'F# minor', type: 'fugue', timeSignature: '4/4', measures: 53, voices: 4 },
  { bwv: 860, book: 1, key: 'G major', type: 'prelude', timeSignature: '12/8', measures: 27 },
  { bwv: 860, book: 1, key: 'G major', type: 'fugue', timeSignature: '4/4', measures: 25, voices: 3 },
  { bwv: 861, book: 1, key: 'G minor', type: 'prelude', timeSignature: '4/4', measures: 22 },
  { bwv: 861, book: 1, key: 'G minor', type: 'fugue', timeSignature: '4/4', measures: 29, voices: 4 },
  { bwv: 862, book: 1, key: 'Ab major', type: 'prelude', timeSignature: '9/8', measures: 30 },
  { bwv: 862, book: 1, key: 'Ab major', type: 'fugue', timeSignature: '4/4', measures: 91, voices: 4 },
  { bwv: 863, book: 1, key: 'G# minor', type: 'prelude', timeSignature: '4/4', measures: 50 },
  { bwv: 863, book: 1, key: 'G# minor', type: 'fugue', timeSignature: '4/4', measures: 109, voices: 3 },
  { bwv: 864, book: 1, key: 'A major', type: 'prelude', timeSignature: '3/8', measures: 26 },
  { bwv: 864, book: 1, key: 'A major', type: 'fugue', timeSignature: '3/4', measures: 105, voices: 3 },
  { bwv: 865, book: 1, key: 'A minor', type: 'prelude', timeSignature: '3/4', measures: 16 },
  { bwv: 865, book: 1, key: 'A minor', type: 'fugue', timeSignature: '4/4', measures: 36, voices: 4 },
  { bwv: 866, book: 1, key: 'Bb major', type: 'prelude', timeSignature: '4/4', measures: 20 },
  { bwv: 866, book: 1, key: 'Bb major', type: 'fugue', timeSignature: '4/4', measures: 100, voices: 3 },
  { bwv: 867, book: 1, key: 'Bb minor', type: 'prelude', timeSignature: '4/4', measures: 35 },
  { bwv: 867, book: 1, key: 'Bb minor', type: 'fugue', timeSignature: '4/4', measures: 79, voices: 5 },
  { bwv: 868, book: 1, key: 'B major', type: 'prelude', timeSignature: '4/4', measures: 63 },
  { bwv: 868, book: 1, key: 'B major', type: 'fugue', timeSignature: '4/4', measures: 72, voices: 3 },
  { bwv: 869, book: 1, key: 'B minor', type: 'prelude', timeSignature: '4/4', measures: 26 },
  { bwv: 869, book: 1, key: 'B minor', type: 'fugue', timeSignature: '4/4', measures: 48, voices: 4 },

  // Book II
  { bwv: 870, book: 2, key: 'C major', type: 'prelude', timeSignature: '4/4', measures: 39 },
  { bwv: 870, book: 2, key: 'C major', type: 'fugue', timeSignature: '4/4', measures: 42, voices: 3 },
  { bwv: 871, book: 2, key: 'C minor', type: 'prelude', timeSignature: '4/4', measures: 43 },
  { bwv: 871, book: 2, key: 'C minor', type: 'fugue', timeSignature: '4/4', measures: 43, voices: 3 },
  { bwv: 872, book: 2, key: 'C# major', type: 'prelude', timeSignature: '4/4', measures: 57 },
  { bwv: 872, book: 2, key: 'C# major', type: 'fugue', timeSignature: '4/4', measures: 90, voices: 3 },
  { bwv: 873, book: 2, key: 'C# minor', type: 'prelude', timeSignature: '3/4', measures: 48 },
  { bwv: 873, book: 2, key: 'C# minor', type: 'fugue', timeSignature: '3/4', measures: 79, voices: 3 },
  { bwv: 874, book: 2, key: 'D major', type: 'prelude', timeSignature: '6/8', measures: 37 },
  { bwv: 874, book: 2, key: 'D major', type: 'fugue', timeSignature: '4/4', measures: 94, voices: 4 },
  { bwv: 875, book: 2, key: 'D minor', type: 'prelude', timeSignature: '4/4', measures: 36 },
  { bwv: 875, book: 2, key: 'D minor', type: 'fugue', timeSignature: '6/8', measures: 43, voices: 3 },
  { bwv: 876, book: 2, key: 'Eb major', type: 'prelude', timeSignature: 'C', measures: 79 },
  { bwv: 876, book: 2, key: 'Eb major', type: 'fugue', timeSignature: 'C', measures: 109, voices: 4 },
  { bwv: 877, book: 2, key: 'Eb minor', type: 'prelude', timeSignature: '4/4', measures: 37 },
  { bwv: 877, book: 2, key: 'Eb minor', type: 'fugue', timeSignature: '6/4', measures: 47, voices: 3 },
  { bwv: 878, book: 2, key: 'E major', type: 'prelude', timeSignature: '4/4', measures: 71 },
  { bwv: 878, book: 2, key: 'E major', type: 'fugue', timeSignature: '4/4', measures: 132, voices: 4 },
  { bwv: 879, book: 2, key: 'E minor', type: 'prelude', timeSignature: '4/4', measures: 66 },
  { bwv: 879, book: 2, key: 'E minor', type: 'fugue', timeSignature: '2/2', measures: 83, voices: 3 },
  { bwv: 880, book: 2, key: 'F major', type: 'prelude', timeSignature: '4/4', measures: 35 },
  { bwv: 880, book: 2, key: 'F major', type: 'fugue', timeSignature: '4/4', measures: 59, voices: 3 },
  { bwv: 881, book: 2, key: 'F minor', type: 'prelude', timeSignature: '4/4', measures: 80 },
  { bwv: 881, book: 2, key: 'F minor', type: 'fugue', timeSignature: '4/4', measures: 48, voices: 3 },
  { bwv: 882, book: 2, key: 'F# major', type: 'prelude', timeSignature: '12/8', measures: 29 },
  { bwv: 882, book: 2, key: 'F# major', type: 'fugue', timeSignature: '4/4', measures: 142, voices: 3 },
  { bwv: 883, book: 2, key: 'F# minor', type: 'prelude', timeSignature: '9/8', measures: 41 },
  { bwv: 883, book: 2, key: 'F# minor', type: 'fugue', timeSignature: '4/4', measures: 150, voices: 4 },
  { bwv: 884, book: 2, key: 'G major', type: 'prelude', timeSignature: '4/4', measures: 66 },
  { bwv: 884, book: 2, key: 'G major', type: 'fugue', timeSignature: '4/4', measures: 68, voices: 3 },
  { bwv: 885, book: 2, key: 'G minor', type: 'prelude', timeSignature: '12/8', measures: 32 },
  { bwv: 885, book: 2, key: 'G minor', type: 'fugue', timeSignature: '3/4', measures: 96, voices: 4 },
  { bwv: 886, book: 2, key: 'Ab major', type: 'prelude', timeSignature: '4/4', measures: 65 },
  { bwv: 886, book: 2, key: 'Ab major', type: 'fugue', timeSignature: '4/4', measures: 93, voices: 4 },
  { bwv: 887, book: 2, key: 'G# minor', type: 'prelude', timeSignature: '4/4', measures: 30 },
  { bwv: 887, book: 2, key: 'G# minor', type: 'fugue', timeSignature: '4/4', measures: 70, voices: 4 },
  { bwv: 888, book: 2, key: 'A major', type: 'prelude', timeSignature: '4/4', measures: 30 },
  { bwv: 888, book: 2, key: 'A major', type: 'fugue', timeSignature: '3/8', measures: 96, voices: 3 },
  { bwv: 889, book: 2, key: 'A minor', type: 'prelude', timeSignature: '4/4', measures: 19 },
  { bwv: 889, book: 2, key: 'A minor', type: 'fugue', timeSignature: '4/4', measures: 62, voices: 3 },
  { bwv: 890, book: 2, key: 'Bb major', type: 'prelude', timeSignature: '4/4', measures: 45 },
  { bwv: 890, book: 2, key: 'Bb major', type: 'fugue', timeSignature: '4/4', measures: 93, voices: 3 },
  { bwv: 891, book: 2, key: 'Bb minor', type: 'prelude', timeSignature: '4/4', measures: 113 },
  { bwv: 891, book: 2, key: 'Bb minor', type: 'fugue', timeSignature: '4/4', measures: 70, voices: 4 },
  { bwv: 892, book: 2, key: 'B major', type: 'prelude', timeSignature: '4/4', measures: 39 },
  { bwv: 892, book: 2, key: 'B major', type: 'fugue', timeSignature: '4/4', measures: 84, voices: 4 },
  { bwv: 893, book: 2, key: 'B minor', type: 'prelude', timeSignature: '4/4', measures: 44 },
  { bwv: 893, book: 2, key: 'B minor', type: 'fugue', timeSignature: '4/4', measures: 63, voices: 4 },
];

class PieceIntroGenerator {
  private client: Anthropic;
  private config: GenerationConfig;
  private costTracker: CostTracker;
  private rateLimiter: RateLimiter;

  constructor(config: GenerationConfig) {
    this.config = config;
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.costTracker = new CostTracker(config, 'piece-intros');
    this.rateLimiter = new RateLimiter(config);
  }

  /**
   * Generate introduction for a single piece
   */
  async generateIntroduction(piece: PieceMetadata): Promise<PieceIntroduction | null> {
    const prompt = this.buildPrompt(piece);

    console.log(`⏳ Generating: BWV ${piece.bwv} ${piece.type} in ${piece.key}...`);

    await this.rateLimiter.waitIfNeeded();

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const response = await this.client.messages.create({
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        const content = response.content[0];
        if (content.type !== 'text') {
          throw new Error('Unexpected response type');
        }

        // Parse and validate JSON
        const introduction = this.parseAndValidate(content.text, piece);

        // Track costs
        this.costTracker.recordRequest({
          contentType: 'piece-introduction',
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          success: true,
        });

        console.log(`✓ BWV ${piece.bwv} ${piece.type} (${response.usage.output_tokens} tokens)`);

        return introduction;

      } catch (error) {
        const isLastAttempt = attempt === this.config.retryAttempts;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.error(
          `✗ Attempt ${attempt}/${this.config.retryAttempts} failed: ${errorMessage}`
        );

        if (isLastAttempt) {
          this.costTracker.recordRequest({
            contentType: 'piece-introduction',
            inputTokens: 0,
            outputTokens: 0,
            success: false,
            error: errorMessage,
          });
          return null;
        }

        // Exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        console.log(`   Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return null;
  }

  /**
   * Build prompt for piece introduction
   */
  private buildPrompt(piece: PieceMetadata): string {
    const voiceInfo = piece.voices ? `\n- Voices: ${piece.voices}` : '';

    return `Generate an introduction for the following piece from the Well-Tempered Clavier.

## Piece Information
- BWV: ${piece.bwv}
- Book: ${piece.book}
- Key: ${piece.key}
- Type: ${piece.type}
- Time Signature: ${piece.timeSignature}
- Total Measures: ${piece.measures}${voiceInfo}

## Output Format

Return a JSON object with this exact structure:

{
  "bwv": ${piece.bwv},
  "type": "${piece.type}",
  "key": "${piece.key}",
  "book": ${piece.book},
  "introduction": {
    "opening_hook": "A single sentence that captures what makes this piece special or memorable.",
    "character_description": "2-3 sentences describing the overall character, mood, and affect of the piece.",
    "notable_features": [
      "First notable feature or technique (1 sentence)",
      "Second notable feature (1 sentence)",
      "Third if applicable (1 sentence)"
    ],
    "listening_focus": "2-3 sentences suggesting what to pay attention to when first experiencing this piece.",
    "technical_overview": "For preludes: brief description of texture and form. For fugues: subject character, answer type (real/tonal), notable contrapuntal devices used.",
    "historical_context": "1-2 sentences of relevant context (optional—only if genuinely interesting, not filler)."
  },
  "metadata": {
    "difficulty_level": 1-5,
    "estimated_study_time_minutes": 15-60,
    "prerequisite_concepts": ["concept1", "concept2"],
    "concepts_introduced": ["concept1", "concept2"]
  }
}

## Guidelines

- Opening hook should be memorable and specific, not generic
- Avoid superlatives like "one of the greatest" or "the most famous"
- Notable features should be concrete and verifiable in the score
- Listening focus should guide first encounter, not comprehensive analysis
- Technical overview should be honest about complexity level
- Prerequisite concepts reference curriculum lessons needed first
- Concepts introduced lists what studying this piece will teach

Return ONLY the JSON object, no additional text.`;
  }

  /**
   * Parse and validate generated JSON
   */
  private parseAndValidate(text: string, piece: PieceMetadata): PieceIntroduction {
    // Extract JSON from text (in case there's markdown formatting)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    const required = [
      'bwv',
      'type',
      'key',
      'book',
      'introduction',
      'metadata',
    ];

    for (const field of required) {
      if (!(field in parsed)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const intro = parsed.introduction;
    const requiredIntroFields = [
      'opening_hook',
      'character_description',
      'notable_features',
      'listening_focus',
      'technical_overview',
    ];

    for (const field of requiredIntroFields) {
      if (!(field in intro)) {
        throw new Error(`Missing required introduction field: ${field}`);
      }
    }

    // Validate metadata
    if (!Array.isArray(intro.notable_features) || intro.notable_features.length === 0) {
      throw new Error('notable_features must be a non-empty array');
    }

    if (typeof parsed.metadata.difficulty_level !== 'number' ||
        parsed.metadata.difficulty_level < 1 ||
        parsed.metadata.difficulty_level > 5) {
      throw new Error('difficulty_level must be a number between 1 and 5');
    }

    return parsed as PieceIntroduction;
  }

  /**
   * Generate introductions for multiple pieces
   */
  async generateBatch(pieces: PieceMetadata[]): Promise<PieceIntroduction[]> {
    const introductions: PieceIntroduction[] = [];

    console.log(`\n🎼 Generating ${pieces.length} piece introductions...\n`);

    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      console.log(`[${i + 1}/${pieces.length}] ${piece.key} ${piece.type}`);

      const intro = await this.generateIntroduction(piece);
      if (intro) {
        introductions.push(intro);
      } else {
        console.error(`⚠️  Failed to generate introduction for BWV ${piece.bwv} ${piece.type}`);
      }

      // Small delay between requests
      if (i < pieces.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return introductions;
  }

  /**
   * Save generated introductions to file
   */
  saveIntroductions(introductions: PieceIntroduction[], outputPath: string): void {
    const dir = join(this.config.outputDir, 'pieces');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const fullPath = join(dir, outputPath);
    const json = this.config.prettyPrint
      ? JSON.stringify(introductions, null, 2)
      : JSON.stringify(introductions);

    writeFileSync(fullPath, json, 'utf-8');
    console.log(`\n📝 Saved to: ${fullPath}`);
  }

  /**
   * Print cost summary
   */
  printSummary(): void {
    console.log('\n' + this.costTracker.getSummary());
  }
}

/**
 * Parse command-line arguments
 */
function parseArgs(): {
  book?: 1 | 2;
  bwvNumbers?: number[];
  dryRun: boolean;
  output?: string;
} {
  const args = process.argv.slice(2);
  const result: ReturnType<typeof parseArgs> = { dryRun: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--book' && i + 1 < args.length) {
      const book = parseInt(args[++i]);
      if (book === 1 || book === 2) {
        result.book = book;
      }
    } else if (arg === '--bwv' && i + 1 < args.length) {
      result.bwvNumbers = args[++i].split(',').map(n => parseInt(n.trim()));
    } else if (arg === '--dry-run') {
      result.dryRun = true;
    } else if (arg === '--output' && i + 1 < args.length) {
      result.output = args[++i];
    }
  }

  return result;
}

/**
 * Main execution
 */
async function main() {
  console.log('🎼 Clavier Content Generation: Piece Introductions');
  console.log('━'.repeat(50));

  const args = parseArgs();
  const config = loadConfig();

  // Filter pieces based on arguments
  let pieces = WTC_PIECES;
  if (args.book) {
    pieces = pieces.filter(p => p.book === args.book);
    console.log(`Book: ${args.book}`);
  }
  if (args.bwvNumbers && args.bwvNumbers.length > 0) {
    pieces = pieces.filter(p => args.bwvNumbers!.includes(p.bwv));
    console.log(`BWV: ${args.bwvNumbers.join(', ')}`);
  }

  console.log(`Pieces: ${pieces.length}`);

  // Dry run: estimate costs
  if (args.dryRun) {
    const avgInputTokens = 2700; // Estimated based on prompt length
    const avgOutputTokens = 2000; // Estimated based on expected response
    const totalInput = pieces.length * avgInputTokens;
    const totalOutput = pieces.length * avgOutputTokens;
    const estimatedCost =
      totalInput * config.costPerInputToken +
      totalOutput * config.costPerOutputToken;

    console.log('\n💰 Cost Estimate');
    console.log('━'.repeat(50));
    console.log(`Items to generate:   ${pieces.length}`);
    console.log(`Est. input tokens:   ${totalInput.toLocaleString()} (${avgInputTokens} per item)`);
    console.log(`Est. output tokens:  ${totalOutput.toLocaleString()} (${avgOutputTokens} per item)`);
    console.log(`Est. total cost:     $${estimatedCost.toFixed(4)}`);
    console.log(`Current budget:      $${config.budgetLimit.toFixed(2)}`);
    console.log(`Remaining after:     $${(config.budgetLimit - estimatedCost).toFixed(2)}`);
    console.log('━'.repeat(50));

    return;
  }

  // Generate introductions
  const generator = new PieceIntroGenerator(config);
  const introductions = await generator.generateBatch(pieces);

  // Save results
  const outputFile = args.output || (args.book
    ? `introductions-book${args.book}.json`
    : 'introductions.json');
  generator.saveIntroductions(introductions, outputFile);

  // Print summary
  generator.printSummary();

  console.log(`\n✅ Generated ${introductions.length}/${pieces.length} introductions successfully!`);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
}

export { PieceIntroGenerator, PieceMetadata, PieceIntroduction };
