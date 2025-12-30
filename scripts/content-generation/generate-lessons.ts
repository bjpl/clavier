#!/usr/bin/env node

/**
 * Generate Curriculum Lessons
 *
 * Creates structured, progressive lessons that teach music theory concepts
 * using examples from the Well-Tempered Clavier.
 *
 * Usage:
 *   npx tsx scripts/content-generation/generate-lessons.ts --domain harmony
 *   npx tsx scripts/content-generation/generate-lessons.ts --lesson harmony-dominant-resolution
 */

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { loadConfig, CostTracker, RateLimiter, SYSTEM_PROMPT, GenerationConfig } from './config';

interface LessonSection {
  section_id: string;
  section_type: 'introduction' | 'explanation' | 'guided_example' | 'additional_examples' | 'summary';
  title: string;
  content?: string;
  narration_text?: string;
  key_points?: string[];
  piece_reference?: {
    bwv: number;
    type: 'prelude' | 'fugue';
    measure_start: number;
    measure_end: number;
  };
  walkthrough?: string;
  annotations?: Array<{
    measure: number;
    label: string;
    description: string;
  }>;
  listening_prompts?: string[];
  examples?: Array<{
    bwv: number;
    type: 'prelude' | 'fugue';
    measure_start: number;
    measure_end: number;
    brief_description: string;
    what_to_notice: string;
  }>;
  key_takeaways?: string[];
  terminology?: Array<{
    term: string;
    definition: string;
  }>;
}

interface Lesson {
  lesson_id: string;
  title: string;
  domain: string;
  unit: string;
  module: string;
  position: {
    previous_lesson: string | null;
    next_lesson: string | null;
  };
  learning_objectives: string[];
  estimated_time_minutes: number;
  sections: LessonSection[];
  explorer_links: Array<{
    feature: string;
    description: string;
  }>;
  next_steps: string;
}

interface LessonSpec {
  lesson_id: string;
  title: string;
  domain: string;
  unit: string;
  module: string;
  previous_lesson: string | null;
  next_lesson: string | null;
  learning_objectives: string[];
  primary_example: {
    bwv: number;
    type: 'prelude' | 'fugue';
    measure_start: number;
    measure_end: number;
  };
  secondary_examples: Array<{
    bwv: number;
    type: 'prelude' | 'fugue';
    measure_start: number;
    measure_end: number;
  }>;
  prerequisites: string[];
}

// Complete curriculum structure
const CURRICULUM_STRUCTURE = {
  fundamentals: {
    'Reading Music': [
      { id: 'fundamentals-staff-clefs', title: 'The Staff and Clefs' },
      { id: 'fundamentals-note-names', title: 'Note Names and Octaves' },
      { id: 'fundamentals-rhythm', title: 'Reading Rhythm' },
    ],
    'Keys and Scales': [
      { id: 'fundamentals-major-scales', title: 'Major Scales' },
      { id: 'fundamentals-minor-scales', title: 'Minor Scales' },
      { id: 'fundamentals-circle-fifths', title: 'Key Signatures and Circle of Fifths' },
    ],
  },
  harmony: {
    'Chords': [
      { id: 'harmony-triads', title: 'Triads' },
      { id: 'harmony-seventh-chords', title: 'Seventh Chords' },
      { id: 'harmony-inversions', title: 'Chord Inversions' },
      { id: 'harmony-figured-bass', title: 'Figured Bass Notation' },
    ],
    'Harmonic Function': [
      { id: 'harmony-tonic', title: 'Tonic Function' },
      { id: 'harmony-dominant', title: 'Dominant Function' },
      { id: 'harmony-predominant', title: 'Predominant Function' },
      { id: 'harmony-i-iv-v-i', title: 'The I-IV-V-I Progression' },
    ],
    'Cadences': [
      { id: 'harmony-authentic-cadences', title: 'Authentic Cadences' },
      { id: 'harmony-half-cadences', title: 'Half Cadences' },
      { id: 'harmony-other-cadences', title: 'Deceptive and Plagal Cadences' },
    ],
    'Beyond Diatonic': [
      { id: 'harmony-secondary-dominants', title: 'Secondary Dominants' },
      { id: 'harmony-mode-mixture', title: 'Mode Mixture' },
      { id: 'harmony-modulation', title: 'Modulation Basics' },
      { id: 'harmony-sequences', title: 'Sequences' },
    ],
  },
  // Additional domains: counterpoint, fugue, form, advanced
};

