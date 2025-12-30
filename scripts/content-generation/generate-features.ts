#!/usr/bin/env node

/**
 * Generate Feature Definitions
 *
 * Creates clear, multi-level explanations of music theory techniques and concepts
 * that can be searched and explored in the Clavier application.
 *
 * Usage:
 *   npx tsx scripts/content-generation/generate-features.ts --category harmony
 *   npx tsx scripts/content-generation/generate-features.ts --all
 */

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { loadConfig, CostTracker, RateLimiter, SYSTEM_PROMPT, GenerationConfig } from './config';

interface FeatureDefinition {
  feature_id: string;
  name: string;
  category: string;
  subcategory: string;
  related_features: string[];
  definitions: {
    brief: string;
    standard: string;
    detailed: string;
  };
  what_to_listen_for: string;
  visual_markers: string;
  common_contexts: string[];
  difficulty_level: number;
  curriculum_lesson?: string;
  search_keywords: string[];
}

// Feature categories and their features
const FEATURE_CATEGORIES = {
  harmony: [
    'authentic-cadence-perfect',
    'authentic-cadence-imperfect',
    'half-cadence',
    'deceptive-cadence',
    'plagal-cadence',
    'phrygian-cadence',
    'secondary-dominant',
    'secondary-leading-tone',
    'neapolitan',
    'augmented-sixth-italian',
    'augmented-sixth-german',
    'augmented-sixth-french',
    'mode-mixture',
    'modulation-pivot-chord',
    'modulation-direct',
    'sequence-descending-fifths',
    'sequence-ascending-5-6',
    'sequence-descending-thirds',
    'pedal-point-tonic',
    'pedal-point-dominant',
  ],
  counterpoint: [
    'parallel-thirds',
    'parallel-sixths',
    'voice-exchange',
    'suspension-4-3',
    'suspension-7-6',
    'suspension-9-8',
    'suspension-2-3',
    'retardation',
    'anticipation',
    'passing-tone',
    'neighbor-tone',
    'escape-tone',
    'appoggiatura',
    'imitation-strict',
    'imitation-free',
    'canon',
    'invertible-counterpoint',
  ],
  fugue: [
    'fugue-subject',
    'fugue-answer-real',
    'fugue-answer-tonal',
    'countersubject',
    'bridge-passage',
    'episode',
    'stretto',
    'augmentation',
    'diminution',
    'inversion',
    'retrograde',
    'pedal-point-fugue',
    'coda',
  ],
  form: [
    'exposition-fugue',
    'development-section',
    'recapitulation',
    'binary-form',
    'ternary-form',
    'rounded-binary',
    'through-composed',
    'phrase-period',
    'phrase-sentence',
    'phrase-extension',
    'phrase-elision',
    'fragmentation',
  ],
};

class FeatureGenerator {
  private client: Anthropic;
  private config: GenerationConfig;
  private costTracker: CostTracker;
  private rateLimiter: RateLimiter;

  constructor(config: GenerationConfig) {
    this.config = config;
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.costTracker = new CostTracker(config, 'features');
    this.rateLimiter = new RateLimiter(config);
  }

  async generateFeatureDefinition(
    featureId: string,
    category: string
  ): Promise<FeatureDefinition | null> {
    const prompt = this.buildPrompt(featureId, category);

    console.log(`⏳ Generating: ${featureId}...`);

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

        const definition = this.parseAndValidate(content.text);

        this.costTracker.recordRequest({
          contentType: 'feature-definition',
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          success: true,
        });

        console.log(`✓ ${featureId} (${response.usage.output_tokens} tokens)`);

        return definition;

      } catch (error) {
        const isLastAttempt = attempt === this.config.retryAttempts;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.error(`✗ Attempt ${attempt}/${this.config.retryAttempts} failed: ${errorMessage}`);

        if (isLastAttempt) {
          this.costTracker.recordRequest({
            contentType: 'feature-definition',
            inputTokens: 0,
            outputTokens: 0,
            success: false,
            error: errorMessage,
          });
          return null;
        }

        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return null;
  }

