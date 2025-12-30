/**
 * Content Generation Configuration
 * API settings, rate limits, and cost tracking for LLM-based content generation
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface GenerationConfig {
  // API Configuration
  apiProvider: 'anthropic' | 'openai';
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;

  // Rate Limiting
  requestsPerMinute: number;
  requestsPerDay: number;

  // Cost Tracking
  costPerInputToken: number;
  costPerOutputToken: number;
  budgetLimit: number;

  // Output Configuration
  outputDir: string;
  validateOutput: boolean;
  prettyPrint: boolean;

  // Batch Processing
  batchSize: number;
  retryAttempts: number;
  retryDelay: number; // milliseconds
}

export const DEFAULT_CONFIG: GenerationConfig = {
  // Anthropic Claude Sonnet 4.5
  apiProvider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  model: 'claude-sonnet-4-5-20250929',
  maxTokens: 8000,
  temperature: 0.7,

  // Conservative rate limits for Anthropic
  requestsPerMinute: 5,
  requestsPerDay: 1000,

  // Pricing for Claude Sonnet 4.5 (as of 2025)
  // Note: Update these values based on current pricing
  costPerInputToken: 0.000003,  // $3 per million tokens
  costPerOutputToken: 0.000015, // $15 per million tokens
  budgetLimit: 100, // $100 default budget

  // Output settings
  outputDir: join(process.cwd(), 'content'),
  validateOutput: true,
  prettyPrint: true,

  // Batch processing
  batchSize: 5,
  retryAttempts: 3,
  retryDelay: 2000,
};

export interface CostTracking {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  sessionStartTime: string;
  sessionEndTime?: string;
  requests: Array<{
    timestamp: string;
    contentType: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    success: boolean;
    error?: string;
  }>;
}

export class CostTracker {
  private tracking: CostTracking;
  private config: GenerationConfig;
  private trackingFile: string;

  constructor(config: GenerationConfig, sessionId?: string) {
    this.config = config;
    const sessionName = sessionId || new Date().toISOString().split('T')[0];
    this.trackingFile = join(config.outputDir, 'tracking', `costs-${sessionName}.json`);

    // Ensure tracking directory exists
    const trackingDir = join(config.outputDir, 'tracking');
    if (!existsSync(trackingDir)) {
      mkdirSync(trackingDir, { recursive: true });
    }

    // Load existing tracking or initialize new
    if (existsSync(this.trackingFile)) {
      const data = readFileSync(this.trackingFile, 'utf-8');
      this.tracking = JSON.parse(data);
    } else {
      this.tracking = {
        totalRequests: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCost: 0,
        sessionStartTime: new Date().toISOString(),
        requests: [],
      };
    }
  }

  recordRequest(params: {
    contentType: string;
    inputTokens: number;
    outputTokens: number;
    success: boolean;
    error?: string;
  }): void {
    const cost =
      params.inputTokens * this.config.costPerInputToken +
      params.outputTokens * this.config.costPerOutputToken;

    this.tracking.totalRequests++;
    this.tracking.totalInputTokens += params.inputTokens;
    this.tracking.totalOutputTokens += params.outputTokens;
    this.tracking.totalCost += cost;

    this.tracking.requests.push({
      timestamp: new Date().toISOString(),
      contentType: params.contentType,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      cost,
      success: params.success,
      error: params.error,
    });

    this.save();

    // Check budget
    if (this.tracking.totalCost > this.config.budgetLimit) {
      console.warn(
        `⚠️  Budget limit exceeded! Spent $${this.tracking.totalCost.toFixed(2)} ` +
        `of $${this.config.budgetLimit.toFixed(2)} budget.`
      );
    }
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    return (
      inputTokens * this.config.costPerInputToken +
      outputTokens * this.config.costPerOutputToken
    );
  }

  getRemainingBudget(): number {
    return Math.max(0, this.config.budgetLimit - this.tracking.totalCost);
  }

  getSummary(): string {
    const avgInputTokens = this.tracking.totalRequests > 0
      ? Math.round(this.tracking.totalInputTokens / this.tracking.totalRequests)
      : 0;
    const avgOutputTokens = this.tracking.totalRequests > 0
      ? Math.round(this.tracking.totalOutputTokens / this.tracking.totalRequests)
      : 0;
    const successRate = this.tracking.totalRequests > 0
      ? ((this.tracking.requests.filter(r => r.success).length / this.tracking.totalRequests) * 100).toFixed(1)
      : '0';

    return `
📊 Generation Session Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Requests:     ${this.tracking.totalRequests}
Success Rate:       ${successRate}%
Total Input Tokens: ${this.tracking.totalInputTokens.toLocaleString()}
Total Output Tokens: ${this.tracking.totalOutputTokens.toLocaleString()}
Avg Input Tokens:   ${avgInputTokens.toLocaleString()}
Avg Output Tokens:  ${avgOutputTokens.toLocaleString()}
Total Cost:         $${this.tracking.totalCost.toFixed(4)}
Remaining Budget:   $${this.getRemainingBudget().toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }

  save(): void {
    this.tracking.sessionEndTime = new Date().toISOString();
    writeFileSync(this.trackingFile, JSON.stringify(this.tracking, null, 2), 'utf-8');
  }
}

export class RateLimiter {
  private requestTimestamps: number[] = [];
  private config: GenerationConfig;

  constructor(config: GenerationConfig) {
    this.config = config;
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Clean up old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneDayAgo);

    // Check daily limit
    if (this.requestTimestamps.length >= this.config.requestsPerDay) {
      throw new Error(
        `Daily rate limit reached (${this.config.requestsPerDay} requests/day). ` +
        'Please wait until tomorrow or increase your limit.'
      );
    }

    // Check per-minute limit
    const recentRequests = this.requestTimestamps.filter(ts => ts > oneMinuteAgo);
    if (recentRequests.length >= this.config.requestsPerMinute) {
      const oldestRecent = Math.min(...recentRequests);
      const waitTime = 60 * 1000 - (now - oldestRecent);

      if (waitTime > 0) {
        console.log(`⏳ Rate limit: waiting ${Math.ceil(waitTime / 1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    this.requestTimestamps.push(Date.now());
  }
}

/**
 * Load configuration from environment and defaults
 */
