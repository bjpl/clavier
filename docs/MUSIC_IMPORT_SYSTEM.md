# Music Import System Documentation

## Overview

The Clavier Music Import System is a comprehensive, automated pipeline for acquiring, parsing, and importing MusicXML files for Bach's Well-Tempered Clavier into the application database.

## System Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                   Music Import System                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐   ┌──────────┐   ┌──────────────┐    │
│  │  Download   │──>│  Parse   │──>│    Seed      │    │
│  │  MusicXML   │   │ MusicXML │   │   Database   │    │
│  └─────────────┘   └──────────┘   └──────────────┘    │
│         │                                    │          │
│         v                                    v          │
│  ┌─────────────┐                    ┌──────────────┐   │
│  │  Progress   │                    │  Validate    │   │
│  │  Tracking   │                    │   Import     │   │
│  └─────────────┘                    └──────────────┘   │
│                                             │           │
│                                             v           │
│                                     ┌──────────────┐    │
│                                     │   Reports    │    │
│                                     └──────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### File Organization

```
clavier/
├── scripts/music-files/
│   ├── music-files-config.ts     # Configuration & catalog
│   ├── download-musicxml.ts      # Download orchestration
│   ├── parse-musicxml.ts         # MusicXML parsing
│   ├── seed-pieces.ts            # Database import
│   ├── validate-import.ts        # Quality validation
│   ├── README.md                 # Full documentation
│   ├── QUICKSTART.md             # Quick start guide
│   ├── .gitignore                # Generated files exclusion
│   ├── download-progress.json    # Download state (generated)
│   ├── logs/                     # Operation logs (generated)
│   └── reports/                  # Validation reports (generated)
│
├── public/music/
│   ├── book1/                    # Book I MusicXML files
│   └── book2/                    # Book II MusicXML files
│
└── docs/
    ├── MUSIC_FILES.md            # Source strategy & research
    └── MUSIC_IMPORT_SYSTEM.md    # This file
```

## Data Flow

### 1. Download Phase

**Input:** Open Well-Tempered Clavier URLs
**Output:** 96 MusicXML files

**Process:**
1. Read WTC catalog configuration
2. Generate filenames according to convention
3. Check progress file for already-downloaded pieces
4. Download from MuseScore with retry logic
5. Validate downloaded content is valid XML
6. Save to `public/music/book{1,2}/`
7. Update progress tracking

**Features:**
- Resume capability (tracks completed downloads)
- Retry logic (3 attempts with exponential backoff)
- Rate limiting (6 seconds between requests)
- Progress persistence (JSON file)

### 2. Parse Phase

**Input:** MusicXML files from `public/music/`
**Output:** Structured ParsedMusicXML objects

**Process:**
1. Scan directories for `.musicxml` files
2. Extract metadata from filename
3. Parse XML structure (measures, notes, timing)
4. Convert pitches to standardized format
5. Calculate beat positions and durations
6. Validate structural integrity
7. Return typed data structures

**Data Extracted:**
- Piece metadata (BWV, key, time signature)
- Measure information (count, beats, pickup/final)
- Note details (pitch, octave, MIDI, timing, voice)
- Articulations and dynamics

### 3. Seed Phase

**Input:** ParsedMusicXML objects
**Output:** Database records

**Process:**
1. Open database transaction
2. Create Piece record with metadata
3. Create Measure records for each measure
4. Batch create Note records per measure
5. Commit transaction
6. Verify completeness
7. Report statistics

**Database Operations:**
- Transactional imports (all-or-nothing per piece)
- Cascade deletions (configured in schema)
- Optional clear before import (`--clear` flag)

### 4. Validation Phase

**Input:** Database content
**Output:** Validation reports (JSON + Markdown)

**Process:**
1. Count pieces, measures, notes
2. Check for missing BWV numbers
3. Validate measure counts against expectations
4. Verify note relationships and constraints
5. Check voice consistency
6. Generate detailed reports
7. Save to `reports/` directory

**Validations:**
- Piece count (96 expected)
- Measure counts (reasonable ranges)
- Note MIDI values (0-127)
- Note octaves (0-8)
- Voice numbers (1-5)
- Beat positions (positive, non-overlapping)
- Duration values (positive)

## Configuration

### WTC Catalog (`music-files-config.ts`)

Complete catalog of all 48 pieces across both books:

