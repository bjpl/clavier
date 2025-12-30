# Content Generation Setup Guide

Complete setup instructions for generating piece introductions using AI.

## Prerequisites

1. **Anthropic API Key**
   - Sign up at https://console.anthropic.com/
   - Create an API key
   - Budget: Estimated $2-3 for all 48 piece introductions

2. **Node.js 18+**
   - Already installed (verified)

3. **Dependencies**
   - `@anthropic-ai/sdk` - Already installed

## Setup Steps

### 1. Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

### 2. Verify Setup

Run the workflow checker:

```bash
npx tsx scripts/content-generation/run-generation.ts
```

This will:
- Check for .env file and API key
- Estimate costs for generation
- Run a dry-run to verify everything works

### 3. Generate Content

#### Option A: Generate All at Once (Recommended)

```bash
npx tsx scripts/content-generation/generate-piece-intros.ts
```

#### Option B: Generate by Book

```bash
# Book I only (24 pieces)
npx tsx scripts/content-generation/generate-piece-intros.ts --book 1

# Book II only (24 pieces)
npx tsx scripts/content-generation/generate-piece-intros.ts --book 2
```

#### Option C: Generate Specific Pieces

```bash
# Specific BWV numbers
npx tsx scripts/content-generation/generate-piece-intros.ts --bwv 846,847,848
```

### 4. Review Generated Content

After generation completes:

1. **Check JSON output**
   ```bash
   cat content/pieces/introductions.json | head -50
   ```

2. **Review Markdown format**
   ```bash
   cat content/pieces/introductions.md
   ```

3. **Validate quality**
   - Sample 5-10 random introductions
   - Check for:
     - Accurate musical descriptions
     - Appropriate difficulty levels
     - Complete prerequisite/concept lists
     - Word count (target: 250-350 words)

### 5. Save to Database

**TODO**: Implement database integration

Currently saves to JSON files. To integrate with database:

```typescript
// Add to generate-piece-intros.ts or create separate script
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

for (const intro of introductions) {
  const piece = await prisma.piece.findFirst({
    where: {
      bwvNumber: intro.bwv,
      type: intro.type.toUpperCase(),
    },
  });

  if (piece) {
    await prisma.piece.update({
      where: { id: piece.id },
      data: {
        metadata: {
          ...(piece.metadata as any || {}),
          introduction: intro.introduction,
        },
      },
    });
  }
}
```

## Cost Management

### Estimate Costs Before Running

```bash
npx tsx scripts/content-generation/generate-piece-intros.ts --dry-run
```

Expected output:
```
💰 Cost Estimate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Items to generate:   48
Est. input tokens:   129,600 (2,700 per item)
Est. output tokens:  96,000 (2,000 per item)
Est. total cost:     $1.83
Current budget:      $100.00
Remaining after:     $98.17
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Track Actual Costs

Costs are automatically tracked in:
```
content/tracking/costs-YYYY-MM-DD.json
```

View cost summary:
```bash
cat content/tracking/costs-*.json | jq '.totalCost'
```

### Budget Limits

Default limits in `scripts/content-generation/config.ts`:
- Budget limit: $100
- Requests per minute: 5
- Requests per day: 1000

To change:
```typescript
export const DEFAULT_CONFIG: GenerationConfig = {
  budgetLimit: 50, // Set to $50
  requestsPerMinute: 3, // Slower rate
  // ...
};
```

## Troubleshooting

### "API key not found"

**Solution:**
```bash
# Verify .env file exists
ls -la .env

# Check content
cat .env | grep ANTHROPIC

# Ensure format is correct
ANTHROPIC_API_KEY=sk-ant-xxxxx  # No quotes, no spaces
```

### "Rate limit exceeded"

**Solution:** Wait for rate limit window to reset (1 minute), or reduce `requestsPerMinute` in config.

### "Invalid JSON output"

**Solution:** The script automatically retries with stricter validation. If persistent:
1. Lower `temperature` in config (e.g., 0.5 instead of 0.7)
2. Check recent changes to prompt template
3. Review example outputs in specs

### Generation takes too long

**Expected time:**
- ~1.5 minutes per piece
- Total: ~70 minutes for all 48 pieces

**To speed up:**
- Generate in parallel batches (not recommended for API limits)
- Increase `requestsPerMinute` if your API tier allows

## Output Files

After successful generation:

```
content/
├── pieces/
│   ├── introductions.json       # Complete dataset (48 intros)
│   └── introductions.md         # Human-readable format
└── tracking/
    └── costs-2025-12-29.json   # Cost and token tracking
```

## Quality Assurance

### Validation Checklist

For each introduction, verify:

- [ ] **Accuracy**: Musical descriptions match the actual piece
- [ ] **Completeness**: All required fields present
- [ ] **Tone**: Warm, accessible, not condescending
- [ ] **Length**: 250-350 words (excluding metadata)
- [ ] **Terminology**: First use of terms defined inline
- [ ] **Prerequisites**: Realistic for target audience
- [ ] **Concepts**: Actually introduced in the piece

### Sample Review Process

1. Select 5 random pieces:
   ```bash
   shuf -n 5 content/pieces/introductions.json
   ```

2. For each piece:
   - Read introduction
   - Check against score (if available)
   - Verify difficulty level makes sense
   - Confirm prerequisites are appropriate

3. If quality issues found:
   - Regenerate specific pieces
   - Adjust prompts
   - Lower temperature for more consistency

## Next Steps

After piece introductions complete:

1. **Generate Feature Definitions**
   ```bash
   npx tsx scripts/content-generation/generate-features.ts
   ```

2. **Generate Curriculum Lessons**
   ```bash
   npx tsx scripts/content-generation/generate-lessons.ts --domain harmony
   ```

3. **Generate Measure Commentary** (most intensive)
   ```bash
   npx tsx scripts/content-generation/generate-measure-commentary.ts --bwv 846 --type prelude
   ```

## Reference

- **Prompt spec**: `specs/clavier-content-generation-prompts.md`
- **Config**: `scripts/content-generation/config.ts`
- **Generator**: `scripts/content-generation/generate-piece-intros.ts`
- **Workflow**: `scripts/content-generation/run-generation.ts`

## Support

If you encounter issues:

1. Check this guide
2. Review error messages in console
3. Examine `content/tracking/*.json` for request failures
4. Verify API key is valid and has credits
5. Check Anthropic status page: https://status.anthropic.com/
