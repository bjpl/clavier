# Measure-by-Measure Commentary Generation Guide

## Overview

This guide explains how to generate comprehensive measure-by-measure commentary for the Well-Tempered Clavier Book I using the automated content generation system.

**Target Output:** ~1,680 measure commentaries (~168,000 words) for Book I
**Estimated Cost:** $50-80
**Time Required:** 10-15 hours of active generation

## Prerequisites

### 1. Environment Setup

```bash
# Install dependencies
npm install @anthropic-ai/sdk

# Set API key
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env

# Generate Prisma client
npm run db:generate
```

### 2. Harmonic Analysis Data

Each piece requires a harmonic analysis file:

**Location:** `content/analysis/bwv-{NUMBER}-{TYPE}-analysis.json`

**Format:**
```json
{
  "bwv": 846,
  "type": "prelude",
  "key": "C major",
  "timeSignature": "4/4",
  "totalMeasures": 35,
  "harmonicAnalysis": [
    {
      "measure": 1,
      "romanNumeral": "I",
      "chord": "C",
      "function": "tonic",
      "inversion": "root"
    }
  ],
  "structuralEvents": [
    {
      "measureStart": 1,
      "measureEnd": 8,
      "event": "Opening section",
      "description": "Establishes arpeggiated pattern"
    }
  ]
}
```

**Creating Analysis Files:**

Option 1: Manual analysis (recommended for accuracy)
Option 2: Use music21 Python library for automated analysis
Option 3: Import from existing analytical resources

Example template provided in: `content/analysis/bwv-846-prelude-analysis.json`

## Generation Workflow

### Phase 1: Single Piece Test

Test the system with one piece before bulk generation:

```bash
# Generate commentary for BWV 846 Prelude
npx tsx scripts/content-generation/generate-measure-commentary.ts \
  --bwv 846 \
  --type prelude \
  --batch-size 10
```

**Expected output:**
- File: `content/pieces/commentary/bwv-846-prelude.json`
- ~35 measures with detailed commentary
- Cost: ~$0.50-1.00

**Review checklist:**
- [ ] Harmony analysis is accurate
- [ ] Commentary is clear and accessible
- [ ] Terminology is properly defined
- [ ] Connections flow naturally
- [ ] Length is appropriate (80-120 words per measure)

### Phase 2: Book I Preludes

Generate all 24 preludes:

```bash
# Dry run to estimate cost
npx tsx scripts/content-generation/orchestrate-book1-commentary.ts \
  --phase preludes \
  --dry-run

# Generate all preludes
npx tsx scripts/content-generation/orchestrate-book1-commentary.ts \
  --phase preludes \
  --batch-size 10
```

**Features:**
- Automatic progress tracking
- Resume on error
- Real-time cost monitoring
- Saves after each piece

**Duration:** ~3-5 hours
**Cost:** ~$25-35

### Phase 3: Book I Fugues

Generate all 24 fugues:

```bash
npx tsx scripts/content-generation/orchestrate-book1-commentary.ts \
  --phase fugues \
  --batch-size 10
```

**Additional analysis required for fugues:**
- Subject entries and voice tracking
- Episode identification
- Stretto passages
- Augmentation/diminution/inversion instances

**Duration:** ~4-6 hours
**Cost:** ~$30-45

### Complete Book I Generation

Generate everything in one run:

```bash
npx tsx scripts/content-generation/orchestrate-book1-commentary.ts
```

## Quality Assurance

### Automated Validation

Run automated quality checks:

```bash
npx tsx scripts/content-generation/validate-commentary-quality.ts
```

**Checks performed:**
- JSON structure validation
- Required field presence
- Commentary length (should be 80-120 words)
- Terminology consistency
- Cross-reference accuracy
- Measure numbering continuity

**Output:**
- `content/tracking/quality-report.json` - Detailed metrics
- `content/tracking/human-review-sample.md` - 5% random sample for review

### Human Review

Review the random sample (5% of measures):

```bash
# Export all commentary to readable markdown
npx tsx scripts/content-generation/export-commentary-markdown.ts
```

**Review in:** `docs/generation/review-markdown/`

**Check for:**
- Technical accuracy
- Clarity for target audience
- Appropriate depth
- Natural language flow
- Terminology definitions

## Database Import

Import generated commentary into the database:

```bash
# Import all Book I commentary
npx tsx scripts/content-generation/import-commentary-to-db.ts --all

# Import specific piece
npx tsx scripts/content-generation/import-commentary-to-db.ts \
  --bwv 846 \
  --type prelude
```

**What happens:**
- Creates `Annotation` records for each measure
- Links to `Piece` and `Measure` records
- Sets `annotationType` to `HARMONY`
- Marks as `verified: true`
- Stores as `source: GENERATED`

## Cost Management

### Real-time Tracking

Costs are tracked automatically in:
`content/tracking/costs-book1-commentary.json`

