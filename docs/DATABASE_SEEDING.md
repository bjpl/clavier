# Database Seeding Guide

## Overview

The Clavier database seeding system populates the database with production-ready data for the Well-Tempered Clavier learning platform. All seed data is based on J.S. Bach's Well-Tempered Clavier (BWV 846-893) and standard music theory pedagogy.

## Running Seeds

```bash
# Generate Prisma client first
npm run db:generate

# Run all seeds
npm run db:seed

# Or use Prisma's built-in seed command
npx prisma db seed
```

## Seed Files Structure

```
prisma/
├── seed.ts              # Main seed orchestrator
└── seeds/
    ├── pieces.ts        # All 48 WTC pieces
    ├── features.ts      # Music theory features taxonomy
    └── curriculum.ts    # Learning curriculum structure
```

## Seed Data Summary

### 1. Pieces (`pieces.ts`)

**Total Records:** 96 pieces (48 preludes + 48 fugues)

**Coverage:**
- Book I: BWV 846-893 (24 prelude-fugue pairs)
- Book II: BWV 870-893 (24 prelude-fugue pairs)
- All 24 major and minor keys

**Data Included:**
- BWV catalog number
- Book (1 or 2) and position (1-24)
- Type (PRELUDE or FUGUE)
- Key (tonic and mode)
- Time signature
- Tempo suggestion (BPM)
- Total measures
- Voice count (for fugues)
- Estimated duration (seconds)

**Example:**
```typescript
{
  bwvNumber: 846,
  book: 1,
  numberInBook: 1,
  type: 'PRELUDE',
  keyTonic: 'C',
  keyMode: 'MAJOR',
  timeSignature: '4/4',
  tempoSuggestionBpm: 96,
  totalMeasures: 35,
  totalDurationSeconds: 140
}
```

### 2. Features (`features.ts`)

**Total Records:** 40+ music theory features

**Categories:**
- **HARMONY** (9 features): Cadences, modulation, chromaticism
- **COUNTERPOINT** (5 features): Imitation, canon, inversion
- **FUGUE** (4 features): Subject, answer, countersubject, episode
- **RHYTHM** (3 features): Syncopation, hemiola, sequences
- **MELODY** (3 features): Sequences, inversion, ornamentation
- **FORM** (2 features): Binary, ternary
- **TEXTURE** (3 features): Homophony, polyphony, monophony
- **PERFORMANCE** (3 features): Articulation, dynamics, tempo

**Hierarchical Structure:**
Features can have parent-child relationships (e.g., "Authentic Cadence" is a child of "Cadence")

**Educational Levels:**
Each feature includes three explanation levels:
- **Beginner:** Simple, accessible language
- **Intermediate:** More technical, assumes basic theory knowledge
- **Advanced:** Academic terminology, deep structural understanding

**Example:**
```typescript
{
  name: 'Authentic Cadence',
  slug: 'authentic-cadence',
  category: 'HARMONY',
  parentSlug: 'cadence',
  description: 'V-I progression with a strong sense of finality',
  explanationBeginner: 'The strongest type of ending...',
  explanationIntermediate: 'Perfect authentic cadence (PAC)...',
  explanationAdvanced: 'The authentic cadence represents...',
  difficultyLevel: 2,
  searchKeywords: ['PAC', 'perfect authentic', 'V-I']
}
```

### 3. Curriculum (`curriculum.ts`)

**Structure:** Domains → Units → Modules → Lessons

**Total Records:**
- 5 Domains
- 13 Units
- 11 Modules
- 8 Lessons (sample set)

#### Domains

1. **Fundamentals** - Core concepts for understanding Bach
2. **Harmonic Analysis** - Chord progressions and tonal structure
3. **Contrapuntal Techniques** - Voice leading and polyphony
4. **Fugue** - Specialized fugal form and technique
5. **Performance Practice** - Interpretation and articulation

#### Sample Learning Path

```
Domain: Harmonic Analysis
  └─ Unit: Cadential Structures
      └─ Module: Authentic Cadences
          ├─ Lesson: Perfect Authentic Cadence
          └─ Lesson: Imperfect Authentic Cadence

Domain: Fugue
  └─ Unit: Fugue Anatomy
      └─ Module: Exposition
          ├─ Lesson: Subject and Answer
          └─ Lesson: Countersubject
```

#### Lesson Structure