class LessonGenerator {
  private client: Anthropic;
  private config: GenerationConfig;
  private costTracker: CostTracker;
  private rateLimiter: RateLimiter;

  constructor(config: GenerationConfig) {
    this.config = config;
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.costTracker = new CostTracker(config, 'lessons');
    this.rateLimiter = new RateLimiter(config);
  }

  async generateLesson(spec: LessonSpec): Promise<Lesson | null> {
    const prompt = this.buildPrompt(spec);

    console.log(`⏳ Generating: ${spec.title}...`);

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

        const lesson = this.parseAndValidate(content.text);

        this.costTracker.recordRequest({
          contentType: 'curriculum-lesson',
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          success: true,
        });

        console.log(`✓ ${spec.title} (${response.usage.output_tokens} tokens)`);

        return lesson;

      } catch (error) {
        const isLastAttempt = attempt === this.config.retryAttempts;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.error(`✗ Attempt ${attempt}/${this.config.retryAttempts} failed: ${errorMessage}`);

        if (isLastAttempt) {
          this.costTracker.recordRequest({
            contentType: 'curriculum-lesson',
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

  private buildPrompt(spec: LessonSpec): string {
    const examplesSection = spec.secondary_examples
      .map(ex => `  - BWV ${ex.bwv} ${ex.type}, measures ${ex.measure_start}-${ex.measure_end}`)
      .join('\n');

    const prereqSection = spec.prerequisites
      .map(p => `- ${p}`)
      .join('\n');

    return `Generate a complete lesson for the Clavier curriculum.

## Lesson Metadata
- Domain: ${spec.domain}
- Unit: ${spec.unit}
- Module: ${spec.module}
- Lesson Title: ${spec.title}
- Position in Sequence:
  - Previous: ${spec.previous_lesson || 'None (first lesson)'}
  - Next: ${spec.next_lesson || 'TBD'}

## Learning Objectives
${spec.learning_objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

## WTC Examples to Use
- Primary Example: BWV ${spec.primary_example.bwv} ${spec.primary_example.type}, measures ${spec.primary_example.measure_start}-${spec.primary_example.measure_end}
- Secondary Examples:
${examplesSection}

## Prerequisites
${prereqSection}

## Output Format

Return a complete JSON lesson object following this structure. Include ALL sections.

{
  "lesson_id": "${spec.lesson_id}",
  "title": "${spec.title}",
  "domain": "${spec.domain}",
  "unit": "${spec.unit}",
  "module": "${spec.module}",
  "position": {
    "previous_lesson": ${spec.previous_lesson ? `"${spec.previous_lesson}"` : 'null'},
    "next_lesson": ${spec.next_lesson ? `"${spec.next_lesson}"` : 'null'}
  },
  "learning_objectives": ${JSON.stringify(spec.learning_objectives)},
  "estimated_time_minutes": 15-25,
  "sections": [
    {
      "section_id": "intro",
      "section_type": "introduction",
      "title": "Introduction",
      "content": "Markdown content introducing the concept and why it matters...",
      "narration_text": "Slightly adapted text optimized for TTS reading..."
    },
    {
      "section_id": "concept",
      "section_type": "explanation",
      "title": "[Descriptive Title]",
      "content": "Markdown explanation of the core concept...",
      "key_points": [
        "Key point 1",
        "Key point 2"
      ],
      "narration_text": "..."
    },
    {
      "section_id": "example1",
      "section_type": "guided_example",
      "title": "Guided Example: BWV [X], Measures [Y-Z]",
      "piece_reference": {
        "bwv": ${spec.primary_example.bwv},
        "type": "${spec.primary_example.type}",
        "measure_start": ${spec.primary_example.measure_start},
        "measure_end": ${spec.primary_example.measure_end}
      },
      "walkthrough": "Step-by-step markdown explanation...",
      "annotations": [
        {"measure": X, "label": "Label", "description": "What to notice"}
      ],
      "listening_prompts": [
        "First listening instruction",
        "Second listening instruction"
      ],
      "narration_text": "..."
    },
    {
      "section_id": "examples",
      "section_type": "additional_examples",
      "title": "More Examples",
      "examples": [
        {
          "bwv": X,
          "type": "prelude",
          "measure_start": Y,
          "measure_end": Z,
          "brief_description": "What this example shows...",
          "what_to_notice": "Key observation..."
        }
      ]
    },
    {
      "section_id": "summary",
      "section_type": "summary",
      "title": "Summary",
      "key_takeaways": [
        "Takeaway 1",
        "Takeaway 2"
      ],
      "terminology": [
        {
          "term": "term",
          "definition": "definition"
        }
      ],
      "narration_text": "..."
    }
  ],
  "explorer_links": [
    {"feature": "feature-id", "description": "See all X in the WTC"}
  ],
  "next_steps": "In the next lesson, we'll explore..."
}

## Writing Guidelines

1. **Introduction**: Hook the reader. Connect to prior knowledge.

2. **Explanation**:
   - Start concrete, then abstract
   - Use analogies when helpful
   - Keep paragraphs short (3-4 sentences)
   - Build complexity gradually

3. **Guided Example**:
   - Walk through measure by measure if needed
   - Tell what to listen for BEFORE listening
   - Confirm what they should have heard AFTER
   - Connect back to concept

4. **Additional Examples**:
   - Show variety (different keys, contexts)
   - Brief descriptions—they can explore in detail later
   - Note similarities and differences

5. **Summary**:
   - No new information
   - Reinforce key insight
   - Bridge to next lesson

6. **Narration Text**:
   - Simpler sentence structure than written
   - Add transitional phrases
   - Avoid abbreviations
   - Spell out numbers under 10

Return ONLY the JSON object.`;
  }

  private parseAndValidate(text: string): Lesson {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    const required = [
      'lesson_id',
      'title',
      'domain',
      'unit',
      'sections',
      'learning_objectives',
    ];

    for (const field of required) {
      if (!(field in parsed)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      throw new Error('sections must be a non-empty array');
    }

    // Validate section types
    const requiredSectionTypes = [
      'introduction',
      'explanation',
      'guided_example',
      'summary',
    ];

    const sectionTypes = parsed.sections.map((s: any) => s.section_type);
    for (const type of requiredSectionTypes) {
      if (!sectionTypes.includes(type)) {
        throw new Error(`Missing required section type: ${type}`);
      }
    }

    return parsed as Lesson;
  }

  async generateBatch(specs: LessonSpec[]): Promise<Lesson[]> {
    const lessons: Lesson[] = [];

    console.log(`\n📚 Generating ${specs.length} lessons...\n`);

    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      console.log(`[${i + 1}/${specs.length}] ${spec.title}`);

      const lesson = await this.generateLesson(spec);
      if (lesson) {
        lessons.push(lesson);
      }

      if (i < specs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return lessons;
  }

  saveLesson(lesson: Lesson): void {
    const dir = join(this.config.outputDir, 'curriculum', 'lessons', lesson.domain);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const filename = `${lesson.lesson_id}.json`;
    const fullPath = join(dir, filename);

    const json = this.config.prettyPrint
      ? JSON.stringify(lesson, null, 2)
      : JSON.stringify(lesson);

    writeFileSync(fullPath, json, 'utf-8');
    console.log(`   → Saved to: lessons/${lesson.domain}/${filename}`);
  }

  printSummary(): void {
    console.log('\n' + this.costTracker.getSummary());
  }
}

function parseArgs(): {
  domain?: string;
  lesson?: string;
  dryRun: boolean;
} {
  const args = process.argv.slice(2);
  const result: ReturnType<typeof parseArgs> = { dryRun: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--domain' && i + 1 < args.length) {
      result.domain = args[++i];
    } else if (arg === '--lesson' && i + 1 < args.length) {
      result.lesson = args[++i];
    } else if (arg === '--dry-run') {
      result.dryRun = true;
    }
  }

  return result;
}

async function main() {
  console.log('📚 Clavier Content Generation: Curriculum Lessons');
  console.log('━'.repeat(50));

  const args = parseArgs();

  if (!args.domain && !args.lesson) {
    console.error('Usage: generate-lessons.ts --domain <domain> OR --lesson <lesson-id>');
    console.error('\nDomains: fundamentals, harmony, counterpoint, fugue, form, advanced');
    console.error('\nExample:');
    console.error('  npx tsx generate-lessons.ts --domain harmony');
    process.exit(1);
  }

  const config = loadConfig();
  const generator = new LessonGenerator(config);

  // For now, this is a template. In real implementation, you would:
  // 1. Load lesson specs from a structured file
  // 2. Generate lessons based on specs
  // 3. Save to appropriate directories

  console.log('\n⚠️  Lesson generation requires lesson specifications.');
  console.log('   Please create lesson spec files following the format in the README.');

  generator.printSummary();
}

if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
}

export { LessonGenerator, Lesson, LessonSpec };
