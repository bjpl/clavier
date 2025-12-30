#!/usr/bin/env node

/**
 * Generate Measure-by-Measure Commentary
 *
 * Creates detailed, contextually-aware explanations for each measure of a piece,
 * building understanding progressively through the musical journey.
 *
 * Usage:
 *   npx tsx scripts/content-generation/generate-measure-commentary.ts --bwv 846 --type prelude
 *
 * Prerequisites:
 *   - Harmonic analysis data (Roman numerals per measure)
 *   - Structural event annotations (subject entries, cadences, etc.)
 */

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { loadConfig, CostTracker, RateLimiter, SYSTEM_PROMPT, GenerationConfig } from './config';

interface HarmonicAnalysis {
  measure: number;
  romanNumeral: string;
  chord: string;
  function: string;
  inversion: string;
}

interface StructuralEvent {
  measureStart: number;
  measureEnd: number;
  event: string;
  description: string;
}

interface VoiceActivity {
  soprano?: string;
  alto?: string;
  tenor?: string;
  bass?: string;
}

interface TerminologyEntry {
  term: string;
  definition: string;
}

interface MeasureCommentary {
  measure_number: number;
  beats?: string;
  harmony: {
    roman_numeral: string;
    chord: string;
    function: string;
    inversion: string;
  };
  commentary: string;
  voice_activity?: VoiceActivity;
  terminology_introduced: TerminologyEntry[];
  connections: {
    references_back: string | null;
    sets_up: string;
  };
  notable_features: string[];
  curriculum_links: string[];
}

interface PieceCommentary {
  bwv: number;
  type: 'prelude' | 'fugue';
  key: string;
  measures: MeasureCommentary[];
}

interface AnalysisData {
  bwv: number;
  type: 'prelude' | 'fugue';
  key: string;
  timeSignature: string;
  totalMeasures: number;
  voices?: number;
  harmonicAnalysis: HarmonicAnalysis[];
  structuralEvents: StructuralEvent[];
}

class MeasureCommentaryGenerator {
  private client: Anthropic;
  private config: GenerationConfig;
  private costTracker: CostTracker;
  private rateLimiter: RateLimiter;

  constructor(config: GenerationConfig) {
    this.config = config;
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.costTracker = new CostTracker(config, 'measure-commentary');
    this.rateLimiter = new RateLimiter(config);
  }

