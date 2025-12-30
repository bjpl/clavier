# Quick Start: WTC Book I Measure Commentary Generation

Complete guide to generating ~1,680 measure-by-measure commentaries for Well-Tempered Clavier Book I.

## Prerequisites (5 minutes)

```bash
# 1. Set up API key
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> .env

# 2. Verify dependencies
npm install

# 3. Ensure database is set up
npm run db:generate
npm run db:push
```

## Option 1: Full Automated Generation (10-15 hours, $50-80)

**Complete Book I in one command:**

```bash
npm run content:commentary:book1
```

This will:
- Generate all 24 preludes (~720 measures)
- Generate all 24 fugues (~960 measures)
- Save progress automatically
- Track costs in real-time
- Resume if interrupted

**Before running:**
```bash
# Check cost estimate
npm run content:commentary:dryrun
```

## Option 2: Phase-by-Phase Generation (Recommended)

### Step 1: Test with Single Piece (5 minutes, ~$1)

```bash
# Generate BWV 846 Prelude only
npm run content:commentary -- --bwv 846 --type prelude
```

**Review output:** `content/pieces/commentary/bwv-846-prelude.json`

### Step 2: Generate Preludes (3-5 hours, ~$30)

```bash
npm run content:commentary:book1:preludes
```

### Step 3: Generate Fugues (4-6 hours, ~$40)

```bash
npm run content:commentary:book1:fugues
```

## Quick Validation & Import

```bash
# 1. Validate quality
npm run content:validate

# 2. Review sample (5% random)
cat content/tracking/human-review-sample.md

# 3. Export to markdown for review
npm run content:export:markdown

# 4. Import to database
npm run content:import -- --all
```

## Monitoring Progress

**Real-time progress:**
```bash
cat content/tracking/book1-progress.json
```

**Cost tracking:**
```bash
cat content/tracking/costs-book1-commentary.json
```

## Required: Harmonic Analysis Files

Before generation, you need analysis files for each piece:

**Location:** `content/analysis/bwv-{NUMBER}-{TYPE}-analysis.json`

**Template provided:** `content/analysis/bwv-846-prelude-analysis.json`

**Create for each piece:**
```bash
# Copy template
cp content/analysis/bwv-846-prelude-analysis.json \
   content/analysis/bwv-847-prelude-analysis.json

# Edit with correct harmonic data
vim content/analysis/bwv-847-prelude-analysis.json
```

## Troubleshooting

**"Analysis file not found"**
- Create analysis file using template
- See `content/analysis/bwv-846-prelude-analysis.json`

**"Budget limit exceeded"**
- Increase limit in `scripts/content-generation/config.ts`
- Default is $100

**Generation interrupted**
- Just re-run the command
- Progress is saved automatically
- Completed pieces are skipped

## Output Files

```
content/
├── pieces/
│   └── commentary/
│       └── book1/
│           ├── bwv-846-prelude.json
│           ├── bwv-846-fugue.json
│           └── ... (48 files total)
├── tracking/
│   ├── book1-progress.json
│   ├── costs-book1-commentary.json
│   ├── quality-report.json
│   └── human-review-sample.md
└── analysis/
    ├── bwv-846-prelude-analysis.json
    └── ... (48 files needed)

docs/
└── generation/
    └── review-markdown/
        ├── bwv-846-prelude.md
        └── ... (48 markdown files)
```

## NPM Scripts Reference

```bash
# Single piece generation
npm run content:commentary -- --bwv 846 --type prelude

# Book I complete
npm run content:commentary:book1

# Preludes only
npm run content:commentary:book1:preludes

# Fugues only
npm run content:commentary:book1:fugues

# Cost estimate
npm run content:commentary:dryrun

# Quality validation
npm run content:validate

# Database import
npm run content:import -- --all

# Export to markdown
npm run content:export:markdown
```

## Typical Workflow

```bash
# 1. Create analysis files (manual work)
# See: content/analysis/bwv-846-prelude-analysis.json

# 2. Test with one piece
npm run content:commentary -- --bwv 846 --type prelude

# 3. Check cost estimate
npm run content:commentary:dryrun

# 4. Generate Book I
npm run content:commentary:book1

# 5. Validate quality
npm run content:validate

# 6. Review random sample
cat content/tracking/human-review-sample.md

# 7. Export to markdown
npm run content:export:markdown

# 8. Import to database
npm run content:import -- --all
```

## Expected Timeline

| Task | Duration | Cost | Output |
|------|----------|------|--------|
| Setup | 5 min | - | Environment ready |
| Test piece | 5 min | $1 | 1 piece validated |
| Preludes (24) | 3-5 hrs | $30 | 720 measures |
| Fugues (24) | 4-6 hrs | $40 | 960 measures |
| Validation | 30 min | - | QA report |
| Review | 2-3 hrs | - | Human review |
| Import | 15 min | - | Database records |
| **Total** | **10-15 hrs** | **$70** | **1,680 measures** |

## Next Steps

After completing Book I:

1. **Book II:** Repeat process for BWV 870-893
2. **Feature Instances:** Generate feature-specific annotations
3. **Curriculum Lessons:** Create pedagogical content
4. **Glossary Terms:** Define music theory terminology

## Support

**Documentation:**
- Complete guide: `docs/generation/MEASURE-COMMENTARY-GUIDE.md`
- Prompt specs: `specs/clavier-content-generation-prompts.md`
- Framework README: `scripts/content-generation/README.md`

**Common issues:**
- Analysis file format: See template in `content/analysis/`
- Database schema: `prisma/schema.prisma`
- API configuration: `scripts/content-generation/config.ts`

---

**Ready to begin? Start here:**

```bash
# 1. Check prerequisites
npm run content:commentary:dryrun

# 2. If estimate looks good:
npm run content:commentary:book1
```

*Generation will take 10-15 hours but runs mostly unattended. Progress is saved continuously.*