export function loadConfig(overrides?: Partial<GenerationConfig>): GenerationConfig {
  const config: GenerationConfig = {
    ...DEFAULT_CONFIG,
    ...overrides,
  };

  // Validate API key
  if (!config.apiKey) {
    throw new Error(
      'API key not found. Please set ANTHROPIC_API_KEY environment variable ' +
      'or provide it in the configuration.'
    );
  }

  // Ensure output directory exists
  if (!existsSync(config.outputDir)) {
    mkdirSync(config.outputDir, { recursive: true });
  }

  return config;
}

/**
 * System prompt for all content generation sessions
 */
export const SYSTEM_PROMPT = `You are an expert music theorist and educator creating content for "Clavier," a personal music theory learning application centered entirely on Bach's Well-Tempered Clavier (BWV 846-893).

## Your Role

You are writing for a single learner: an intelligent adult with strong analytical skills but limited formal music theory training. He can read basic treble and bass clef, understands major/minor conceptually, but has no experience with Roman numeral analysis, counterpoint, or formal music theory terminology.

## Core Principles

1. **Situated Learning**: Every concept must emerge from actual musical examples in the WTC, never presented abstractly first
2. **Accessible Depth**: Explain advanced concepts (stretto, inversion, augmentation) accessibly when they appear—don't defer them to "advanced" sections
3. **Conversational Authority**: Write like a knowledgeable friend explaining over coffee, not a textbook—but maintain complete accuracy
4. **Contextual Awareness**: Every explanation should connect to what came before and what follows
5. **Terminology Introduction**: On first use of any term, provide a natural inline definition; on subsequent uses, the term can stand alone

## Musical Knowledge You Have

You have deep knowledge of:
- All 48 preludes and fugues (24 in each book)
- Harmonic progressions, cadences, modulations
- Contrapuntal techniques (imitation, inversion, augmentation, stretto, etc.)
- Fugue construction (subject, answer, countersubject, episodes, etc.)
- Baroque keyboard style and performance practice
- The theoretical literature on Bach's keyboard works

## Output Requirements

- Always output valid JSON unless otherwise specified
- Use consistent terminology across all content
- Reference specific measure numbers when discussing musical events
- Use modern note naming (C4 = middle C, sharps as #, flats as b)
- Roman numerals: uppercase for major (I, IV, V), lowercase for minor (ii, iii, vi)
- For secondary dominants: V/V, V/vi, etc.
- For inversions: I6, V65, V43, V42, etc.

## Voice and Tone

- Warm, encouraging, intellectually engaged
- Express genuine enthusiasm for beautiful moments in the music
- Acknowledge when something is complex, but convey that it's comprehensible
- Never condescending; never assume the learner "won't understand"
- Use "we" and "you" naturally ("Notice how Bach..." / "When we arrive at measure 15...")`;
