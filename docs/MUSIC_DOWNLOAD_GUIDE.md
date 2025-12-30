# MusicXML Download Guide for Clavier

**Quick reference guide for downloading Well-Tempered Clavier MusicXML files**

---

## Quick Start (5 Minutes)

### What You Need
- Web browser
- 1-2 hours of time
- Internet connection

### Download Process

1. **Visit Collection**:
   [https://musescore.com/user/9836/sets/669666](https://musescore.com/user/9836/sets/669666)

2. **For Each Piece**:
   - Click piece title
   - Click "Download" button
   - Select "MusicXML"
   - Save file

3. **Organize Files**:
   - Save to: `public/music/book1/`
   - Rename following convention below

4. **Verify**:
   ```bash
   npm run music:validate
   ```

---

## File Naming Convention

**Pattern**: `BWV-{number}-book{book}-{type}-{key}.musicxml`

### Examples

| Piece | Filename |
|-------|----------|
| BWV 846 Prelude (C major) | `BWV-846-book1-prelude-c-major.musicxml` |
| BWV 846 Fugue (C major) | `BWV-846-book1-fugue-c-major.musicxml` |
| BWV 849 Prelude (C# minor) | `BWV-849-book1-prelude-c-sharp-minor.musicxml` |
| BWV 853 Fugue (Eb minor) | `BWV-853-book1-fugue-eb-minor.musicxml` |

### Key Normalization

- **Lowercase**: All letters lowercase
- **Spaces → Hyphens**: "C major" → "c-major"
- **Sharp**: Use "sharp" not "#": "c-sharp"
- **Flat**: Use "flat" or "b": "eb-major" or "e-flat-major"

---

## Book 1 Checklist (BWV 846-869)

Download these 48 files:

### Major Keys
- [ ] BWV 846 - C major (Prelude + Fugue)
- [ ] BWV 848 - C# major (Prelude + Fugue)
- [ ] BWV 850 - D major (Prelude + Fugue)
- [ ] BWV 852 - Eb major (Prelude + Fugue)
- [ ] BWV 854 - E major (Prelude + Fugue)
- [ ] BWV 856 - F major (Prelude + Fugue)
- [ ] BWV 858 - F# major (Prelude + Fugue)
- [ ] BWV 860 - G major (Prelude + Fugue)
- [ ] BWV 862 - Ab major (Prelude + Fugue)
- [ ] BWV 864 - A major (Prelude + Fugue)
- [ ] BWV 866 - Bb major (Prelude + Fugue)
- [ ] BWV 868 - B major (Prelude + Fugue)

### Minor Keys
- [ ] BWV 847 - C minor (Prelude + Fugue)
- [ ] BWV 849 - C# minor (Prelude + Fugue)
- [ ] BWV 851 - D minor (Prelude + Fugue)
- [ ] BWV 853 - Eb minor (Prelude + Fugue)
- [ ] BWV 855 - E minor (Prelude + Fugue)
- [ ] BWV 857 - F minor (Prelude + Fugue)
- [ ] BWV 859 - F# minor (Prelude + Fugue)
- [ ] BWV 861 - G minor (Prelude + Fugue)
- [ ] BWV 863 - G# minor (Prelude + Fugue)
- [ ] BWV 865 - A minor (Prelude + Fugue)
- [ ] BWV 867 - Bb minor (Prelude + Fugue)
- [ ] BWV 869 - B minor (Prelude + Fugue)

**Total**: 48 files (24 preludes + 24 fugues)

---

## After Download

### 1. Verify File Count
```bash
ls public/music/book1/*.musicxml | wc -l
# Expected: 48
```

### 2. Parse Files
```bash
npm run music:parse
```

### 3. Import to Database
```bash
npm run music:seed
```

### 4. Validate Import
```bash
npm run music:validate
```

### 5. Check Results
- Expected: 48 pieces
- Expected: ~1,500-2,000 measures
- Expected: ~30,000-50,000 notes

---

## Troubleshooting

### MuseScore Download Issues

**Problem**: Can't find Download button
**Solution**: Scroll to top of score page, button is near title

**Problem**: No MusicXML option
**Solution**: Try different browser or check if logged into MuseScore

**Problem**: Downloaded file is .mxl not .musicxml
**Solution**: .mxl is compressed MusicXML, rename to .musicxml or decompress

### File Naming Issues

**Problem**: Unsure how to name file
**Solution**: Check `scripts/music-files/download-urls.json` for exact names

**Problem**: Parser can't find files
**Solution**: Verify files are in `public/music/book1/` not root or Downloads folder

### Validation Errors

**Problem**: "No MusicXML files found"
**Solution**:
- Check directory: `ls public/music/book1/`
- Verify file extensions: `.musicxml` not `.xml`

**Problem**: "Invalid MusicXML structure"
**Solution**:
- Open file in text editor
- Verify starts with `<?xml`
- Check for `<score-partwise>` element
- Re-download if corrupted

---

## Directory Structure

```
clavier/
└── public/
    └── music/
        ├── book1/          # Book 1: BWV 846-869
        │   ├── BWV-846-book1-prelude-c-major.musicxml
        │   ├── BWV-846-book1-fugue-c-major.musicxml
        │   ├── BWV-847-book1-prelude-c-minor.musicxml
        │   ├── BWV-847-book1-fugue-c-minor.musicxml
        │   └── ... (44 more files)
        │
        └── book2/          # Book 2: BWV 870-893 (future)
            └── (To be downloaded)
```

---

## Source Attribution

Files from **Open Well-Tempered Clavier**
- Created by: Olivier Miquel & MuseScore Team
- License: CC0 Public Domain
- Website: https://welltemperedclavier.org/
- Backed by: 900+ Kickstarter supporters

---

## Quick Reference Links

- **Download Collection**: [MuseScore Set](https://musescore.com/user/9836/sets/669666)
- **Official Project**: [welltemperedclavier.org](https://welltemperedclavier.org/)
- **Detailed Log**: See `docs/MUSIC_DOWNLOAD_LOG.md`
- **File Reference**: See `scripts/music-files/download-urls.json`

---

## Time Estimates

| Task | Time |
|------|------|
| Download all 48 files | 1-2 hours |
| Rename files | 15-30 minutes |
| Parse files | 1-2 minutes |
| Import to database | 2-5 minutes |
| Validate import | 30 seconds |
| **Total** | **~2 hours** |

---

## Need Help?

1. Check `docs/MUSIC_DOWNLOAD_LOG.md` for detailed information
2. Review `scripts/music-files/README.md` for processing details
3. Run `npm run music:download -- --manual` for automated instructions
4. Check validation reports in `scripts/music-files/reports/`

---

**Last Updated**: 2025-12-29
**Status**: Ready for manual download
