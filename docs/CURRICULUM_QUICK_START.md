# Curriculum Generation Quick Start

## TL;DR - Generate Lessons Now

```bash
# Make sure ANTHROPIC_API_KEY is set
export ANTHROPIC_API_KEY="your-key-here"

# Generate Harmonic Fundamentals (10 lessons, ~$3-5)
npx tsx scripts/content-generation/generate-complete-curriculum.ts --domain harmony

# Generate Voice Leading (8 lessons, ~$2-4)
npx tsx scripts/content-generation/generate-complete-curriculum.ts --domain voice-leading

# Generate Fugal Technique (12 lessons, ~$3-5)
npx tsx scripts/content-generation/generate-complete-curriculum.ts --domain fugue

# Or generate all 30 lessons at once (~$8-12)
npx tsx scripts/content-generation/generate-complete-curriculum.ts
```

## Prerequisites

### 1. Environment Setup

```bash
# .env file
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Verify Setup

```bash
# Check that config loads properly
npx tsx scripts/content-generation/config.ts
```

## Step-by-Step Generation

### Step 1: Export Specifications (Optional)

```bash
npx tsx scripts/content-generation/generate-complete-curriculum.ts --export-only
```

This creates `content/curriculum/lesson-specifications.json` with all 30 lesson specs.

### Step 2: Generate One Domain

```bash
# Start with Harmonic Fundamentals (10 lessons)
npx tsx scripts/content-generation/generate-complete-curriculum.ts --domain harmony
```

**Expected output**:
```
====================================================
GENERATING DOMAIN: HARMONY
====================================================
Lessons in domain: 10
====================================================

⏳ Generating: Perfect and Imperfect Consonances...
✓ Perfect and Imperfect Consonances (4,823 tokens)
   → Saved to: lessons/Harmonic Fundamentals/harm-fund-001-intervals.json

⏳ Generating: Major and Minor Triads...
✓ Major and Minor Triads (4,612 tokens)
   → Saved to: lessons/Harmonic Fundamentals/harm-fund-002-triads.json

[... continues for all 10 lessons ...]

✓ Generated 10 of 10 lessons

📊 Generation Session Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Requests:     10
Success Rate:       100.0%
Total Input Tokens: 18,432
Total Output Tokens: 47,856
Total Cost:         $0.7732
Remaining Budget:   $99.23
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 3: Verify Output

```bash
# Check that files were created
ls -la content/curriculum/lessons/Harmonic\ Fundamentals/

# View a sample lesson
cat content/curriculum/lessons/Harmonic\ Fundamentals/harm-fund-001-intervals.json | jq '.sections[0]'
```

### Step 4: Generate Remaining Domains

```bash
# Voice Leading (8 lessons, ~10 minutes)
npx tsx scripts/content-generation/generate-complete-curriculum.ts --domain voice-leading

# Fugal Technique (12 lessons, ~15 minutes)
npx tsx scripts/content-generation/generate-complete-curriculum.ts --domain fugue
```

### Step 5: Review Cost Summary

```bash
# Check tracking file
cat content/tracking/costs-$(date +%Y-%m-%d).json | jq '.totalCost'
```

## Generated Content Structure

Each lesson JSON file contains:

```json
{
  "lesson_id": "harm-fund-001-intervals",
  "title": "Perfect and Imperfect Consonances",
  "domain": "Harmonic Fundamentals",
  "unit": "Intervals and Triads",
  "module": "Interval Recognition",
  "learning_objectives": [...],
  "estimated_time_minutes": 20,
  "sections": [
    {
      "section_id": "intro",
      "section_type": "introduction",
      "title": "Introduction",
      "content": "...", // Markdown
      "narration_text": "..." // TTS-optimized
    },
    {
      "section_type": "explanation",
      "content": "...",
      "key_points": [...]
    },
    {
      "section_type": "guided_example",
      "piece_reference": {
        "bwv": 846,
        "measure_start": 1,
        "measure_end": 4
      },
      "walkthrough": "...",
      "annotations": [...],
      "listening_prompts": [...]
    },
    {
      "section_type": "additional_examples",
      "examples": [...]
    },
    {
      "section_type": "summary",
      "key_takeaways": [...],
      "terminology": [...]
    }
  ],
  "explorer_links": [...],
  "next_steps": "..."
}
```