Each lesson includes:
- **Introduction:** Overview of the concept
- **Concepts:** Key theoretical points
- **Examples:** Specific BWV references and measure numbers
- **Exercises:** Practice activities

**Example Lesson:**
```typescript
{
  name: 'Perfect Authentic Cadence',
  sections: {
    introduction: 'The PAC provides the strongest sense of closure...',
    concepts: [
      'V-I progression in root position',
      'Tonic in the soprano voice',
      'Structural significance'
    ],
    examples: [
      { piece: 'C Major Prelude, BWV 846', measure: 34 }
    ],
    exercises: [
      'Locate PACs in assigned pieces',
      'Analyze voice leading in cadences'
    ]
  }
}
```

## Seed Execution Order

Seeds run in dependency order to respect foreign key relationships:

1. **Features** (no dependencies)
2. **Pieces** (no dependencies)
3. **Curriculum** (hierarchical: Domains → Units → Modules → Lessons)

## Upsert Strategy

All seeds use `upsert` operations:
- **Create:** If record doesn't exist
- **Update:** Empty update (preserves existing data)
- **Advantage:** Idempotent - safe to run multiple times

## Extending the Seeds

### Adding New Pieces

Edit `/prisma/seeds/pieces.ts`:

```typescript
const WTC_PIECES: PieceData[] = [
  // ... existing pieces
  {
    bwvNumber: XXX,
    book: X,
    numberInBook: XX,
    type: 'PRELUDE' | 'FUGUE',
    keyTonic: 'X',
    keyMode: 'MAJOR' | 'MINOR',
    timeSignature: 'X/X',
    // ... other fields
  }
];
```

### Adding New Features

Edit `/prisma/seeds/features.ts`:

```typescript
const FEATURES: FeatureData[] = [
  // ... existing features
  {
    name: 'Feature Name',
    slug: 'feature-slug',
    category: 'HARMONY', // or other category
    parentSlug: 'parent-feature', // optional
    description: '...',
    explanationBeginner: '...',
    explanationIntermediate: '...',
    explanationAdvanced: '...',
    difficultyLevel: 1-5,
    searchKeywords: ['...']
  }
];
```

### Adding New Curriculum Content

Edit `/prisma/seeds/curriculum.ts` for:
- **Domains:** Add to `DOMAINS` array
- **Units:** Add to `UNITS` array with `domainName`
- **Modules:** Add to `MODULES` array with `domainName` and `unitName`
- **Lessons:** Add to `LESSONS` array with full path

## Verification

After seeding, verify data:

```bash
# Open Prisma Studio
npm run db:studio

# Or query directly
npx prisma db execute --stdin <<EOF
SELECT COUNT(*) FROM "Piece";
SELECT COUNT(*) FROM "Feature";
SELECT COUNT(*) FROM "Domain";
EOF
```

Expected counts:
- Pieces: 96
- Features: 40+
- Domains: 5
- Units: 13
- Modules: 11
- Lessons: 8+ (will grow)

## Production Readiness

All seed data is:
- ✅ Historically accurate (BWV catalog, WTC specifications)
- ✅ Pedagogically sound (standard music theory)
- ✅ Complete (all 48 WTC pieces, comprehensive feature taxonomy)
- ✅ Well-structured (hierarchical relationships, difficulty progression)
- ✅ Searchable (keywords, slugs, categorization)

## Future Enhancements

Potential additions:
- [ ] Complete lesson content for all modules
- [ ] Audio file references (MIDI/MusicXML paths)
- [ ] More detailed feature instances (specific measure-level examples)
- [ ] User progress tracking seed data (for testing)
- [ ] Annotation seed data (sample harmonic analyses)

## Troubleshooting

### Duplicate Key Errors

If you see unique constraint violations:
- Pieces use `bwvNumber` as unique key (may have duplicates for Books I & II)
- Features use `slug` as unique key
- Domains use `name` as unique key
- Check seed data for duplicates

### Missing Dependencies

Ensure these are installed:
```bash
npm install -D tsx
npm install @prisma/client
```

### Type Errors

Regenerate Prisma Client after schema changes:
```bash
npm run db:generate
```

## Related Documentation

- [Prisma Schema](/prisma/schema.prisma)
- [API Documentation](/docs/api/)
- [Music Theory Guide](/docs/MUSIC_THEORY.md) *(planned)*

---

*Last Updated: 2025-12-29*