**Tracked metrics:**
- Input/output tokens per request
- Cost per piece
- Running total
- Success/failure rates

### Budget Controls

Set budget limits in `scripts/content-generation/config.ts`:

```typescript
budgetLimit: 100, // Maximum spend in USD
requestsPerMinute: 5, // Rate limit
requestsPerDay: 1000 // Daily limit
```

System automatically:
- Warns when approaching budget limit
- Stops generation if limit exceeded
- Enforces rate limits
- Retries failed requests

### View Cost Summary

```bash
npx tsx scripts/content-generation/view-costs.ts
```

## Troubleshooting

### "Analysis file not found"

Create the analysis file for the piece:

```bash
# Use the template
cp content/analysis/bwv-846-prelude-analysis.json \
   content/analysis/bwv-847-prelude-analysis.json

# Edit with correct data
```

### "Budget limit exceeded"

Increase budget or wait for reset:

```typescript
// In config.ts
budgetLimit: 150 // Increase as needed
```

### Validation Errors

Check the quality report:

```bash
cat content/tracking/quality-report.json
```

Common issues:
- Commentary too short: LLM not following prompt
- Missing connections: Review prompt template
- JSON parsing errors: Check for malformed output

### Failed Generations

Resume from last successful piece:

```bash
# Progress is automatically saved
# Just re-run the orchestration script
npx tsx scripts/content-generation/orchestrate-book1-commentary.ts --phase preludes
```

## Output Files

### Generated Commentary

**Location:** `content/pieces/commentary/book1/`

```
bwv-846-prelude.json
bwv-846-fugue.json
bwv-847-prelude.json
bwv-847-fugue.json
...
```

### Tracking Files

**Location:** `content/tracking/`

```
costs-book1-commentary.json     # Cost tracking
book1-progress.json            # Generation progress
quality-report.json            # Validation results
human-review-sample.md         # Random sample for review
```

### Review Markdown

**Location:** `docs/generation/review-markdown/`

```
bwv-846-prelude.md
bwv-846-fugue.md
...
```

## Best Practices

### 1. Generate in Order

1. Create all analysis files first
2. Test with one piece
3. Generate preludes
4. Generate fugues
5. Run validation
6. Human review sample
7. Import to database

### 2. Monitor Progress

Check progress regularly:

```bash
cat content/tracking/book1-progress.json
```

### 3. Backup Generated Content

```bash
# Create backup before database import
tar -czf commentary-backup-$(date +%Y%m%d).tar.gz \
  content/pieces/commentary/
```

### 4. Batch Size Optimization

- Smaller batches (5-8 measures): More API calls, but easier recovery
- Larger batches (10-15 measures): Fewer API calls, but longer retries

Recommended: 10 measures per batch

### 5. Error Recovery

If generation fails mid-piece:
1. Check error in tracking/book1-progress.json
2. Fix issue (analysis data, API key, etc.)
3. Re-run orchestration (skips completed pieces)

## Timeline Estimate

**Full Book I Generation:**

| Phase | Duration | Cost | Output |
|-------|----------|------|--------|
| Setup & testing | 1 hour | $1-2 | 1 piece |
| Preludes (24) | 3-5 hours | $25-35 | ~720 measures |
| Fugues (24) | 4-6 hours | $30-45 | ~960 measures |
| Validation | 30 min | - | Quality report |
| Human review | 2-3 hours | - | Review notes |
| Database import | 15 min | - | DB records |
| **Total** | **10-15 hours** | **$50-80** | **~1,680 measures** |

## Advanced Options

### Custom Batch Sizes

```bash
npx tsx scripts/content-generation/orchestrate-book1-commentary.ts \
  --phase preludes \
  --batch-size 15
```

### Resume Specific BWV Range

Edit `orchestrate-book1-commentary.ts` to filter:

```typescript
const preludes = BOOK1_PIECES
  .filter(p => p.type === 'prelude')
  .filter(p => p.bwv >= 850 && p.bwv <= 859); // D major through F# minor
```

### Parallel Generation

Run preludes and fugues in parallel (two terminals):

```bash
# Terminal 1
npx tsx scripts/content-generation/orchestrate-book1-commentary.ts --phase preludes

# Terminal 2
npx tsx scripts/content-generation/orchestrate-book1-commentary.ts --phase fugues
```

Note: Requires separate API key rate limits or increased budget.

## Support

**For issues:**
1. Check this guide
2. Review `scripts/content-generation/README.md`
3. Check prompt specifications in `specs/clavier-content-generation-prompts.md`
4. Examine tracking logs in `content/tracking/`

**Common references:**
- Analysis file format: `content/analysis/bwv-846-prelude-analysis.json`
- Database schema: `prisma/schema.prisma`
- System prompt: `scripts/content-generation/config.ts`

---

*Last Updated: December 29, 2025*
