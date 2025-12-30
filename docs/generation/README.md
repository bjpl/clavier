# Measure-by-Measure Commentary Generation System

Complete AI-powered content generation system for creating detailed musical analysis and educational commentary for Bach's Well-Tempered Clavier.

## Overview

This system generates comprehensive measure-by-measure commentary using Anthropic's Claude Sonnet 4.5, following the pedagogical approach outlined in `specs/clavier-content-generation-prompts.md`.

**Capabilities:**
- Generate 80-120 word commentaries per measure
- Include harmonic analysis, voice tracking, and terminology
- Batch process entire pieces with cost tracking
- Validate quality automatically
- Import directly to database

## Quick Links

- **[Quick Start Guide](./QUICK-START.md)** - Get started in 5 minutes
- **[Complete Guide](./MEASURE-COMMENTARY-GUIDE.md)** - Full documentation
- **[Prompt Specifications](../../specs/clavier-content-generation-prompts.md)** - Detailed prompts
- **[Framework README](../../scripts/content-generation/README.md)** - System architecture

## System Components

### 1. Core Generation Scripts

**Location:** `scripts/content-generation/`

```
generate-measure-commentary.ts   # Single piece generator
orchestrate-book1-commentary.ts  # Batch orchestration for Book I
validate-commentary-quality.ts   # Automated QA validation
import-commentary-to-db.ts       # Database import
export-commentary-markdown.ts    # Export for human review
config.ts                        # API config, rate limits, cost tracking
```

### 2. Input Requirements

**Harmonic Analysis Files**

Each piece requires a JSON analysis file:

**Location:** `content/analysis/bwv-{NUMBER}-{TYPE}-analysis.json`

**Contents:**
- Measure-by-measure Roman numeral analysis
- Chord symbols and functions
- Structural events (cadences, sequences, etc.)
- For fugues: subject entries, episodes, stretto

**Template:** `content/analysis/bwv-846-prelude-analysis.json`

### 3. Generated Outputs

**Commentary Files**

**Location:** `content/pieces/commentary/book1/`

**Format:** JSON with array of measure objects
- Harmonic data
- 80-120 word commentary
- Voice activity (fugues)
- Terminology definitions
- Connections to context
- Notable features
- Curriculum links

### 4. Quality Assurance

**Automated Validation:**
- JSON structure
- Required fields
- Commentary length
- Terminology consistency
- Cross-references

**Human Review:**
- 5% random sample
- Exported to markdown
- Review checklist provided

### 5. Database Integration

**Import Process:**
- Creates `Annotation` records
- Links to `Piece` and `Measure`
- Type: `HARMONY`
- Source: `GENERATED`
- Verified: `true`

## Usage

### Single Piece

```bash
npm run content:commentary -- --bwv 846 --type prelude
```

### Book I Complete

```bash
# Estimate cost first
npm run content:commentary:dryrun

# Generate all
npm run content:commentary:book1
```

### Validation & Import

```bash
# Validate quality
npm run content:validate

# Review sample
cat content/tracking/human-review-sample.md

# Import to database
npm run content:import -- --all
```

## Features

### Cost Management
- Real-time token tracking
- Budget limits ($100 default)
- Cost estimates before generation
- Per-piece cost breakdown

### Progress Tracking
- Automatic progress saving
- Resume on interruption
- Skip completed pieces
- Detailed error logging

### Quality Control
- Automated validation
- Random sampling (5%)
- Markdown export for review
- Terminology consistency checks

### Rate Limiting
- 5 requests/minute (default)
- 1000 requests/day (default)
- Automatic waiting
- Configurable limits

## Configuration

**File:** `scripts/content-generation/config.ts`

```typescript
{
  model: 'claude-sonnet-4-5-20250929',
  maxTokens: 8000,
  temperature: 0.7,
  budgetLimit: 100,
  requestsPerMinute: 5,
  requestsPerDay: 1000,
  batchSize: 10,
  retryAttempts: 3
}
```

## Output Structure

```
content/
├── analysis/                      # Input: Harmonic analysis files
│   ├── bwv-846-prelude-analysis.json
│   └── ... (48 files for Book I)
│
├── pieces/
│   └── commentary/
│       └── book1/                # Output: Generated commentary
│           ├── bwv-846-prelude.json
│           └── ... (48 files)
│
└── tracking/                     # Tracking & reports
    ├── book1-progress.json       # Generation progress
    ├── costs-book1-commentary.json  # Cost tracking
    ├── quality-report.json       # QA results
    └── human-review-sample.md    # 5% sample

docs/
└── generation/
    └── review-markdown/          # Readable markdown exports
        ├── bwv-846-prelude.md
        └── ...
```

