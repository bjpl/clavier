# Content Generation Execution Guide

Step-by-step guide to generate all 48 piece introductions.

## Quick Start

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 2. Verify setup and estimate costs
npx tsx scripts/content-generation/run-generation.ts

# 3. Generate all introductions
npx tsx scripts/content-generation/generate-piece-intros.ts

# 4. Import to database
npx tsx scripts/content-generation/import-to-database.ts

# 5. Verify results
npx tsx scripts/content-generation/import-to-database.ts verify
```

## Detailed Execution Steps

### Step 1: Environment Setup

**Action:** Configure your Anthropic API key

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor

# Add your API key (replace with your actual key):
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
```

**Verification:**
```bash
cat .env | grep ANTHROPIC_API_KEY
```

Should show: `ANTHROPIC_API_KEY=sk-ant-api03-...`

---

### Step 2: Cost Estimation (Dry Run)

**Action:** Estimate costs before generating

```bash
npx tsx scripts/content-generation/generate-piece-intros.ts --dry-run
```

**Expected Output:**
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

**Decision Point:**
- Cost is ~$2-3 for all 48 pieces
- Generation time: ~70 minutes total
- Proceed if acceptable

---

### Step 3: Generate Introductions

**Option A: Generate All at Once (Recommended)**

```bash
npx tsx scripts/content-generation/generate-piece-intros.ts
```

**Option B: Generate by Book (Safer for testing)**

```bash
# Start with Book I (24 pieces, ~$1, ~35 min)
npx tsx scripts/content-generation/generate-piece-intros.ts --book 1

# Then Book II (24 pieces, ~$1, ~35 min)
npx tsx scripts/content-generation/generate-piece-intros.ts --book 2
```

**Option C: Test with Small Sample**

```bash
# Just C major pair (BWV 846 prelude + fugue)
npx tsx scripts/content-generation/generate-piece-intros.ts --bwv 846

# First 4 pieces
npx tsx scripts/content-generation/generate-piece-intros.ts --bwv 846,847
```

**During Generation:**

You'll see progress like:
```
🎼 Generating 48 piece introductions...

[1/48] C major prelude
⏳ Generating: BWV 846 prelude in C major...
✓ BWV 846 prelude (2,847 tokens)

[2/48] C major fugue
⏳ Generating: BWV 846 fugue in C major...
✓ BWV 846 fugue (2,913 tokens)

...
```

**Expected Timeline:**
- ~1.5 minutes per piece
- Progress saved incrementally
- Can resume if interrupted

---

### Step 4: Quality Validation

**Action:** Review generated content

```bash
# View JSON output
cat content/pieces/introductions.json | jq '.[0]'

# View Markdown output
head -100 content/pieces/introductions.md

# Check specific piece
cat content/pieces/introductions.json | jq '.[] | select(.bwv == 846 and .type == "prelude")'
```

**Quality Checklist:**

Review 5-10 random pieces for:
- [ ] Accurate musical descriptions
- [ ] Appropriate difficulty levels (1-5 scale makes sense)
- [ ] Realistic study time estimates
- [ ] Complete prerequisite and concept lists
- [ ] Proper word count (250-350 words)
- [ ] No placeholder text or errors

**Sample Pieces to Review:**
```bash
# Get 5 random pieces
cat content/pieces/introductions.json | jq -r '.[] | select(.bwv == 846 or .bwv == 849 or .bwv == 855 or .bwv == 865 or .bwv == 869) | "\n=== BWV \(.bwv) \(.type) ===\n\(.introduction.opening_hook)\n"'
```

**If Issues Found:**
```bash
# Regenerate specific piece
npx tsx scripts/content-generation/generate-piece-intros.ts --bwv 846

# Adjust temperature for more/less creativity
# Edit config.ts:
temperature: 0.5  # More consistent
temperature: 0.7  # More creative
temperature: 1.0  # More varied
```

---

### Step 5: Import to Database

**Action:** Update Piece records with generated introductions

```bash
npx tsx scripts/content-generation/import-to-database.ts
```

**Expected Output:**
```
💾 Importing piece introductions to database...

Found 48 introductions to import

✓ Added: BWV 846 prelude (C major)
✓ Added: BWV 846 fugue (C major)
✓ Added: BWV 847 prelude (C minor)
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  IMPORT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total introductions: 48
Successfully added:  48
Updated existing:    0
Pieces not found:    0
Errors:              0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Import completed successfully!
```

**If Pieces Not Found:**
```bash
# Seed the database first
npm run db:seed

# Then retry import
npx tsx scripts/content-generation/import-to-database.ts
```

---

### Step 6: Verify Database Import

**Action:** Confirm data is in database

```bash
npx tsx scripts/content-generation/import-to-database.ts verify
```

**Expected Output:**
```
🔍 Verifying imported introductions...

Pieces with introductions: 48/48
  Book I:  24/24
  Book II: 24/24

📋 Sample verification (first 3 pieces):

  BWV 846 PRELUDE:
    - Opening hook: This prelude's gentle arpeggiated pattern has become...
    - Notable features: 3 items
    - Difficulty: 1/5
    - Study time: 20 min

  ...

✅ Verification complete!
```