  private buildPrompt(featureId: string, category: string): string {
    // Convert feature-id to readable name
    const name = featureId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return `Generate a comprehensive definition for a music theory feature used in the Clavier Explorer.

## Feature to Define
- Feature ID: ${featureId}
- Name: ${name}
- Category: ${category}

## Output Format

Return a JSON object with this structure:

{
  "feature_id": "${featureId}",
  "name": "${name}",
  "category": "${category}",
  "subcategory": "appropriate-subcategory",
  "related_features": ["feature-id-1", "feature-id-2"],
  "definitions": {
    "brief": "A single sentence definition suitable for tooltips (max 15 words).",
    "standard": "A 2-3 sentence definition for normal use in commentary and lessons.",
    "detailed": "A full paragraph explanation with technical detail, history, variants, and edge cases."
  },
  "what_to_listen_for": "1-2 sentences describing how to recognize this aurally—what does it sound like?",
  "visual_markers": "1-2 sentences describing what to look for in the score.",
  "common_contexts": [
    "Where this typically appears and why",
    "Another common usage context"
  ],
  "difficulty_level": 1-5,
  "curriculum_lesson": "lesson-id-where-this-is-taught",
  "search_keywords": ["synonym1", "related-term", "descriptive-word", "etc"]
}

## Guidelines

1. **Brief definition**: Must be one clear sentence. Used in tooltips.

2. **Standard definition**: The go-to explanation. Assumes some context. 2-3 sentences.

3. **Detailed definition**: For "tell me more" situations. Can include:
   - Historical context
   - Variants and special cases
   - How it evolved
   - Edge cases to be aware of

4. **What to listen for**: Practical listening guidance. Sound characteristics.

5. **Visual markers**: What does this look like on the page? Score appearance.

6. **Common contexts**:
   - Where does this typically appear?
   - Why would Bach use this?
   - What function does it serve?

7. **Difficulty level**:
   - 1: Fundamental concept (triads, cadences)
   - 2: Intermediate (secondary dominants, suspensions)
   - 3: Advanced (mode mixture, complex counterpoint)
   - 4: Very advanced (fugal devices, chromaticism)
   - 5: Expert level (multiple simultaneous techniques)

8. **Search keywords**: Include:
   - Synonyms
   - Related terms
   - Descriptive words someone might search
   - Common misspellings if applicable

Return ONLY the JSON object.`;
  }

  private parseAndValidate(text: string): FeatureDefinition {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const required = [
      'feature_id',
      'name',
      'category',
      'definitions',
      'what_to_listen_for',
      'visual_markers',
      'common_contexts',
      'difficulty_level',
      'search_keywords',
    ];

    for (const field of required) {
      if (!(field in parsed)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const defs = parsed.definitions;
    if (!defs.brief || !defs.standard || !defs.detailed) {
      throw new Error('definitions must include brief, standard, and detailed');
    }

    if (!Array.isArray(parsed.common_contexts) || parsed.common_contexts.length === 0) {
      throw new Error('common_contexts must be a non-empty array');
    }

    if (!Array.isArray(parsed.search_keywords) || parsed.search_keywords.length === 0) {
      throw new Error('search_keywords must be a non-empty array');
    }

    if (typeof parsed.difficulty_level !== 'number' ||
        parsed.difficulty_level < 1 ||
        parsed.difficulty_level > 5) {
      throw new Error('difficulty_level must be 1-5');
    }

    return parsed as FeatureDefinition;
  }

  async generateBatch(
    category: string,
    featureIds: string[]
  ): Promise<FeatureDefinition[]> {
    const definitions: FeatureDefinition[] = [];

    console.log(`\n🎯 Generating ${featureIds.length} feature definitions for ${category}...\n`);

    for (let i = 0; i < featureIds.length; i++) {
      const featureId = featureIds[i];
      console.log(`[${i + 1}/${featureIds.length}] ${featureId}`);

      const definition = await this.generateFeatureDefinition(featureId, category);
      if (definition) {
        definitions.push(definition);
      }

      if (i < featureIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return definitions;
  }

  saveDefinitions(definitions: FeatureDefinition[], category: string): void {
    const dir = join(this.config.outputDir, 'features');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const filename = `definitions-${category}.json`;
    const fullPath = join(dir, filename);

    const json = this.config.prettyPrint
      ? JSON.stringify(definitions, null, 2)
      : JSON.stringify(definitions);

    writeFileSync(fullPath, json, 'utf-8');
    console.log(`\n📝 Saved to: ${fullPath}`);
  }

  printSummary(): void {
    console.log('\n' + this.costTracker.getSummary());
  }
}

function parseArgs(): {
  category?: string;
  all: boolean;
  dryRun: boolean;
} {
  const args = process.argv.slice(2);
  const result: ReturnType<typeof parseArgs> = { all: false, dryRun: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--category' && i + 1 < args.length) {
      result.category = args[++i];
    } else if (arg === '--all') {
      result.all = true;
    } else if (arg === '--dry-run') {
      result.dryRun = true;
    }
  }

  return result;
}

async function main() {
  console.log('🎯 Clavier Content Generation: Feature Definitions');
  console.log('━'.repeat(50));

  const args = parseArgs();

  if (!args.category && !args.all) {
    console.error('Usage: generate-features.ts --category <category> OR --all');
    console.error('\nCategories: harmony, counterpoint, fugue, form');
    console.error('\nExample:');
    console.error('  npx tsx generate-features.ts --category harmony');
    process.exit(1);
  }

  const config = loadConfig();
  const generator = new FeatureGenerator(config);

  const categories = args.all
    ? Object.keys(FEATURE_CATEGORIES)
    : [args.category!];

  for (const category of categories) {
    if (!(category in FEATURE_CATEGORIES)) {
      console.error(`Unknown category: ${category}`);
      continue;
    }

    const featureIds = FEATURE_CATEGORIES[category as keyof typeof FEATURE_CATEGORIES];

    if (args.dryRun) {
      console.log(`\n${category}: ${featureIds.length} features`);
      continue;
    }

    const definitions = await generator.generateBatch(category, featureIds);
    generator.saveDefinitions(definitions, category);
  }

  generator.printSummary();

  console.log('\n✅ Feature generation complete!');
}

if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
}

export { FeatureGenerator, FeatureDefinition };
