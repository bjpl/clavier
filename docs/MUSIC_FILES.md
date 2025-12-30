# Music Files for Well-Tempered Clavier Project

## Overview

This document outlines sources, acquisition strategies, and quality validation for music files needed for the Clavier project. All sources listed are public domain and legally available for free use.

---

## 1. MusicXML Sources

### Primary Sources

#### 1.1 Open Well-Tempered Clavier (OpenScore)
- **URL**: [welltemperedclavier.org](https://welltemperedclavier.org/)
- **Status**: Public domain, Kickstarter-funded project
- **Quality**: ⭐⭐⭐⭐⭐ Professional edition
- **Description**: Official crowdsourced edition by pianist Kimiko Ishizaka and MuseScore team
- **Format**: MuseScore files (can export to MusicXML)
- **Coverage**: Complete Books I & II (BWV 846-893)
- **Editorial Approach**: Based on Agricola's (Berlin) and Dresden manuscripts
- **Advantages**:
  - Professionally edited and peer-reviewed
  - Modern, clean engraving using MuseScore 2.0+
  - Includes performance recordings for reference
  - Community-vetted through public review process
  - Easily exports to MusicXML, MIDI, PDF

#### 1.2 MuseScore Community Scores
- **URL**: [musescore.com/user/71163/scores/89742](https://musescore.com/user/71163/scores/89742)
- **Status**: Public domain
- **Quality**: ⭐⭐⭐⭐⭐ (Official Open WTC edition)
- **Description**: Complete Open Well-Tempered Clavier edition hosted on MuseScore
- **Format**: MuseScore native + MusicXML export
- **Coverage**: All 48 preludes and fugues
- **Access Method**:
  - Download MuseScore files directly
  - Export to MusicXML using MuseScore application
  - Individual pieces available at various quality levels

#### 1.3 GitHub - musetrainer/library
- **URL**: [github.com/musetrainer/library](https://github.com/musetrainer/library)
- **Status**: Public domain
- **Quality**: ⭐⭐⭐ Varies by piece
- **Description**: Public domain MusicXML files repository
- **Format**: MusicXML (.musicxml, .xml)
- **Coverage**: Partial (at least BWV 846 confirmed)
- **Access Method**: Direct git clone or download
- **Command**: `git clone https://github.com/musetrainer/library.git`

#### 1.4 University of Cape Town Open Edition
- **URL**: [open.uct.ac.za - Bach WTC](https://open.uct.ac.za/items/d2a6887b-7196-4fbe-8b56-a469bf557f93)
- **Status**: Public domain, open source
- **Quality**: ⭐⭐⭐⭐ Academic quality
- **Description**: Open source edition of 48 fugues + 1 prelude
- **Format**: LilyPond (.ly) source files, PDF
- **Coverage**: 48 fugues, 1 prelude
- **Conversion**: LilyPond can export to MusicXML
- **Advantages**: Source files allow customization

#### 1.5 IMSLP (Petrucci Music Library)
- **URL**: [imslp.org/wiki/Das_wohltemperierte_Klavier_I,_BWV_846-869](https://imslp.org/wiki/Das_wohltemperierte_Klavier_I,_BWV_846-869)
- **Status**: Public domain
- **Quality**: ⭐⭐⭐ Varies by edition
- **Description**: Individual pieces available, not complete collection
- **Format**: Primarily PDF scans, some MusicXML
- **Coverage**: Complete (individual downloads required)
- **Access Method**: Individual piece downloads
- **Note**: MusicXML files available for select pieces in "Engraving files" section

### Quality Assessment & Recommendations

**RECOMMENDED PRIMARY SOURCE**: Open Well-Tempered Clavier (welltemperedclavier.org)
- Highest quality and consistency
- Professional editorial standards
- Community-reviewed
- Complete collection in single source
- Easy MusicXML export from MuseScore format

**Backup Sources**:
1. MuseScore community edition (same as welltemperedclavier.org)
2. IMSLP for specific pieces needing verification
3. UCT edition for LilyPond source access

---

## 2. MIDI Sources

### Primary Sources

#### 2.1 Kunstderfuge
- **URL**: [kunstderfuge.com/bach/wtk1.htm](https://www.kunstderfuge.com/bach/wtk1.htm)
- **URL**: [kunstderfuge.com/bach/wtk2.htm](https://www.kunstderfuge.com/bach/wtk2.htm)
- **Status**: Public domain, well-established collection
- **Quality**: ⭐⭐⭐⭐⭐ High-quality, curated
- **Description**: 19,300+ authorized free classical MIDI files
- **Coverage**: Complete Books I & II
- **Format**: MIDI (.mid)
- **Advantages**:
  - Long-standing trusted source
  - Well-sequenced files
  - Individual file downloads
  - Consistent quality across collection

#### 2.2 Yo Tomita's Collection (Book II)
- **URL**: [qub.ac.uk/tomita/midi.html](https://www.qub.ac.uk/tomita/midi.html)
- **Status**: Public domain (deposited August 17, 1993)
- **Quality**: ⭐⭐⭐⭐⭐ Academic quality
- **Description**: Professionally sequenced WTC Book II
- **Coverage**: Book II only (BWV 870-893)
- **Format**: MIDI (.mid)
- **Advantages**: Academic precision, historical significance

#### 2.3 Bach Central
- **URL**: [bachcentral.com/midiindexcomplete.html](https://www.bachcentral.com/midiindexcomplete.html)
- **Status**: Public domain
- **Quality**: ⭐⭐⭐⭐ Good quality
- **Description**: Complete Bach MIDI index
- **Coverage**: Well-Tempered Clavier Part I available
- **Format**: MIDI (.mid)

#### 2.4 Piano-MIDI.de
- **URL**: [piano-midi.de/bach.htm](http://piano-midi.de/bach.htm)
- **Status**: Public domain
- **Quality**: ⭐⭐⭐⭐ Performance-oriented
- **Description**: Classical piano MIDI sequences
- **Coverage**: Various Bach works including WTC
- **Format**: MIDI (.mid)

#### 2.5 Open Well-Tempered Clavier (MuseScore Export)
- **URL**: [welltemperedclavier.org](https://welltemperedclavier.org/)
- **Status**: Public domain
- **Quality**: ⭐⭐⭐⭐⭐ Matches MusicXML quality
- **Description**: MIDI export from official MuseScore edition
- **Coverage**: Complete Books I & II
- **Format**: MIDI (.mid) - exported from MuseScore
- **Advantages**: Guaranteed consistency with MusicXML source

### Quality Comparison

| Source | Quality | Coverage | Consistency | Recommendation |
|--------|---------|----------|-------------|----------------|
| Kunstderfuge | ⭐⭐⭐⭐⭐ | Complete | Excellent | Primary |
| Tomita (Book II) | ⭐⭐⭐⭐⭐ | Book II only | Excellent | Book II primary |
| Open WTC Export | ⭐⭐⭐⭐⭐ | Complete | Excellent | Matches MusicXML |
| Bach Central | ⭐⭐⭐⭐ | Partial | Good | Supplementary |
| Piano-MIDI.de | ⭐⭐⭐⭐ | Varies | Good | Supplementary |

**RECOMMENDED PRIMARY SOURCE**: Kunstderfuge for downloadable MIDI, Open WTC MuseScore export for MusicXML-consistent MIDI

---

## 3. Piano Sample Libraries

### Current Implementation

#### 3.1 Salamander Grand Piano
- **Repository**: [github.com/tambien/Piano](https://github.com/tambien/Piano)
- **Official Samples**: [github.com/sfzinstruments/SalamanderGrandPiano](https://github.com/sfzinstruments/SalamanderGrandPiano)
- **Status**: Public domain (as of March 4, 2022)
- **Quality**: ⭐⭐⭐⭐⭐ Professional studio recording
- **Integration**: Via Tone.js (@tonejs/piano package)
- **Specifications**:
  - Instrument: Yamaha C5 Grand Piano
  - Velocity layers: Up to 16
  - Sampling: Every third note across 88 keys
  - Format: Various (MP3, FLAC, OGG)
  - Sample rate: 48kHz
  - Bit depth: 24-bit
  - Features: Hammer noise releases, string resonance releases (3 layers)

#### 3.2 Tone.js Piano Package
- **Package**: `@tonejs/piano`
- **CDN**: [jsdelivr.com/package/npm/@tonejs/piano](https://www.jsdelivr.com/package/npm/@tonejs/piano)
- **Installation**: `npm install --save @tonejs/piano`
- **Dependencies**: Requires Tone.js as peer dependency
- **Advantages**:
  - Web Audio API optimized
  - Pre-configured for immediate use
  - Multi-velocity support
  - Efficient loading and streaming

### Alternative Free Sample Libraries

#### 3.3 Raw Salamander Samples (Direct)
- **Archive**: archive.org/details/SalamanderGrandPianoV3
- **Format**: Original recordings, multiple formats
- **Use Case**: Custom implementations, offline processing
- **Advantage**: Full control over sample processing

#### 3.4 Salamander MP3 Samples
- **GitHub**: [github.com/darosh/samples-piano-mp3](https://github.com/darosh/samples-piano-mp3)
- **Package**: `@audio-samples/piano-mp3-pedals`
- **Format**: MP3 (compressed)
- **Velocity Layers**: 1-16 configurable
- **Advantage**: Smaller file sizes, faster loading

#### 3.5 Salamander VST Plugin
- **Source**: [plugins4free.com/plugin/2564](https://plugins4free.com/plugin/2564/)
- **Developer**: bigcat Instruments
- **Format**: VST plugin (not web-compatible)
- **Use Case**: Reference recordings, desktop applications

#### 3.6 Salamander SFZ Format
- **GitHub**: Available in various repos with ARIA extensions
- **Format**: SFZ + FLAC
- **Use Case**: Custom samplers, alternative implementations

### Recommendation

**CURRENT CHOICE**: Salamander Grand Piano via @tonejs/piano package
- No change needed - optimal for web deployment
- Public domain status confirmed
- Professional quality suitable for classical music
- Efficient implementation

**ALTERNATIVE IF NEEDED**: Direct Salamander MP3 samples for reduced bandwidth requirements

---

## 4. Acquisition Strategy

### Automated Download Approach

#### 4.1 MusicXML Acquisition
```bash
# Strategy: Clone/download Open WTC from MuseScore
# Location: scripts/download-musicxml.sh

# Step 1: Download MuseScore files from welltemperedclavier.org
# Method: Direct download links or MuseScore API

# Step 2: Export to MusicXML using MuseScore CLI
musescore3 -o output.musicxml input.mscz

# Step 3: Validate MusicXML structure
python scripts/validate-musicxml.py output.musicxml
```

#### 4.2 MIDI Acquisition
```bash
# Strategy: Download from Kunstderfuge with fallback sources
# Location: scripts/download-midi.sh

# Step 1: Automated download from Kunstderfuge
# Method: wget/curl with proper user-agent and rate limiting

# Step 2: Fallback to Open WTC MuseScore export if needed
musescore3 -o output.mid input.mscz

# Step 3: Validate MIDI structure and playback
python scripts/validate-midi.py output.mid
```

#### 4.3 Rate Limiting and Etiquette
- **Delay between downloads**: 2-3 seconds minimum
- **User-agent**: Identify as "Clavier Project / Educational Use"
- **Respect robots.txt**: Check before automated downloads
- **Batch processing**: Download during off-peak hours
- **Caching**: Store downloads locally to avoid re-fetching

### Manual Curation Requirements

#### Primary Manual Tasks:
1. **Quality Verification**: Listen to/review each file
2. **Metadata Validation**: Verify BWV numbers, keys, titles
3. **Performance Selection**: Choose between multiple MIDI renditions
4. **Error Correction**: Fix obvious MIDI/MusicXML errors
5. **Licensing Documentation**: Track source for each file

#### Manual Curation Checklist:
- [ ] Download from primary source
- [ ] Validate file format and structure
- [ ] Check musical accuracy against reference score
- [ ] Verify metadata (BWV, key, tempo markings)
- [ ] Test playback/rendering
- [ ] Document source and license
- [ ] Rename according to convention
- [ ] Store in appropriate directory

### License Compliance

#### Public Domain Verification Process:
1. **Source Documentation**: Track original source URL
2. **License File**: Maintain LICENSE.md with attributions
3. **Metadata Embedding**: Include source info in file headers
4. **Version Tracking**: Record edition/version used
5. **Attribution**: Credit creators (Ishizaka, MuseScore team, etc.)

#### Required Attributions:
- **Open WTC**: "Open Well-Tempered Clavier by Kimiko Ishizaka and MuseScore team, CC0 Public Domain"
- **Salamander Piano**: "Salamander Grand Piano V3 by Alexander Holm, Public Domain"
- **Kunstderfuge**: "Kunstderfuge Classical Music MIDI Archive, Public Domain"

---

## 5. File Naming Convention

### Proposed Structure

```
BWV-{number}-{book}-{type}-{key}.{ext}
```

### Components:
- **BWV number**: 846-893 (3 digits)
- **Book**: "book1" or "book2"
- **Type**: "prelude" or "fugue"
- **Key**: Full key signature (e.g., "c-major", "c-sharp-minor")
- **Extension**: "musicxml", "mid", "mscz", etc.

### Examples:
```
BWV-846-book1-prelude-c-major.musicxml
BWV-846-book1-fugue-c-major.musicxml
BWV-846-book1-prelude-c-major.mid
BWV-869-book1-fugue-a-major.musicxml
BWV-870-book2-prelude-c-major.mid
BWV-893-book2-fugue-b-minor.musicxml
```

### Directory Structure:
```
music-files/
├── musicxml/
│   ├── book1/
│   │   ├── BWV-846-book1-prelude-c-major.musicxml
│   │   ├── BWV-846-book1-fugue-c-major.musicxml
│   │   └── ...
│   └── book2/
│       ├── BWV-870-book2-prelude-c-major.musicxml
│       └── ...
├── midi/
│   ├── book1/
│   │   ├── BWV-846-book1-prelude-c-major.mid
│   │   └── ...
│   └── book2/
│       └── ...
├── source/
│   ├── musescore/
│   │   ├── book1/
│   │   └── book2/
│   └── lilypond/
├── metadata/
│   ├── sources.json
│   └── catalog.json
└── LICENSE.md
```

### Metadata Files:

#### sources.json
```json
{
  "BWV-846-book1-prelude-c-major": {
    "source": "Open Well-Tempered Clavier",
    "url": "https://welltemperedclavier.org/",
    "license": "CC0 Public Domain",
    "date_acquired": "2025-12-29",
    "format": "musicxml",
    "edition": "Olivier Miquel / MuseScore",
    "quality_check": "passed",
    "notes": ""
  }
}
```

#### catalog.json
```json
{
  "book1": [
    {
      "bwv": "846",
      "key": "C major",
      "prelude": {
        "musicxml": "BWV-846-book1-prelude-c-major.musicxml",
        "midi": "BWV-846-book1-prelude-c-major.mid"
      },
      "fugue": {
        "musicxml": "BWV-846-book1-fugue-c-major.musicxml",
        "midi": "BWV-846-book1-fugue-c-major.mid"
      },
      "voices": 4
    }
  ]
}
```

---

## 6. Quality Validation

### MusicXML Rendering Test

#### Validation Criteria:
1. **Structural Validity**: XML schema compliance
2. **Musical Accuracy**: Notes, rhythms, articulations correct
3. **Metadata Completeness**: Title, composer, key, tempo present
4. **Rendering Quality**: Clean display in notation software
5. **Voice Separation**: Properly defined parts/voices

#### Validation Script: `scripts/validate-musicxml.py`
```python
# Checks:
- XML schema validation (MusicXML DTD)
- Required elements present (part-list, score-partwise)
- Measure numbering consistency
- Clef, key signature, time signature presence
- Note/rest duration sum matches measure length
- Articulation and dynamic markings
```

#### Tools:
- **MuseScore**: Visual rendering test
- **music21 library**: Python-based validation
- **MusicXML schema validator**: W3C XML validation

### MIDI Playback Verification

#### Validation Criteria:
1. **File Integrity**: Valid MIDI header and structure
2. **Track Organization**: Proper track/channel assignment
3. **Timing Accuracy**: Tempo and note durations correct
4. **Velocity Variation**: Dynamic expression present
5. **No Artifacts**: Clean audio, no clicks/pops
6. **Pedaling**: Sustain pedal events where appropriate

#### Validation Script: `scripts/validate-midi.py`
```python
# Checks:
- MIDI file format (0, 1, or 2)
- Track count and structure
- Tempo map presence
- Note-on/note-off pairing
- Velocity range (0-127)
- Channel assignments
- Program change messages
- Control change messages (sustain pedal)
```

#### Tools:
- **mido library**: Python MIDI parsing
- **Tone.js**: Web Audio playback test
- **FluidSynth**: Command-line synthesis test

### Metadata Completeness Check

#### Required Metadata:
- **BWV Number**: 846-893
- **Book**: I or II
- **Key Signature**: Major/Minor key
- **Time Signature**: 4/4, 3/4, etc.
- **Tempo Indication**: If specified by editor
- **Piece Type**: Prelude or Fugue
- **Voice Count**: For fugues (3, 4, or 5 voices)
- **Source Attribution**: Edition/editor information
- **License**: Public domain status

#### Validation Script: `scripts/validate-metadata.py`
```python
# Checks:
- All required fields present
- BWV number in valid range
- Key signature matches catalog
- Source URL accessible
- License information complete
```

### Automated Validation Pipeline

```bash
#!/bin/bash
# scripts/validate-all.sh

for file in music-files/musicxml/**/*.musicxml; do
    python scripts/validate-musicxml.py "$file"
done

for file in music-files/midi/**/*.mid; do
    python scripts/validate-midi.py "$file"
done

python scripts/validate-metadata.py music-files/metadata/sources.json
python scripts/validate-metadata.py music-files/metadata/catalog.json

# Generate validation report
python scripts/generate-validation-report.py > docs/VALIDATION_REPORT.md
```

---

## 7. Implementation Roadmap

### Phase 1: Setup (Week 1)
- [ ] Create directory structure
- [ ] Set up validation scripts
- [ ] Configure download tools
- [ ] Document license requirements

### Phase 2: Acquisition (Week 2-3)
- [ ] Download Open WTC MuseScore files (Book I & II)
- [ ] Export to MusicXML format
- [ ] Download MIDI from Kunstderfuge
- [ ] Download Tomita Book II MIDI
- [ ] Verify Salamander Piano integration

### Phase 3: Validation (Week 3-4)
- [ ] Run MusicXML validation suite
- [ ] Run MIDI validation suite
- [ ] Manual quality checks (sample 10% of files)
- [ ] Generate validation reports
- [ ] Fix any errors discovered

### Phase 4: Organization (Week 4)
- [ ] Rename files according to convention
- [ ] Organize into directory structure
- [ ] Create metadata JSON files
- [ ] Document sources and licenses
- [ ] Create catalog.json

### Phase 5: Integration (Week 5)
- [ ] Integrate with Clavier application
- [ ] Test file loading and playback
- [ ] Verify visualization rendering
- [ ] Performance testing
- [ ] User acceptance testing

---

## 8. References and Resources

### Primary Sources
- [Open Well-Tempered Clavier](https://welltemperedclavier.org/)
- [MuseScore Open WTC Edition](https://musescore.com/user/71163/scores/89742)
- [IMSLP Bach WTC Book I](https://imslp.org/wiki/Das_wohltemperierte_Klavier_I,_BWV_846-869)
- [IMSLP Bach WTC Book II](https://imslp.org/wiki/Das_wohltemperierte_Klavier_II,_BWV_870-893)
- [Kunstderfuge WTC I](https://www.kunstderfuge.com/bach/wtk1.htm)
- [Kunstderfuge WTC II](https://www.kunstderfuge.com/bach/wtk2.htm)

### Community Projects
- [OpenScore Project Blog](https://opensource.com/life/15/1/crowdsourcing-new-edition-bach-masterpiece)
- [MuseScore Public Review](https://blog.musescore.com/post/107310537632/public-review-open-well-tempered-clavier-edition)
- [GitHub musetrainer/library](https://github.com/musetrainer/library)
- [UCT Open Edition](https://open.uct.ac.za/items/d2a6887b-7196-4fbe-8b56-a469bf557f93)

### Technical Resources
- [Salamander Grand Piano GitHub](https://github.com/sfzinstruments/SalamanderGrandPiano)
- [Tone.js Piano Package](https://github.com/tambien/Piano)
- [MusicXML Specification](https://www.musicxml.com/)
- [MIDI Specification](https://www.midi.org/specifications)

### Tools and Libraries
- [MuseScore](https://musescore.org/) - Notation software
- [music21](http://web.mit.edu/music21/) - Python music analysis
- [mido](https://mido.readthedocs.io/) - Python MIDI library
- [Tone.js](https://tonejs.github.io/) - Web Audio framework

---

## 9. Contact and Contributions

For questions or suggestions regarding music file sources and quality:
- Open an issue in the project repository
- Consult the [CONTRIBUTING.md](../CONTRIBUTING.md) guidelines
- Review the [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)

---

**Last Updated**: 2025-12-29
**Document Version**: 1.0
**Status**: Research Complete - Ready for Implementation