```typescript
export const WTC_CATALOG = [
  {
    bwv: 846,
    book: 1,
    number: 1,
    key: 'C major',
    prelude: true,
    fugue: true,
    voices: 4
  },
  // ... 47 more pieces
];
```

### File Naming Convention

Pattern: `BWV-{number}-{book}-{type}-{key}.musicxml`

Components:
- **BWV number:** 846-893 (3 digits)
- **Book:** "book1" or "book2"
- **Type:** "prelude" or "fugue"
- **Key:** Full key signature normalized
  - Spaces → hyphens
  - Sharp (♯) → "-sharp"
  - Flat (♭) → "-flat"

Examples:
- `BWV-846-book1-prelude-c-major.musicxml`
- `BWV-849-book1-fugue-c-sharp-minor.musicxml`
- `BWV-862-book1-prelude-ab-major.musicxml`

### Validation Rules

```typescript
export const VALIDATION_RULES = {
  requiredElements: ['score-partwise', 'part-list', ...],
  validPitchClasses: ['C', 'C#', 'Db', 'D', ...],
  validOctaves: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  validMidiRange: { min: 0, max: 127 },
  minMeasuresPrelude: 10,
  minMeasuresFugue: 15,
  maxMeasures: 200,
};
```

## Usage

### NPM Scripts

```bash
# Individual operations
npm run music:download        # Download MusicXML files
npm run music:parse          # Parse to structured data
npm run music:seed           # Import to database
npm run music:validate       # Validate and report

# Combined workflow
npm run music:setup          # Run all steps in sequence

# Options
npm run music:download -- --manual    # Show manual instructions
npm run music:seed -- --clear         # Clear existing data first
```

### Direct Script Execution

```bash
# With tsx
tsx scripts/music-files/download-musicxml.ts
tsx scripts/music-files/parse-musicxml.ts
tsx scripts/music-files/seed-pieces.ts
tsx scripts/music-files/validate-import.ts

# With arguments
tsx scripts/music-files/download-musicxml.ts --manual
tsx scripts/music-files/seed-pieces.ts --clear
```

### Programmatic Usage

```typescript
import { MusicXMLDownloader } from './scripts/music-files/download-musicxml';
import { MusicXMLParser } from './scripts/music-files/parse-musicxml';
import { PiecesSeeder } from './scripts/music-files/seed-pieces';
import { ImportValidator } from './scripts/music-files/validate-import';

// Download
const downloader = new MusicXMLDownloader();
await downloader.downloadAll();

// Parse
const parser = new MusicXMLParser();
const parsed = await parser.parseAll();

// Seed
const seeder = new PiecesSeeder();
await seeder.importAll(parsed);

// Validate
const validator = new ImportValidator();
await validator.runValidation();
```

## Expected Results

### Successful Import

**Pieces:** 96 total
- Book I: 48 (BWV 846-869, 24 preludes + 24 fugues)
- Book II: 48 (BWV 870-893, 24 preludes + 24 fugues)

**Measures:** ~3,500-4,000
- Average: 35-40 measures per piece
- Range: 15-120 measures (varies significantly)

**Notes:** ~50,000-80,000
- Average: 500-800 notes per piece
- Density varies by piece complexity and style

### Database Records

**Piece Table:**
- 96 records with complete metadata
- BWV numbers 846-893
- Keys: All 24 major and minor keys
- Types: PRELUDE and FUGUE

**Measure Table:**
- ~3,500 records
- Linked to pieces via foreign key
- Includes pickup and final measure flags
- Beat count per measure

**Note Table:**
- ~65,000 records (estimated)
- Linked to measures via foreign key
- Complete pitch, timing, and voice information
- MIDI numbers for playback

## Error Handling

### Download Errors

**Network Failures:**
- Automatic retry with exponential backoff
- Progress saved after each successful download
- Resume from last successful download

**Invalid URLs:**
- Logged to console
- Marked in progress file as failed
- Can retry individually

### Parse Errors

**Malformed XML:**
- Error logged with specific file
- Continue processing remaining files
- Summary shows failed count

**Missing Elements:**
- Validation error reported
- File skipped
- Can be corrected and re-parsed

### Import Errors

**Database Constraints:**
- Transaction rollback (piece not partially imported)
- Error logged with details
- Can retry after fixing issue

