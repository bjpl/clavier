# Clavier Content Generation Framework

Automated content generation system for creating music theory educational content using AI language models (Anthropic Claude Sonnet 4.5).

## Overview

This framework generates structured educational content for the Clavier application:

- **Piece Introductions**: Orientation and overview for each of the 48 preludes/fugues
- **Measure Commentary**: Detailed, contextual analysis for every measure
- **Curriculum Lessons**: Progressive, pedagogical lessons organized by domain
- **Feature Definitions**: Multi-level explanations of music theory techniques
- **Glossary Terms**: Comprehensive terminology reference

**Estimated Output**: ~500,000 words across all content types

## Architecture

```
scripts/content-generation/
├── config.ts                      # API configuration, cost tracking, rate limiting
├── generate-piece-intros.ts       # Generate piece introductions
├── generate-measure-commentary.ts # Generate measure-by-measure analysis
├── generate-lessons.ts            # Generate curriculum lessons
├── generate-features.ts           # Generate feature definitions
└── README.md                      # This file
```

## Setup

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk dotenv
```

### 2. Configure API Key

Create a `.env` file in the project root:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Configure Budget and Limits

Edit `config.ts` to set:
- `budgetLimit`: Maximum spend (default: $100)
- `requestsPerMinute`: Rate limit (default: 5)
- `requestsPerDay`: Daily limit (default: 1000)

## Usage

### Generate Piece Introductions

Generate introductions for all 48 pieces:

```bash
npx tsx scripts/content-generation/generate-piece-intros.ts
```

Options:
```bash
# Generate specific book
npx tsx scripts/content-generation/generate-piece-intros.ts --book 1

# Generate specific BWV numbers
npx tsx scripts/content-generation/generate-piece-intros.ts --bwv 846,847,848

# Dry run (estimate cost without generating)
npx tsx scripts/content-generation/generate-piece-intros.ts --dry-run
```

### Generate Measure Commentary

Generate detailed measure-by-measure analysis:

```bash
npx tsx scripts/content-generation/generate-measure-commentary.ts --bwv 846 --type prelude
```

**Prerequisites**: You must provide harmonic analysis data. See the script for data format.

### Generate Curriculum Lessons

Generate structured lessons by domain:

```bash
npx tsx scripts/content-generation/generate-lessons.ts --domain harmony
```

Domains:
- `fundamentals`: Basic music reading and scales (6 lessons)
- `harmony`: Chords, progressions, cadences (15 lessons)
- `counterpoint`: Voice leading, two-voice writing (10 lessons)
- `fugue`: Fugue construction and techniques (12 lessons)
- `form`: Phrase structure, binary/ternary form (8 lessons)
- `advanced`: Chromaticism, complex counterpoint (8 lessons)

### Generate Feature Definitions

Generate searchable feature explanations:

```bash
npx tsx scripts/content-generation/generate-features.ts --category harmony
```

Categories:
- `harmony`: Cadences, sequences, modulations (20 features)
- `counterpoint`: Imitation, suspensions, voice leading (17 features)
- `fugue`: Subject, stretto, augmentation (13 features)
- `form`: Binary, ternary, phrase types (12 features)

## Output Structure

Generated content is saved to:

```
content/
├── glossary/
│   └── terms.json                  # All glossary terms
├── features/
│   ├── definitions.json            # All feature definitions
│   └── instances/
│       ├── harmony/
│       ├── counterpoint/
│       └── fugue/
├── pieces/
│   ├── introductions.json          # All 48 introductions
│   └── commentary/
│       ├── book1/
│       │   ├── bwv-846-prelude.json
│       │   ├── bwv-846-fugue.json
│       │   └── ...
│       └── book2/
└── curriculum/
    ├── structure.json              # Curriculum outline
    └── lessons/
        ├── fundamentals/
        ├── harmony/
        ├── counterpoint/
        ├── fugue/
        ├── form/
        └── advanced/
```

## Cost Tracking

### Real-time Tracking

The system tracks costs in real-time and saves to:

```
content/tracking/costs-YYYY-MM-DD.json
```

Each request records:
- Input/output tokens
- Cost breakdown
- Success/failure status
- Content type generated

### View Cost Summary

```bash
npx tsx scripts/content-generation/view-costs.ts
```

Example output:
```
📊 Generation Session Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Requests:     47
Success Rate:       97.9%
Total Input Tokens: 125,483
Total Output Tokens: 87,291
Avg Input Tokens:   2,670
Avg Output Tokens:  1,857
Total Cost:         $1.6847
Remaining Budget:   $98.32
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Cost Estimates