## Import to Database

Once lessons are generated, import them:

```bash
# Create import script
npx tsx scripts/content-generation/import-lessons-to-db.ts
```

This will:
1. Create Domain records
2. Create Unit records
3. Create Module records
4. Create Lesson records with full content
5. Link prerequisites
6. Add learning objectives

## Troubleshooting

### Issue: API Key Not Found

```bash
Error: API key not found
```

**Solution**:
```bash
export ANTHROPIC_API_KEY="your-key-here"
# or add to .env file
```

### Issue: Rate Limit Exceeded

```bash
⏳ Rate limit: waiting 47s...
```

**Solution**: This is normal. The system automatically waits and retries.

### Issue: Generation Failed

```bash
✗ Attempt 1/3 failed: Unexpected response type
```

**Solution**: The system retries automatically. If all attempts fail, the lesson is skipped.

### Issue: Budget Exceeded

```bash
⚠️  Budget limit exceeded! Spent $101.23 of $100.00 budget.
```

**Solution**: Increase budget in config:
```typescript
// scripts/content-generation/config.ts
budgetLimit: 200 // Increase to $200
```

## Cost Estimation

Based on Claude Sonnet 4.5 pricing:

| Domain | Lessons | Estimated Cost | Time |
|--------|---------|----------------|------|
| Harmonic Fundamentals | 10 | $2.50-$3.50 | ~12 min |
| Voice Leading | 8 | $2.00-$3.00 | ~10 min |
| Fugal Technique | 12 | $3.00-$4.00 | ~15 min |
| **Total (30 lessons)** | **30** | **$7.50-$10.50** | **~37 min** |

**Complete curriculum (54 lessons)**: $15-25, ~60-90 minutes

## Quality Checks

After generation, verify:

1. **All sections present**:
```bash
cat lesson.json | jq '.sections | length'
# Should output 5
```

2. **Valid BWV references**:
```bash
cat lesson.json | jq '.sections[] | select(.piece_reference) | .piece_reference.bwv'
```

3. **Learning objectives**:
```bash
cat lesson.json | jq '.learning_objectives | length'
# Should be 4-6
```

4. **Word count** (approximate):
```bash
cat lesson.json | jq '.sections[].content' | wc -w
# Should be ~900-1000 total
```

## Next Steps After Generation

1. **Review generated content** for quality and accuracy
2. **Import to database** using Prisma
3. **Create UI components** for lesson display
4. **Implement progress tracking**
5. **Add interactive features** (score highlighting, playback)

## File Locations

```
clavier/
  scripts/
    content-generation/
      generate-complete-curriculum.ts  # Main script
      config.ts                        # Configuration
  content/
    curriculum/
      lessons/                         # Generated lessons
        Harmonic Fundamentals/
        Voice Leading/
        Fugal Technique/
      lesson-specifications.json       # All specs
    tracking/
      costs-YYYY-MM-DD.json           # Cost tracking
  docs/
    curriculum-generation-guide.md    # Full documentation
    curriculum-generation-summary.md  # Summary
    CURRICULUM_QUICK_START.md        # This file
```

## Support

For issues or questions:
1. Check `docs/curriculum-generation-guide.md` for detailed documentation
2. Review `scripts/content-generation/config.ts` for configuration options
3. Examine cost tracking file for budget monitoring

---

**Ready to generate?**

```bash
npx tsx scripts/content-generation/generate-complete-curriculum.ts --domain harmony
```

Sit back and watch 10 comprehensive music theory lessons get generated in ~12 minutes for ~$3!
