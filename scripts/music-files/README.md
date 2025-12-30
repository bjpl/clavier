# Music Files System

Automated MusicXML acquisition and import system for Clavier's Well-Tempered Clavier content.

## Overview

This system downloads, parses, and imports all 48 preludes and fugues from Bach's Well-Tempered Clavier (Books I & II) into the Clavier database.

## Components

### 1. Configuration (`music-files-config.ts`)
- Complete BWV catalog (846-893)
- File naming conventions
- Validation rules
- Download settings
- Shared types and interfaces

### 2. Download (`download-musicxml.ts`)
Downloads MusicXML files from Open Well-Tempered Clavier project.

**Features:**
- Progress tracking with resume capability
- Retry logic for network failures
- Rate limiting for respectful downloading
- Progress saved to JSON file

**Usage:**
```bash
# Download all pieces (automated)
npm run music:download

# Show manual download instructions
npm run music:download -- --manual
```

### 3. Parser (`parse-musicxml.ts`)
Parses MusicXML files into database-ready format.

**Features:**
- Extracts measures, notes, timing, voices
- Generates proper note IDs and relationships
- Validates structure and content
- Handles polyphony and voice separation

**Usage:**
```bash
# Parse all MusicXML files
npm run music:parse
```

### 4. Seeder (`seed-pieces.ts`)
Imports parsed data into Prisma database.

**Features:**
- Creates Piece, Measure, Note records
- Transaction-based imports
- Completeness verification
- Option to clear existing data

**Usage:**
```bash
# Import to database
npm run music:seed

# Import with clearing existing data first
npm run music:seed -- --clear
```

### 5. Validator (`validate-import.ts`)
Quality validation and reporting.

**Features:**
- Checks all 48 pieces imported
- Validates measure counts
- Verifies note relationships
- Generates detailed reports (JSON + Markdown)

**Usage:**
```bash
# Validate import
npm run music:validate
```

## Complete Workflow

### Option 1: Manual Download (Required - API Not Available)

Automated download is not possible due to MuseScore's private API. Follow these steps:

1. **Review download guide:**
   ```bash
   cat docs/MUSIC_DOWNLOAD_GUIDE.md
   # Or see: docs/MUSIC_DOWNLOAD_LOG.md for detailed research
   ```

2. **Download files manually:**
   - Visit: https://musescore.com/user/9836/sets/669666
   - Click each piece → Download → MusicXML
   - Save to `public/music/book1/` or `public/music/book2/`
   - Use naming convention from `scripts/music-files/download-urls.json`
   - See `docs/MUSIC_DOWNLOAD_GUIDE.md` for complete instructions

3. **Parse the downloaded files:**
   ```bash
   npm run music:parse
   ```

4. **Import to database:**
   ```bash
   npm run music:seed
   ```

5. **Validate the import:**
   ```bash
   npm run music:validate
   ```

**Time Estimate**: 1-2 hours for download, 5-10 minutes for processing

### Option 2: Automated (If URLs Available)

```bash
# Run complete workflow
npm run music:download
npm run music:parse
npm run music:seed
npm run music:validate
```

## File Naming Convention

Files must follow this naming pattern:

```
BWV-{number}-{book}-{type}-{key}.musicxml
```

**Examples:**
- `BWV-846-book1-prelude-c-major.musicxml`
- `BWV-846-book1-fugue-c-major.musicxml`
- `BWV-849-book1-prelude-c-sharp-minor.musicxml`
- `BWV-893-book2-fugue-b-minor.musicxml`

## Directory Structure

```
public/music/
├── book1/
│   ├── BWV-846-book1-prelude-c-major.musicxml
│   ├── BWV-846-book1-fugue-c-major.musicxml
│   └── ... (48 files total)
└── book2/
    ├── BWV-870-book2-prelude-c-major.musicxml
    ├── BWV-870-book2-fugue-c-major.musicxml
    └── ... (48 files total)

scripts/music-files/
├── music-files-config.ts
├── download-musicxml.ts
├── parse-musicxml.ts
├── seed-pieces.ts
├── validate-import.ts
├── download-progress.json (generated)
├── logs/ (generated)
└── reports/ (generated)
```

