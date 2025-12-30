# Music Files Quick Start Guide

Get started with the MusicXML acquisition and import system in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Database configured (PostgreSQL)
- Prisma schema migrated (`npm run db:push`)

## Quick Start

### 1. Get Manual Download Instructions

```bash
npm run music:download -- --manual
```

This will show you:
- The Open WTC website URL
- Exact filenames for all 96 pieces
- Where to save each file

### 2. Download Sample Files

For testing, start with just a few pieces:

**Book I, Prelude & Fugue No. 1 in C Major (BWV 846):**
1. Visit: https://musescore.com/user/71163/scores/89742
2. Download as MusicXML
3. Rename to: `BWV-846-book1-prelude-c-major.musicxml`
4. Save to: `public/music/book1/`

Repeat for the fugue and a few more pieces.

### 3. Parse the Files

```bash
npm run music:parse
```

You should see:
```
→ Parsing: public/music/book1/BWV-846-book1-prelude-c-major.musicxml
  ✓ Parsed 35 measures with 514 notes
```

### 4. Import to Database

```bash
npm run music:seed
```

Output:
```
→ Importing: BWV-846-book1-prelude-c-major.musicxml
  ✓ Created piece: BWV 846 PRELUDE
  ✓ Created 35 measures
  ✓ Created 514 notes
```

### 5. Validate the Import

```bash
npm run music:validate
```

Results:
```
✓ Piece count: 2 / 96
✓ Missing pieces: 94
✓ Measure validation: 0 issues found
✓ Note validation: 0 issues found
```

Reports saved to `scripts/music-files/reports/`

## Full Import Process

Once you're ready to import all 96 pieces:

### Option 1: Manual Download (Recommended)

1. **Get the file list:**
   ```bash
   npm run music:download -- --manual > filelist.txt
   ```

2. **Download all files from MuseScore:**
   - Visit https://welltemperedclavier.org/
   - Click each piece → Download → MusicXML
   - Save with exact filenames from `filelist.txt`
   - Organize in `public/music/book1/` and `public/music/book2/`

3. **Run the import:**
   ```bash
   npm run music:parse
   npm run music:seed
   npm run music:validate
   ```

### Option 2: Automated (If Available)

```bash
npm run music:setup
```

This runs all steps automatically:
- Download
- Parse
- Seed
- Validate

## Verification

Check the database:

```bash
npm run db:studio
```

Navigate to the `Piece` table - you should see your imported pieces.

## File Structure

```
clavier/
├── public/
│   └── music/
│       ├── book1/
│       │   ├── BWV-846-book1-prelude-c-major.musicxml
│       │   ├── BWV-846-book1-fugue-c-major.musicxml
│       │   └── ...
│       └── book2/
│           └── ...
└── scripts/
    └── music-files/
        ├── download-progress.json (generated)
        └── reports/ (generated)
```

## Troubleshooting

### "No MusicXML files found"
- Check files are in `public/music/book1/` or `public/music/book2/`
- Verify filenames match exact pattern
- Example: `BWV-846-book1-prelude-c-major.musicxml`

### Parse Errors
- Open file in MuseScore to verify it's valid
- Check for `<?xml` at the start
- Ensure `<score-partwise>` element exists

### Database Errors
- Verify DATABASE_URL in `.env`
- Run: `npm run db:push`
- Check database is accessible

### Import Validation Warnings
- Review reports in `scripts/music-files/reports/`
- Check for specific error messages
- Verify piece count matches expected

## Expected Data

After full import:
- **96 pieces** (48 preludes + 48 fugues)
- **~3,500 measures** (average ~36 per piece)
- **~65,000 notes** (varies by complexity)

Book I pieces: BWV 846-869
Book II pieces: BWV 870-893

## Next Steps

Once data is imported:
1. Use Prisma Studio to explore the data
2. Build frontend components to display pieces
3. Implement playback with Tone.js
4. Create interactive lessons

## Resources

- [Full Documentation](./README.md)
- [Music Files Strategy](../../docs/MUSIC_FILES.md)
- [Prisma Schema](../../prisma/schema.prisma)
- [Open WTC Project](https://welltemperedclavier.org/)

## Getting Help

Common commands:
```bash
npm run music:download -- --manual  # Show download instructions
npm run music:parse                 # Parse MusicXML files
npm run music:seed                  # Import to database
npm run music:seed -- --clear       # Clear and re-import
npm run music:validate              # Validate import
```

For issues, check:
1. Console output for specific error messages
2. Validation reports in `scripts/music-files/reports/`
3. Database logs
4. File naming and locations