Before running large batches, estimate costs:

```bash
npx tsx scripts/content-generation/generate-piece-intros.ts --dry-run --book 1
```

Example:
```
💰 Cost Estimate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Items to generate:   24 (Book I)
Est. input tokens:   64,800 (2,700 per item)
Est. output tokens:  48,000 (2,000 per item)
Est. total cost:     $0.91
Current budget:      $100.00
Remaining after:     $99.09
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Error Handling

The framework includes robust error handling:

### Automatic Retry

Failed requests retry automatically (default: 3 attempts):
- Exponential backoff: 2s → 4s → 8s
- Retries on transient errors (rate limits, network issues)
- Skips on validation errors

### Validation

Generated content is validated:
- ✅ Valid JSON structure
- ✅ Required fields present
- ✅ Type checking
- ✅ Length constraints
- ✅ Cross-references exist

### Progress Saving

Progress is saved incrementally:
- Each successful generation writes to disk
- Resume from where you left off
- No duplicate generation

## Rate Limiting

Automatic rate limiting prevents API throttling:

- **Per-minute limit**: 5 requests (configurable)
- **Per-day limit**: 1000 requests (configurable)
- Automatic waiting when limits approached
- Clear progress indicators

## Best Practices

### 1. Generate in Order

Follow this sequence for consistency:

1. **Glossary Terms** (foundation vocabulary)
2. **Feature Definitions** (technique explanations)
3. **Piece Introductions** (overview before detail)
4. **Curriculum Lessons** (structured pedagogy)
5. **Measure Commentary** (detailed analysis)
6. **Feature Instances** (specific examples)

### 2. Review Early Outputs

Before bulk generation:
1. Generate 2-3 examples
2. Review quality and accuracy
3. Adjust prompts if needed
4. Then generate full batch

### 3. Batch Sizes

Recommended batch sizes:
- Piece introductions: 10-15 per session
- Curriculum lessons: 3-5 per session
- Measure commentary: 1 piece per session
- Feature definitions: 15-20 per session

### 4. Budget Management

Track your spending:
- Set realistic budget limits
- Monitor costs per content type
- Estimate before large batches
- Review cost tracking logs

## Troubleshooting

### "API key not found"

Set your environment variable:
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Or add to `.env` file.

### "Daily rate limit reached"

Wait 24 hours or increase `requestsPerDay` in `config.ts`.

### "Budget limit exceeded"

Increase `budgetLimit` in `config.ts` or wait for budget reset.

### Invalid JSON output

The system retries with stricter validation. If persistent:
1. Check the prompt template
2. Review examples in the spec
3. Adjust `temperature` in config (lower = more consistent)

### Missing harmonic analysis

For measure commentary, you must provide harmonic analysis. Use:
- Manual analysis
- music21 Python library
- Existing analytical resources

## Examples

### Generate Book I Introductions

```bash
npx tsx scripts/content-generation/generate-piece-intros.ts --book 1
```

Output:
```
🎼 Clavier Content Generation: Piece Introductions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Book: 1
Pieces: 24 (Preludes and Fugues)
Estimated cost: $0.91

✓ BWV 846 Prelude in C major (2,847 tokens, $0.038)
✓ BWV 846 Fugue in C major (2,913 tokens, $0.039)
✓ BWV 847 Prelude in C minor (2,765 tokens, $0.037)
...

✅ Generation complete! (24/24 successful)
📝 Output: content/pieces/introductions-book1.json
💰 Total cost: $0.89
```

### Generate Harmony Lessons

```bash
npx tsx scripts/content-generation/generate-lessons.ts --domain harmony
```

### Generate All Feature Definitions

```bash
npx tsx scripts/content-generation/generate-features.ts --all
```

## Reference

See the complete prompt engineering guide:
- `specs/clavier-content-generation-prompts.md`

For data formats and schemas:
- `prisma/schema.prisma`

## Estimated Timeline

Full content generation (all types):
- **Time**: 20-30 hours of active generation
- **Cost**: $50-$150 (depending on iterations)
- **Sessions**: 30-50 sessions @ 30-60 minutes each

Parallelizable work:
- Multiple domains can be generated simultaneously
- Different content types are independent
- Team members can work on different books

## Support

For issues or questions:
1. Check this README
2. Review spec file: `specs/clavier-content-generation-prompts.md`
3. Examine example outputs in `content/examples/`
4. Check cost tracking logs in `content/tracking/`