## Workflow Example

```bash
# 1. Create analysis files (manual)
cp content/analysis/bwv-846-prelude-analysis.json \
   content/analysis/bwv-847-prelude-analysis.json
# Edit with correct data

# 2. Generate commentary
npm run content:commentary -- --bwv 847 --type prelude

# 3. Validate
npm run content:validate

# 4. Review
cat docs/generation/review-markdown/bwv-847-prelude.md

# 5. Import to database
npm run content:import -- --bwv 847 --type prelude
```

## Performance Metrics

**Book I Generation:**

| Metric | Value |
|--------|-------|
| Total pieces | 48 (24 preludes + 24 fugues) |
| Total measures | ~1,680 |
| Avg words per measure | 80-120 |
| Total words | ~168,000 |
| Estimated cost | $50-80 |
| Generation time | 10-15 hours |
| API calls | ~170-200 |

**Per Piece:**
- Avg measures: 35
- Avg cost: $1.50
- Avg time: 15-20 minutes
- Batch size: 10 measures

## Error Handling

### Automatic Retry
- 3 attempts per request
- Exponential backoff
- Retries on transient errors

### Progress Persistence
- Saves after each piece
- Resume from last successful
- Skip completed pieces

### Validation
- Pre-generation checks
- Post-generation validation
- Quality scoring

## Advanced Usage

### Custom Batch Size

```bash
npm run content:commentary -- \
  --bwv 846 \
  --type prelude \
  --batch-size 15
```

### Parallel Generation

```bash
# Terminal 1: Preludes
npm run content:commentary:book1:preludes

# Terminal 2: Fugues
npm run content:commentary:book1:fugues
```

### Specific BWV Range

Edit `orchestrate-book1-commentary.ts`:

```typescript
const pieces = BOOK1_PIECES.filter(p =>
  p.bwv >= 850 && p.bwv <= 859
);
```

## Dependencies

**Required:**
- `@anthropic-ai/sdk` - Claude API client
- `@prisma/client` - Database ORM
- Node.js ≥18.0.0

**Environment:**
- `ANTHROPIC_API_KEY` - API key from Anthropic
- `DATABASE_URL` - PostgreSQL connection

## Next Steps

1. **Generate Book I** (~$70, 10-15 hours)
2. **Generate Book II** (~$70, 10-15 hours)
3. **Feature Instances** - Specific technique examples
4. **Curriculum Lessons** - Pedagogical content
5. **Glossary Terms** - Terminology reference

## Troubleshooting

**Common Issues:**

1. **"Analysis file not found"**
   - Create file using template
   - Check file naming: `bwv-{NUMBER}-{TYPE}-analysis.json`

2. **"Budget limit exceeded"**
   - Increase in `config.ts`
   - Check actual vs estimated costs

3. **Validation errors**
   - Review quality report
   - Check prompt specifications
   - Verify analysis data accuracy

4. **API rate limits**
   - Increase wait time in config
   - Reduce batch size
   - Check Anthropic tier limits

## Support Resources

**Documentation:**
- [Quick Start](./QUICK-START.md)
- [Complete Guide](./MEASURE-COMMENTARY-GUIDE.md)
- [Prompt Specs](../../specs/clavier-content-generation-prompts.md)

**Code:**
- Scripts: `scripts/content-generation/`
- Templates: `content/analysis/bwv-846-prelude-analysis.json`
- Schema: `prisma/schema.prisma`

**Tracking:**
- Progress: `content/tracking/book1-progress.json`
- Costs: `content/tracking/costs-book1-commentary.json`
- Quality: `content/tracking/quality-report.json`

---

## Getting Started

**First time user?** Start here:

1. Read [Quick Start Guide](./QUICK-START.md)
2. Set up API key in `.env`
3. Run cost estimate: `npm run content:commentary:dryrun`
4. Generate test piece: `npm run content:commentary -- --bwv 846 --type prelude`
5. Review output and proceed to full generation

**Questions?** Check the [Complete Guide](./MEASURE-COMMENTARY-GUIDE.md) for detailed documentation.

---

*Last Updated: December 29, 2025*
*System Version: 1.0.0*