---

### Step 7: Generate Reports

**Action:** Create final documentation

```bash
# Export Markdown from database
npx tsx scripts/content-generation/import-to-database.ts export

# View cost report
cat content/tracking/costs-*.json | jq '{
  totalRequests,
  totalCost,
  totalInputTokens,
  totalOutputTokens,
  successRate: (.requests | map(select(.success)) | length / (.requests | length))
}'
```

**Create Generation Log:**

Add entry to `docs/CONTENT_GENERATION_LOG.md`:

```markdown
## Piece Introductions - 2025-12-29

**Status:** ✅ Completed

**Results:**
- Generated: 48/48 introductions
- Total cost: $1.87
- Total tokens: ~230,000
- Time: 72 minutes
- Success rate: 100%

**Quality Metrics:**
- Average word count: 298 words
- Difficulty distribution: Balanced across 1-5 scale
- All pieces have complete metadata

**Files:**
- `content/pieces/introductions.json` - Complete dataset
- `content/pieces/introductions.md` - Human-readable
- `content/tracking/costs-2025-12-29.json` - Cost tracking

**Next Steps:**
- Begin feature definitions generation
- Start curriculum lessons (harmony domain)
```

---

## Troubleshooting

### Generation Fails Midway

**Cause:** Rate limit or network issue

**Solution:**
```bash
# Generation auto-saves progress
# Just re-run the same command
npx tsx scripts/content-generation/generate-piece-intros.ts

# It will skip already-generated pieces
```

### "Budget limit exceeded"

**Cause:** Hit $100 default budget limit

**Solution:**
```bash
# Edit scripts/content-generation/config.ts
budgetLimit: 200,  # Increase to $200

# Or reset tracking file
rm content/tracking/costs-*.json
```

### Invalid JSON Errors

**Cause:** AI output parsing issues

**Solution:**
```bash
# Retry with lower temperature
# Edit config.ts:
temperature: 0.5,  # More consistent output

# Or retry specific pieces
npx tsx scripts/content-generation/generate-piece-intros.ts --bwv 846
```

### Database Import Fails

**Cause:** Pieces not in database

**Solution:**
```bash
# Seed database first
npm run db:seed

# Check database has pieces
npx prisma studio
# Navigate to Piece table, verify 48 pieces exist

# Retry import
npx tsx scripts/content-generation/import-to-database.ts
```

---

## Next Steps

After piece introductions complete:

### 1. Feature Definitions (62 features)

```bash
npx tsx scripts/content-generation/generate-features.ts --category harmony
npx tsx scripts/content-generation/generate-features.ts --category counterpoint
npx tsx scripts/content-generation/generate-features.ts --category fugue
npx tsx scripts/content-generation/generate-features.ts --category form
```

**Estimated:** $5, 3 hours

### 2. Curriculum Lessons (59 lessons)

```bash
npx tsx scripts/content-generation/generate-lessons.ts --domain fundamentals
npx tsx scripts/content-generation/generate-lessons.ts --domain harmony
npx tsx scripts/content-generation/generate-lessons.ts --domain counterpoint
npx tsx scripts/content-generation/generate-lessons.ts --domain fugue
npx tsx scripts/content-generation/generate-lessons.ts --domain form
npx tsx scripts/content-generation/generate-lessons.ts --domain advanced
```

**Estimated:** $30, 10 hours

### 3. Measure Commentary (3,000+ measures)

```bash
# Start with one piece
npx tsx scripts/content-generation/generate-measure-commentary.ts --bwv 846 --type prelude

# Then scale up by book/key
```

**Estimated:** $100-150, 40+ hours

---

## Cost Summary

| Content Type | Items | Est. Cost | Est. Time |
|--------------|-------|-----------|-----------|
| Piece Introductions | 48 | $2-3 | 1.5 hrs |
| Feature Definitions | 62 | $5-8 | 3 hrs |
| Curriculum Lessons | 59 | $25-35 | 8 hrs |
| Measure Commentary | 3000+ | $100-150 | 40 hrs |
| **TOTAL** | **~3200** | **$130-195** | **~52 hrs** |

---

## Files Reference

```
scripts/content-generation/
├── config.ts                      # Configuration
├── generate-piece-intros.ts       # Main generator
├── import-to-database.ts          # Database import
├── run-generation.ts              # Workflow orchestration
└── README.md                      # Framework docs

content/
├── pieces/
│   ├── introductions.json         # Generated output
│   ├── introductions.md           # Markdown format
│   └── introductions-from-db.md   # Exported from DB
└── tracking/
    └── costs-YYYY-MM-DD.json      # Cost tracking

docs/
├── CONTENT_GENERATION_SETUP.md    # Setup guide (this file)
└── CONTENT_GENERATION_LOG.md      # Generation log

specs/
└── clavier-content-generation-prompts.md  # Prompt templates
```