  /**
   * Generate commentary for a batch of measures
   */
  async generateCommentaryBatch(
    analysisData: AnalysisData,
    measureStart: number,
    measureEnd: number
  ): Promise<MeasureCommentary[]> {
    const prompt = this.buildPrompt(analysisData, measureStart, measureEnd);

    console.log(`⏳ Generating commentary for measures ${measureStart}-${measureEnd}...`);

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

        // Parse and validate
        const commentary = this.parseAndValidate(content.text, measureStart, measureEnd);

        this.costTracker.recordRequest({
          contentType: 'measure-commentary',
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          success: true,
        });

        console.log(`✓ Measures ${measureStart}-${measureEnd} (${response.usage.output_tokens} tokens)`);

        return commentary;

      } catch (error) {
        const isLastAttempt = attempt === this.config.retryAttempts;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.error(`✗ Attempt ${attempt}/${this.config.retryAttempts} failed: ${errorMessage}`);

        if (isLastAttempt) {
          this.costTracker.recordRequest({
            contentType: 'measure-commentary',
            inputTokens: 0,
            outputTokens: 0,
            success: false,
            error: errorMessage,
          });
          throw error;
        }

        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        console.log(`   Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Failed to generate commentary after all retries');
  }

  /**
   * Build prompt for measure commentary
   */
  private buildPrompt(
    data: AnalysisData,
    measureStart: number,
    measureEnd: number
  ): string {
    const analysisSection = data.harmonicAnalysis
      .filter(h => h.measure >= measureStart && h.measure <= measureEnd)
      .map(h => `m${h.measure}: ${h.romanNumeral} (${h.chord})`)
      .join('\n');

    const eventsSection = data.structuralEvents
      .filter(e =>
        (e.measureStart >= measureStart && e.measureStart <= measureEnd) ||
        (e.measureEnd >= measureStart && e.measureEnd <= measureEnd)
      )
      .map(e => `- m${e.measureStart}-${e.measureEnd}: ${e.event} (${e.description})`)
      .join('\n');

    const voiceInfo = data.voices ? `\n- Voices: ${data.voices}` : '';

    return `Generate measure-by-measure commentary for the following piece.

## Piece Information
- BWV: ${data.bwv}
- Type: ${data.type}
- Key: ${data.key}
- Time Signature: ${data.timeSignature}
- Total Measures: ${data.totalMeasures}${voiceInfo}

## Measures to Analyze
${measureStart}-${measureEnd}

## Harmonic Analysis
${analysisSection}

## Structural Events
${eventsSection}

## Output Format

Return a JSON object with an array of measure commentaries:

{
  "measures": [
    {
      "measure_number": ${measureStart},
      "beats": "1-4",
      "harmony": {
        "roman_numeral": "I",
        "chord": "C",
        "function": "tonic",
        "inversion": "root"
      },
      "commentary": "2-4 sentences of detailed, contextual explanation...",
      "voice_activity": {
        "soprano": "Subject statement begins",
        "alto": "Rest",
        "tenor": "Rest"
      },
      "terminology_introduced": [
        {
          "term": "subject",
          "definition": "The main theme of a fugue..."
        }
      ],
      "connections": {
        "references_back": "Continuing from...",
        "sets_up": "This prepares..."
      },
      "notable_features": ["subject-entry"],
      "curriculum_links": ["fugue-basics"]
    }
  ]
}

## Commentary Guidelines

1. **Length**: 2-4 sentences per measure. Complex measures can be longer.

2. **First measure**: Always orient the listener—what are we hearing? What's the texture?

3. **Subject entries** (fugues): Note which voice, whether subject or answer, modifications.

4. **Harmonic events**: Explain significant motion:
   - Cadences (name the type)
   - Modulations (where going, how)
   - Chromatic chords (function)
   - Sequences (identify pattern)

5. **Connections**: Every measure connects to context:
   - References what came before
   - Sets up what follows

6. **Terminology**: Use terminology_introduced field for FIRST occurrence only.

7. **Tone variations**:
   - Arrivals: Express satisfaction
   - Complex passages: Acknowledge but guide
   - Beautiful moments: Share appreciation

8. **What NOT to include**:
   - Performance instructions
   - Comparisons to other composers
   - Speculative interpretations

Return ONLY the JSON object, no additional text.`;
  }

  /**
   * Parse and validate generated JSON
   */
  private parseAndValidate(
    text: string,
    measureStart: number,
    measureEnd: number
  ): MeasureCommentary[] {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.measures || !Array.isArray(parsed.measures)) {
      throw new Error('Response must contain a "measures" array');
    }

    const expectedMeasures = measureEnd - measureStart + 1;
    if (parsed.measures.length !== expectedMeasures) {
      throw new Error(
        `Expected ${expectedMeasures} measures, got ${parsed.measures.length}`
      );
    }

    // Validate each measure
    parsed.measures.forEach((m: any, i: number) => {
      const expectedMeasure = measureStart + i;

      if (m.measure_number !== expectedMeasure) {
        throw new Error(
          `Measure ${i + 1} has number ${m.measure_number}, expected ${expectedMeasure}`
        );
      }

      if (!m.harmony || !m.commentary || !m.connections) {
        throw new Error(`Measure ${m.measure_number} missing required fields`);
      }

      if (!Array.isArray(m.terminology_introduced)) {
        throw new Error(`Measure ${m.measure_number} terminology_introduced must be array`);
      }
    });

    return parsed.measures;
  }

  /**
   * Generate commentary for entire piece in batches
   */
  async generatePieceCommentary(
    data: AnalysisData,
    batchSize: number = 10
  ): Promise<PieceCommentary> {
    const allMeasures: MeasureCommentary[] = [];

    console.log(`\n🎼 Generating commentary for BWV ${data.bwv} ${data.type}`);
    console.log(`   ${data.totalMeasures} measures in batches of ${batchSize}\n`);

    for (let start = 1; start <= data.totalMeasures; start += batchSize) {
      const end = Math.min(start + batchSize - 1, data.totalMeasures);

      console.log(`Batch ${Math.ceil(start / batchSize)}: measures ${start}-${end}`);

      const batch = await this.generateCommentaryBatch(data, start, end);
      allMeasures.push(...batch);

      // Delay between batches
      if (end < data.totalMeasures) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return {
      bwv: data.bwv,
      type: data.type,
      key: data.key,
      measures: allMeasures,
    };
  }

  /**
   * Save commentary to file
   */
  saveCommentary(commentary: PieceCommentary, outputPath?: string): void {
    const dir = join(this.config.outputDir, 'pieces', 'commentary');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const filename = outputPath ||
      `bwv-${commentary.bwv}-${commentary.type}.json`;
    const fullPath = join(dir, filename);

    const json = this.config.prettyPrint
      ? JSON.stringify(commentary, null, 2)
      : JSON.stringify(commentary);

    writeFileSync(fullPath, json, 'utf-8');
    console.log(`\n📝 Saved to: ${fullPath}`);
  }

  printSummary(): void {
    console.log('\n' + this.costTracker.getSummary());
  }
}

/**
 * Load analysis data from file
 */
function loadAnalysisData(bwv: number, type: 'prelude' | 'fugue'): AnalysisData {
  const filename = `bwv-${bwv}-${type}-analysis.json`;
  const path = join(process.cwd(), 'content', 'analysis', filename);

  if (!existsSync(path)) {
    throw new Error(
      `Analysis file not found: ${path}\n` +
      'Please create harmonic analysis data first. See README for format.'
    );
  }

  const data = JSON.parse(readFileSync(path, 'utf-8'));
  return data as AnalysisData;
}

/**
 * Parse command-line arguments
 */
function parseArgs(): {
  bwv?: number;
  type?: 'prelude' | 'fugue';
  output?: string;
  batchSize?: number;
} {
  const args = process.argv.slice(2);
  const result: ReturnType<typeof parseArgs> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--bwv' && i + 1 < args.length) {
      result.bwv = parseInt(args[++i]);
    } else if (arg === '--type' && i + 1 < args.length) {
      const type = args[++i];
      if (type === 'prelude' || type === 'fugue') {
        result.type = type;
      }
    } else if (arg === '--output' && i + 1 < args.length) {
      result.output = args[++i];
    } else if (arg === '--batch-size' && i + 1 < args.length) {
      result.batchSize = parseInt(args[++i]);
    }
  }

  return result;
}

/**
 * Main execution
 */
async function main() {
  console.log('🎼 Clavier Content Generation: Measure Commentary');
  console.log('━'.repeat(50));

  const args = parseArgs();

  if (!args.bwv || !args.type) {
    console.error('Usage: generate-measure-commentary.ts --bwv <number> --type <prelude|fugue>');
    console.error('\nExample:');
    console.error('  npx tsx generate-measure-commentary.ts --bwv 846 --type prelude');
    process.exit(1);
  }

  console.log(`BWV: ${args.bwv}`);
  console.log(`Type: ${args.type}`);

  // Load analysis data
  const analysisData = loadAnalysisData(args.bwv, args.type);
  console.log(`Loaded analysis: ${analysisData.totalMeasures} measures\n`);

  const config = loadConfig();
  const generator = new MeasureCommentaryGenerator(config);

  // Generate commentary
  const commentary = await generator.generatePieceCommentary(
    analysisData,
    args.batchSize || 10
  );

  // Save results
  generator.saveCommentary(commentary, args.output);

  // Print summary
  generator.printSummary();

  console.log(`\n✅ Generated commentary for ${commentary.measures.length} measures!`);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
}

export { MeasureCommentaryGenerator, AnalysisData, MeasureCommentary, PieceCommentary };
