# Database Seeds

This directory contains modular seed files for populating the Clavier database with production-ready data.

## Files

### `pieces.ts`
All 48 pieces from Bach's Well-Tempered Clavier (Books I & II, BWV 846-893)
- 96 total pieces (48 preludes + 48 fugues)
- Includes: BWV numbers, keys, time signatures, tempo suggestions, durations
- Data sourced from standard WTC catalogs and performance practice

### `features.ts`
Music theory features taxonomy (40+ features)
- Categories: Harmony, Counterpoint, Fugue, Rhythm, Melody, Form, Texture, Performance
- Hierarchical structure with parent-child relationships
- Three explanation levels: Beginner, Intermediate, Advanced
- Searchable with keywords and slugs

### `curriculum.ts`
Learning curriculum structure
- 5 Domains → 13 Units → 11 Modules → 8+ Lessons
- Hierarchical organization from fundamentals to advanced topics
- Includes estimated durations and lesson content
- Sample lessons with structured sections (concepts, examples, exercises)

## Usage

```bash
# Run all seeds
npm run db:seed

# Or import individually in other scripts
import { seedPieces } from './seeds/pieces';
import { seedFeatures } from './seeds/features';
import { seedCurriculum } from './seeds/curriculum';
```

## Adding New Seeds

1. Create new `.ts` file in this directory
2. Export an async function: `export async function seedXxx(prisma: PrismaClient)`
3. Import and call from `/prisma/seed.ts`
4. Follow upsert pattern for idempotency

## Data Quality Guidelines

- **Accuracy:** All music data must be historically/theoretically accurate
- **Completeness:** Include all required fields from schema
- **Consistency:** Use consistent naming, formatting, terminology
- **Documentation:** Add comments explaining data sources or decisions
- **Idempotency:** Use `upsert` so seeds can run multiple times safely

## Related

See [/docs/DATABASE_SEEDING.md](/docs/DATABASE_SEEDING.md) for complete documentation.