## Validation Reports

Reports are saved to `scripts/music-files/reports/` with timestamps:

- **JSON Report:** Complete validation data
- **Markdown Report:** Human-readable summary

**Report includes:**
- Overall pass/fail status
- Piece, measure, and note counts
- Missing pieces
- Validation issues
- Per-piece details

## Data Model

### Piece
- BWV number (846-893)
- Book (1 or 2)
- Type (PRELUDE or FUGUE)
- Key signature (tonic + mode)
- Time signature
- Total measures
- Voice count (for fugues)
- File paths

### Measure
- Measure number (1-based)
- Beat count
- Pickup/final flags
- Local key changes
- Timing information

### Note
- Voice (1-5)
- Pitch (class, octave, MIDI number)
- Timing (start beat, duration)
- Articulations, dynamics
- Tie relationships

## Expected Results

After successful import:
- **96 pieces** (48 preludes + 48 fugues)
- **~3,000-4,000 measures** (varies by piece)
- **~50,000-80,000 notes** (varies by complexity)

## Troubleshooting

### "No MusicXML files found"
- Ensure files are in `public/music/book1/` or `public/music/book2/`
- Check file naming matches the pattern
- Run `npm run music:download -- --manual` for instructions

### Parse errors
- Verify MusicXML files are valid XML
- Check files contain `<score-partwise>` root element
- Try opening in MuseScore to verify

### Import failures
- Check database connection (`DATABASE_URL` in `.env`)
- Run Prisma migrations: `npm run db:push`
- Check for unique constraint violations

### Validation warnings
- Review generated reports in `scripts/music-files/reports/`
- Check for missing pieces or measures
- Verify note relationships are valid

## Development

### Adding New Pieces

To add pieces beyond WTC:

1. **Update catalog** in `music-files-config.ts`:
   ```typescript
   export const NEW_CATALOG = [
     { bwv: 999, book: 1, number: 1, key: 'C minor', ... },
   ];
   ```

2. **Modify parser** to handle new structures if needed

3. **Run workflow** with new files

### Testing

```bash
# Test parser with single file
tsx scripts/music-files/parse-musicxml.ts public/music/book1/BWV-846-book1-prelude-c-major.musicxml

# Test seeder with --dry-run (if implemented)
tsx scripts/music-files/seed-pieces.ts --dry-run

# Test validator
tsx scripts/music-files/validate-import.ts
```

## Performance

- **Download:** ~2-5 minutes (with rate limiting)
- **Parse:** ~30-60 seconds for all 96 files
- **Import:** ~1-2 minutes (database operations)
- **Validation:** ~10-20 seconds

## Dependencies

- **tsx:** TypeScript execution
- **@prisma/client:** Database access
- **Node.js 18+:** Runtime

## License & Attribution

All MusicXML files are sourced from the **Open Well-Tempered Clavier** project:

> Open Well-Tempered Clavier by Kimiko Ishizaka and MuseScore team
> CC0 Public Domain
> https://welltemperedclavier.org/

This system respects the public domain status and provides proper attribution.

## References

### Documentation
- [MUSIC_DOWNLOAD_LOG.md](../../docs/MUSIC_DOWNLOAD_LOG.md) - Complete research findings and download documentation
- [MUSIC_DOWNLOAD_GUIDE.md](../../docs/MUSIC_DOWNLOAD_GUIDE.md) - Quick reference guide for downloading files
- [MUSIC_FILES.md](../../docs/MUSIC_FILES.md) - Complete source documentation
- [download-urls.json](./download-urls.json) - Structured catalog of all pieces with download metadata

### External Resources
- [Open WTC Project](https://welltemperedclavier.org/) - Official project website
- [MuseScore Collection](https://musescore.com/user/9836/sets/669666) - Download source
- [MusicXML Specification](https://www.musicxml.com/) - Technical specification
- [Prisma Schema](../../prisma/schema.prisma) - Database schema