**Duplicate Records:**
- Use `--clear` flag to remove existing data
- Or manually delete conflicting records

### Validation Warnings

**Missing Pieces:**
- Listed in validation report
- Download and import individually
- Re-run validation

**Data Integrity Issues:**
- Detailed in validation report
- Check source MusicXML files
- May require manual correction

## Performance

### Benchmarks

**Download Phase:**
- Time: ~5-10 minutes (with rate limiting)
- Network dependent
- Can be resumed if interrupted

**Parse Phase:**
- Time: ~30-60 seconds for 96 files
- CPU bound
- Parallelizable (currently sequential)

**Seed Phase:**
- Time: ~1-2 minutes
- Database I/O bound
- Transactional per piece

**Validate Phase:**
- Time: ~10-20 seconds
- Database query bound
- Generates reports

**Total Pipeline:** ~7-14 minutes for complete workflow

### Optimization Opportunities

1. **Parallel Parsing:** Process multiple files concurrently
2. **Batch Seeding:** Combine transactions where safe
3. **Incremental Validation:** Validate during import
4. **Caching:** Cache parsed results to avoid re-parsing

## Troubleshooting

### Common Issues

**1. No MusicXML files found**
```
Error: No MusicXML files found to parse
```
- **Cause:** Files not in expected locations
- **Fix:** Check `public/music/book1/` and `public/music/book2/`
- **Verify:** Run `ls public/music/book*/*.musicxml`

**2. Database connection error**
```
Error: Can't reach database server
```
- **Cause:** DATABASE_URL not configured or database down
- **Fix:** Check `.env` file and database status
- **Verify:** Run `npm run db:push`

**3. Parse errors**
```
Error: Invalid filename format
```
- **Cause:** Files not following naming convention
- **Fix:** Rename files to match pattern
- **Pattern:** `BWV-{num}-book{book}-{type}-{key}.musicxml`

**4. Validation failures**
```
Missing pieces: 10
```
- **Cause:** Not all files downloaded/imported
- **Fix:** Check validation report for missing BWV numbers
- **Retry:** Download missing pieces and re-import

### Debug Mode

Enable verbose logging:

```typescript
// In music-files-config.ts
export const LOG_CONFIG = {
  logLevel: 'debug', // Change from 'info' to 'debug'
};
```

### Manual Inspection

**Check Downloads:**
```bash
ls -lh public/music/book1/*.musicxml | wc -l  # Should be 48
ls -lh public/music/book2/*.musicxml | wc -l  # Should be 48
```

**Check Database:**
```bash
npm run db:studio  # Open Prisma Studio
# Navigate to Piece, Measure, Note tables
```

**Check Reports:**
```bash
ls -lt scripts/music-files/reports/  # Latest reports at top
cat scripts/music-files/reports/validation-*.md  # Read report
```

## Maintenance

### Updating Catalog

To add new pieces:

1. Update `WTC_CATALOG` in `music-files-config.ts`
2. Add download URLs (if available)
3. Update validation rules if needed
4. Re-run workflow

### Updating Validation

To add new validation rules:

1. Update `VALIDATION_RULES` in `music-files-config.ts`
2. Add validation logic in `validate-import.ts`
3. Update report generation
4. Run validation on existing data

### Schema Changes

If Prisma schema changes:

1. Update type definitions in scripts
2. Regenerate Prisma client: `npm run db:generate`
3. Update database: `npm run db:push`
4. Re-import data if needed

## License & Attribution

**Source:** Open Well-Tempered Clavier Project
- **URL:** https://welltemperedclavier.org/
- **License:** CC0 Public Domain
- **Attribution:** Kimiko Ishizaka & MuseScore team

**This System:** Part of Clavier application
- All scripts licensed under project license
- Maintains proper attribution to source
- Respects public domain status

## References

- [Quick Start Guide](../scripts/music-files/QUICKSTART.md)
- [Full Documentation](../scripts/music-files/README.md)
- [Source Strategy](./MUSIC_FILES.md)
- [Prisma Schema](../prisma/schema.prisma)
- [Open WTC Project](https://welltemperedclavier.org/)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review validation reports
3. Check console output for specific errors
4. Verify file locations and naming
5. Ensure database is accessible

---

**Version:** 1.0.0
**Last Updated:** 2025-12-29
**Status:** Production Ready
