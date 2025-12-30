# Clavier: A Music Theory Learning Tool
## Comprehensive Product & Technical Specification

**Version**: 1.0  
**Last Updated**: December 2024  
**Author**: Brandon (with Claude)

---

## Executive Summary

Clavier is a personal music theory learning application that uses Bach's Well-Tempered Clavier (BWV 846-893) as the sole source text for situated, contextual music theory education. Rather than teaching theory abstractly and then applying it to examples, Clavier inverts this model: every theoretical concept emerges organically from the music itself, explained at an accessible level regardless of the concept's traditional "difficulty" classification.

The tool provides three complementary interaction modes—Measure-by-Measure Walkthrough, Guided Curriculum, and Theory Feature Explorer—unified by a shared data layer and consistent visual language. Users experience the WTC through synchronized score notation, piano keyboard visualization, and audio playback, accompanied by optional lecture-style narration.

**Key Differentiators**:
- Situated learning: Theory concepts taught in situ, not abstracted
- Unified source text: All 48 preludes and fugues as living examples
- Multi-modal presentation: Score, keyboard, audio, and narration synchronized
- Adaptive accessibility: Complex concepts presented accessibly; simple concepts enriched with context
- Exploratory architecture: Find every instance of any technique across the complete WTC

---

## Table of Contents

1. [Product Vision & Goals](#1-product-vision--goals)
2. [User Profile & Learning Context](#2-user-profile--learning-context)
3. [Content Foundation: The Well-Tempered Clavier](#3-content-foundation-the-well-tempered-clavier)
4. [Core Feature Specifications](#4-core-feature-specifications)
   - 4.1 [Unified Playback & Visualization System](#41-unified-playback--visualization-system)
   - 4.2 [Mode 1: Measure-by-Measure Walkthrough](#42-mode-1-measure-by-measure-walkthrough)
   - 4.3 [Mode 2: Guided Curriculum](#43-mode-2-guided-curriculum)
   - 4.4 [Mode 3: Theory Feature Explorer](#44-mode-3-theory-feature-explorer)
5. [User Interface Specification](#5-user-interface-specification)
   - 5.1 [Design System & Visual Language](#51-design-system--visual-language)
   - 5.2 [Layout Architecture](#52-layout-architecture)
   - 5.3 [Navigation & Information Architecture](#53-navigation--information-architecture)
   - 5.4 [Responsive Behavior](#54-responsive-behavior)
   - 5.5 [Accessibility Requirements](#55-accessibility-requirements)
6. [Audio & Narration System](#6-audio--narration-system)
7. [Data Architecture](#7-data-architecture)
   - 7.1 [Score Data Model](#71-score-data-model)
   - 7.2 [Theory Annotation Schema](#72-theory-annotation-schema)
   - 7.3 [Curriculum & Progress Model](#73-curriculum--progress-model)
   - 7.4 [Feature Taxonomy](#74-feature-taxonomy)
8. [Content Pipeline](#8-content-pipeline)
   - 8.1 [Score Data Acquisition & Processing](#81-score-data-acquisition--processing)
   - 8.2 [Theory Content Generation](#82-theory-content-generation)
   - 8.3 [Audio Narration Production](#83-audio-narration-production)
   - 8.4 [Quality Assurance Process](#84-quality-assurance-process)
9. [Technical Architecture](#9-technical-architecture)
   - 9.1 [Platform & Deployment](#91-platform--deployment)
   - 9.2 [Frontend Architecture](#92-frontend-architecture)
   - 9.3 [Backend Services](#93-backend-services)
   - 9.4 [Data Storage](#94-data-storage)
   - 9.5 [Performance Requirements](#95-performance-requirements)
10. [Future Considerations](#10-future-considerations)
11. [Project Phases & Milestones](#11-project-phases--milestones)
12. [Appendices](#12-appendices)

---

## 1. Product Vision & Goals

### 1.1 Vision Statement

To create an immersive, personal music theory education experience where the Well-Tempered Clavier serves not as an illustration of theory but as the source from which theory understanding emerges—enabling deep comprehension of Western music's harmonic and contrapuntal foundations through one of its greatest exemplars.

### 1.2 Primary Goals

1. **Situated Learning**: Every music theory concept is encountered within actual musical context, never as an abstract rule divorced from sound
2. **Comprehensive Coverage**: All 48 preludes and fugues available as learning material, representing diverse keys, textures, and compositional techniques
3. **Accessibility Without Dumbing Down**: Present advanced concepts (stretto, inversion, augmentation) at an accessible level when they appear, rather than deferring them to "advanced" modules
4. **Multi-Sensory Integration**: Combine visual (score, keyboard), auditory (playback, narration), and textual (explanations) modalities
5. **Exploratory Discovery**: Enable finding patterns, comparing examples, and building personal understanding through navigation and search

### 1.3 Non-Goals (Explicit Exclusions)

- Gamification, points, streaks, or competitive elements
- Social features, sharing, or community
- Support for music beyond the Well-Tempered Clavier
- Real-time performance evaluation (deferred to future version)
- Mobile-first design (desktop-first, with tablet support)
- Commercial viability or monetization

### 1.4 Success Metrics (Personal)

- Completion of full walkthrough for at least 12 pieces (25% of WTC)
- Ability to identify and name harmonic progressions while listening
- Confidence in analyzing new Bach keyboard works independently
- Understanding of fugal construction sufficient to follow analytical discussions

---

## 2. User Profile & Learning Context

### 2.1 Primary User: Brandon

**Background**:
- Adult learner with strong analytical and technical skills
- Experience in education and educational technology
- No formal music theory training; self-directed learner
- Owns Schirmer edition of WTC Books 1 & 2
- Actively listens to WTC recordings (primarily via Spotify)
- Comfortable with technical interfaces and developer tools

**Learning Style**:
- Prefers understanding "why" over memorizing "what"
- Benefits from multiple representations of the same concept
- Values efficiency; dislikes repetitive drill without context
- Learns well through exploration and self-directed navigation
- Appreciates systematic organization with flexibility to jump around

**Current Knowledge Level**:
- Can read treble and bass clef (basic)
- Understands major/minor distinction conceptually
- Limited chord vocabulary beyond major, minor, diminished
- No Roman numeral analysis experience
- No counterpoint or voice-leading knowledge
- Familiar with octave designations (C4 = middle C)

**Goals**:
- Understand harmonic language of Baroque keyboard music
- Follow and appreciate fugal construction
- Develop analytical listening skills
- Build vocabulary for discussing music theory
- Eventually: perform WTC preludes at piano (separate from this tool)

### 2.2 Learning Context

**Environment**: Home office, desktop computer, external speakers or headphones
**Session Length**: 20-60 minutes typically; occasional longer deep-dive sessions
**Frequency**: 3-5 sessions per week, variable
**Attention State**: Focused study, not background activity

---

## 3. Content Foundation: The Well-Tempered Clavier

### 3.1 Corpus Overview

| Attribute | Value |
|-----------|-------|
| Composer | Johann Sebastian Bach (1685-1750) |
| BWV Numbers | 846-869 (Book I), 870-893 (Book II) |
| Total Pieces | 48 (24 prelude-fugue pairs × 2 books) |
| Key Coverage | All 24 major and minor keys, each book |
| Composition Dates | Book I: 1722; Book II: 1742 |
| Copyright Status | Public domain worldwide |
| Estimated Total Measures | ~4,500 |
| Estimated Total Duration | ~4.5 hours |

### 3.2 Pedagogical Suitability

The WTC is ideal for situated music theory learning because:

1. **Key Diversity**: Every major and minor key appears, enabling comparison of relative/parallel key relationships
2. **Textural Range**: From simple two-voice invention-style to complex five-voice fugues
3. **Harmonic Variety**: Standard progressions, chromatic alterations, modulations, sequences
4. **Contrapuntal Techniques**: Imitation, inversion, augmentation, diminution, stretto, pedal point
5. **Formal Clarity**: Preludes show diverse forms; fugues follow clear structural principles
6. **Historical Importance**: Central to Western music education; extensive scholarly literature available
7. **Graduated Complexity**: Some pieces genuinely simpler than others (C Major Prelude vs. B minor Fugue II)

### 3.3 Source Materials

**Primary Score Source**: Open Well-Tempered Clavier Project
- MuseScore files for all 48 pieces
- CC0 (public domain) license
- Export to MusicXML for measure-by-measure data
- Verified against scholarly editions

**MIDI/Audio Data**: 
- Derived from MuseScore files (synthesized)
- Alternative: Yo Tomita collection (corrected MIDI)
- Alternative: KernScores Humdrum files converted via Verovio

**Pre-Existing Annotations**: Algomus Fugue Dataset
- 1,000+ annotations for Book I fugues
- Subject entries, counter-subjects, episodes, cadences, pedal points
- Published in Computer Music Journal (2015)
- Structured format convertible to project schema

**Reference Scores**: Schirmer Library editions (physical books owned by user)
- For verification and reading alongside tool
- Not digitized or included in application

---

## 4. Core Feature Specifications

### 4.1 Unified Playback & Visualization System

The playback and visualization system is shared across all three interaction modes. It provides synchronized presentation of the music through multiple representations.

#### 4.1.1 Score View

**Description**: Rendered music notation from MusicXML source, displayed as traditional staff notation.

**Requirements**:
- Grand staff (treble + bass clef) display for all pieces
- Measure numbers displayed at regular intervals (every system start minimum)
- Current playback position indicated by vertical cursor line
- Active notes highlighted during playback
- Voice-specific coloring option (soprano, alto, tenor, bass in distinct colors)
- Annotation overlay capability (Roman numerals, form labels, etc.)
- Zoom controls (50%-200% scaling)
- Horizontal scrolling follows playback automatically
- Click-to-seek: clicking any note or measure jumps playback to that position
- Measure range highlighting for selected passages

**Visual Specifications**:
- Staff line color: Dark gray (#374151)
- Note color (default): Black (#111827)
- Voice colors (when enabled):
  - Soprano: Blue (#2563EB)
  - Alto: Green (#059669)
  - Tenor: Orange (#D97706)
  - Bass: Purple (#7C3AED)
- Playback cursor: Semi-transparent accent color, 2px width
- Active note highlight: Background glow or increased saturation

#### 4.1.2 Keyboard View

**Description**: Visual piano keyboard showing notes as they play, with optional sustained/anticipated note display.

**Requirements**:
- 88-key piano keyboard representation (A0-C8)
- Automatic view centering on active register (show 2-3 octaves around played notes)
- Active keys highlighted during playback
- Voice-specific coloring matching score view colors
- Key labels option (note names on white keys)
- Touch/click to play individual notes (audio feedback)
- Chord diagram overlay option (when harmonic analysis active)

**Visual Specifications**:
- White key dimensions: 24px × 120px (adjustable with zoom)
- Black key dimensions: 14px × 75px
- Active key highlight: Voice color with 80% opacity
- Sustain indication: Lighter shade remaining after note release
- Keyboard background: Light neutral (#F9FAFB)

#### 4.1.3 Combined View

**Description**: Default layout showing score above, keyboard below, synchronized during playback.

**Requirements**:
- Vertical split layout with adjustable divider
- Score occupies approximately 60% of vertical space by default
- Keyboard occupies approximately 40% of vertical space by default
- Both views scroll/update in sync during playback
- Draggable divider to adjust proportions
- Collapse option for either view (icon toggle)

#### 4.1.4 Playback Controls

**Transport Controls**:
- Play/Pause (spacebar shortcut)
- Stop (return to beginning)
- Previous measure / Next measure (arrow keys)
- Previous beat / Next beat (shift+arrow)
- Loop selection (set A and B points)
- Return to loop start

**Tempo Controls**:
- Tempo slider: 25%-150% of base tempo
- Base tempo stored per piece (from source or set by user)
- Tap tempo option
- Common tempo presets (50%, 75%, 100%)

**Display During Playback**:
- Current measure number
- Current beat within measure
- Elapsed time / Total duration
- Tempo (BPM)
- Loop indicator (when active)

#### 4.1.5 Audio Engine Requirements

- Latency: <50ms from note-on to sound (target <20ms)
- Polyphony: Minimum 32 simultaneous voices
- Sample quality: Acoustic piano samples (Salamander or equivalent)
- Volume control with mute option
- No audio clipping or distortion at any dynamic level
- Graceful handling of browser audio context restrictions

---

### 4.2 Mode 1: Measure-by-Measure Walkthrough

**Purpose**: Guided, linear exploration of individual pieces with contextual theory explanations for each measure, building understanding progressively as the music unfolds.

#### 4.2.1 Mode Overview

The walkthrough presents one piece (prelude or fugue) at a time, offering detailed theory commentary that moves through the music measure by measure. Unlike a textbook that explains concepts and then shows examples, the walkthrough explains what is happening in this specific measure, relating it to what came before and what follows.

#### 4.2.2 Walkthrough Content Structure

**Piece Introduction** (displayed before walkthrough begins):
- Key and mode (e.g., "C Major")
- Piece type (Prelude or Fugue)
- Approximate duration
- Brief character description (1-2 sentences)
- Notable features or techniques present
- Suggested listening focus points
- For fugues: Number of voices, subject length in measures

**Measure Commentary Elements**:

Each measure may include any combination of:

| Element | Description | Display |
|---------|-------------|---------|
| Harmonic Analysis | Roman numeral with inversion, secondary dominants | Overlay on score + text |
| Melodic Commentary | Subject entries, sequences, motives | Text + score highlighting |
| Rhythmic Notes | Significant rhythmic features, syncopation, hemiola | Text |
| Contrapuntal Observations | Voice relationships, counterpoint species implied | Text + voice coloring |
| Formal Position | Where this fits in overall structure | Progress indicator |
| Performance Notes | Articulation, phrasing, fingering concepts | Text (optional layer) |
| Connections | References to previous/upcoming measures | Hyperlinks |
| Terminology Introductions | First occurrence of new terms | Inline definitions |

**Contextual Awareness Requirements**:
- Each measure's explanation must reference relevant prior context
- Forward references when current events set up future resolutions
- Recurring patterns noted on subsequent occurrences ("as we saw in measure 8...")
- No measure explanation should feel isolated or context-free

#### 4.2.3 Walkthrough User Interface

**Primary Layout**:
- Score view (top, ~50% height)
- Commentary panel (bottom, ~50% height)
- Minimal transport controls (inline with layout)

**Commentary Panel Contents**:
- Current measure number and beat range
- Prose explanation (2-5 sentences typical)
- Terminology callouts (highlighted, hoverable for definitions)
- "Learn more" links to related curriculum modules
- "See also" links to other instances of same technique (Explorer)

**Navigation**:
- Previous/Next measure buttons
- Measure number direct input (jump to measure)
- Section/phrase jump points (preloaded)
- Piece selector (switch pieces without leaving mode)

**Playback Integration**:
- "Play this measure" button (loops current measure)
- "Play in context" button (plays 2 measures before through 2 after)
- "Continue from here" button (plays from current to end)
- Auto-advance option: automatically moves to next measure commentary when playback reaches it

**Audio Narration**:
- Play narration button (TTS of current measure's explanation)
- Auto-narrate toggle (narration plays automatically with music)
- Narration precedes playback by ~1 second when auto-narrate enabled
- Narration tempo adjustment independent of music tempo

#### 4.2.4 Walkthrough Progression

**Within-Piece Progress**:
- Visual progress bar showing measures visited
- Clear indication of "current position" in walkthrough
- Ability to jump to any measure regardless of completion
- "Mark as reviewed" for measures (affects progress tracking)

**Across-Piece Progress**:
- Dashboard showing walkthrough completion per piece
- Suggested next pieces based on curriculum alignment
- "Continue where I left off" option
- Filtering: by book, by key, by fugue voices, by completion status

#### 4.2.5 Adaptive Content Levels

**Terminology Handling**:
- First encounter: Full inline definition with example
- Subsequent encounters: Hoverable term with brief reminder tooltip
- User-controlled: "I know this term" to minimize future explanations
- Glossary: All terms accessible in searchable reference

**Explanation Depth**:
- Default level: Accessible to target user (Brandon's current level)
- "Tell me more" expandable sections for advanced detail
- "Simplify" option to reduce density (future enhancement)
- Depth preference remembered per session

---

### 4.3 Mode 2: Guided Curriculum

**Purpose**: Structured, progressive music theory education organized by concept rather than by piece, using WTC excerpts as examples for each topic. This mode answers: "I want to understand [concept]—teach me."

#### 4.3.1 Curriculum Architecture

**Organization Hierarchy**:
```
Domain
└── Unit
    └── Module
        └── Lesson
            └── Section
                └── Example (from WTC)
```

**Example Structure**:
```
Harmony (Domain)
└── Diatonic Harmony (Unit)
    └── Chord Functions (Module)
        └── The Dominant and Its Resolution (Lesson)
            └── What Makes a Chord "Dominant" (Section)
                └── BWV 846 Prelude, m. 4-5 (Example)
```

#### 4.3.2 Proposed Curriculum Outline

**Domain 1: Fundamentals**
- Unit 1.1: Staff Reading Review
  - Treble clef pitches
  - Bass clef pitches
  - Grand staff and middle C
  - Octave designations
- Unit 1.2: Rhythm Basics
  - Note values and rests
  - Meter and time signatures
  - Beat subdivision
  - Ties and dots
- Unit 1.3: Keys and Scales
  - Major scale construction
  - Minor scale variants (natural, harmonic, melodic)
  - Key signatures
  - Circle of fifths introduction

**Domain 2: Harmony**
- Unit 2.1: Triads and Seventh Chords
  - Triad construction (major, minor, diminished, augmented)
  - Seventh chord types
  - Chord inversions
  - Figured bass basics
- Unit 2.2: Diatonic Harmony
  - Chord functions (tonic, dominant, predominant)
  - Roman numeral analysis
  - Common progressions (I-IV-V-I, I-vi-IV-V)
  - Cadence types
- Unit 2.3: Applied Chords and Tonicization
  - Secondary dominants
  - Secondary leading-tone chords
  - Brief vs. extended tonicization
- Unit 2.4: Modulation
  - Closely related keys
  - Pivot chord modulation
  - Direct modulation
  - Modulation in fugue expositions

**Domain 3: Counterpoint**
- Unit 3.1: Voice Leading Fundamentals
  - Conjunct vs. disjunct motion
  - Parallel, similar, contrary, oblique motion
  - Forbidden parallels (5ths, octaves)
  - Voice crossing and spacing
- Unit 3.2: Two-Voice Counterpoint
  - First species principles
  - Rhythmic independence
  - Cadential patterns
- Unit 3.3: Three and Four-Voice Textures
  - Adding inner voices
  - Texture and register
  - Chorale-style voice leading
- Unit 3.4: Imitative Counterpoint
  - Canon and round
  - Imitation at different intervals
  - Free imitation

**Domain 4: Fugue**
- Unit 4.1: Fugue Basics
  - What is a fugue?
  - Subject and answer
  - Real vs. tonal answer
  - Countersubject
- Unit 4.2: Fugal Exposition
  - Entry order
  - Redundant entries
  - Bridge passages (links)
- Unit 4.3: Fugal Development
  - Episodes and sequences
  - Subject manipulation (inversion, augmentation, diminution)
  - Stretto
  - Pedal point
- Unit 4.4: Fugal Form
  - Multi-exposition structures
  - Tonal plan of a fugue
  - Coda and final statement

**Domain 5: Form and Structure**
- Unit 5.1: Phrase Structure
  - Phrases and periods
  - Antecedent and consequent
  - Phrase extension and elision
- Unit 5.2: Prelude Forms in WTC
  - Arpeggiated/textural preludes
  - Binary and rounded binary
  - Invention-style preludes
  - Toccata-style preludes
- Unit 5.3: Sequences
  - Melodic sequences
  - Harmonic sequences
  - Sequence types (descending fifths, ascending 5-6)

**Domain 6: Advanced Topics**
- Unit 6.1: Chromaticism
  - Chromatic voice leading
  - Mode mixture
  - Augmented sixth chords
  - Neapolitan chord
- Unit 6.2: Complex Fugal Techniques
  - Double and triple fugue
  - Invertible counterpoint
  - Combining subjects

#### 4.3.3 Lesson Structure

Each Lesson follows a consistent structure:

**1. Concept Introduction** (~2-3 minutes reading)
- What is this concept?
- Why does it matter?
- Where will we encounter it?

**2. Guided Example** (~5-10 minutes)
- One WTC excerpt examined in detail
- Step-by-step walkthrough with synchronized playback
- Interactive score with annotations
- Narration available

**3. Recognition Practice** (~5 minutes)
- 2-3 additional WTC excerpts shown
- User identifies the concept in each
- Immediate feedback with explanation
- Listen and follow along

**4. Contextualization**
- How this concept relates to what's been learned
- Preview of how it will develop in future lessons
- Links to Explorer for all instances in WTC

**5. Summary and Terminology**
- Key terms defined
- Concept summary in 2-3 sentences
- "You can now..." capability statement

#### 4.3.4 Curriculum User Interface

**Curriculum Home**:
- Visual map of all domains, units, modules
- Progress overlay showing completion status
- Recommended next lessons highlighted
- Search/filter functionality

**Lesson View**:
- Step-by-step progression (sections as steps)
- Clear "Next" and "Previous" navigation
- Progress bar within lesson
- Exit to curriculum map
- Bookmark/save position

**Example Integration**:
- Embedded score view (smaller than full walkthrough)
- Synchronized playback
- Annotation overlays matching lesson content
- "Open in Walkthrough" link for full context
- "Find in Explorer" link for pattern discovery

#### 4.3.5 Progress Tracking

**Lesson Completion Criteria**:
- All sections viewed
- All examples played at least once
- Recognition practice attempted (score optional)

**Progress Visualization**:
- Domain-level completion percentage
- Unit-level checkmarks
- Lesson status: Not started / In progress / Completed
- Streak tracking (optional, non-emphasized)

**Adaptive Recommendations**:
- "Based on your walkthrough activity, you might be ready for [Module]"
- "You've encountered this concept 5 times—try the lesson?"
- Concept coverage map: which WTC pieces you've studied, which concepts they contain

---

### 4.4 Mode 3: Theory Feature Explorer

**Purpose**: Discovery-oriented navigation of the WTC by musical feature rather than by piece. This mode answers: "Show me all the examples of [technique] in the WTC."

#### 4.4.1 Feature Taxonomy

The Explorer organizes musical features into a searchable, filterable taxonomy:

**Category: Harmony**
- Cadence Types
  - Perfect Authentic Cadence (PAC)
  - Imperfect Authentic Cadence (IAC)
  - Half Cadence (HC)
  - Deceptive Cadence (DC)
  - Plagal Cadence
  - Phrygian Half Cadence
- Chord Progressions
  - Descending fifths sequence
  - Ascending 5-6 sequence
  - Pachelbel progression (I-V-vi-iii-IV-I-IV-V)
  - Lament bass (descending chromatic)
  - Circle of fifths segments
- Applied Chords
  - V/V (secondary dominant to dominant)
  - V/ii, V/iii, V/IV, V/vi (all secondary dominants)
  - vii°7/x (secondary leading tone)
- Special Chords
  - Neapolitan (♭II)
  - Augmented sixth variants
  - Diminished seventh uses
  - Augmented triads

**Category: Counterpoint**
- Voice Leading Events
  - Parallel 3rds/6ths
  - Voice exchange
  - Suspensions (4-3, 7-6, 9-8, 2-3)
  - Retardations
  - Anticipations
- Imitation Types
  - Subject entry (fugue)
  - Answer entry (fugue)
  - Canonic imitation
  - Free imitation
- Contrapuntal Devices
  - Stretto
  - Inversion
  - Augmentation
  - Diminution
  - Retrograde (rare)
  - Invertible counterpoint

**Category: Form**
- Structural Elements
  - Exposition (fugue)
  - Episode
  - Development section
  - Coda
  - Pedal point
- Phrase Events
  - Phrase beginning
  - Phrase ending/cadence
  - Sequence
  - Fragmentation
  - Extension

**Category: Texture**
- Voice Count Changes
  - Two-voice passages
  - Three-voice passages
  - Four-voice passages
  - Five-voice passages
  - Reduction to single voice
- Textural Types
  - Homophonic passages
  - Polyphonic passages
  - Arpeggiated texture
  - Chordal texture

**Category: Fugue-Specific**
- Subject/Answer
  - Subject statements (by key)
  - Real answers
  - Tonal answers
  - Modified subjects
- Countersubject
  - CS1 entries
  - CS2 entries (in double CS fugues)
  - Countersubject variants
- Episode Types
  - Sequential episodes
  - Modulatory episodes
  - Developmental episodes

#### 4.4.2 Explorer User Interface

**Search and Filter Panel**:
- Full-text search across feature names and descriptions
- Category tree with expand/collapse
- Multi-select filter (e.g., show all "stretto" AND "key of G minor")
- Key filter (major/minor, specific keys)
- Book filter (Book I, Book II, both)
- Piece type filter (Preludes, Fugues, both)
- Measure range filter (beginning/middle/end of pieces)

**Results Display**:
- List of matching instances
- Each result shows:
  - Piece identifier (BWV number, key, prelude/fugue)
  - Measure range
  - Brief description of this specific instance
  - Thumbnail score snippet
  - Difficulty/complexity indicator

**Result Sorting Options**:
- By piece order (BWV number)
- By measure number (earliest first)
- By curriculum relevance (matching current progress)
- By complexity (simpler examples first)
- Alphabetically by key

**Instance Detail View**:
- Score excerpt with feature highlighted
- Surrounding context (±4 measures)
- Play button for audio
- Full explanation of this instance
- Links to related curriculum lesson
- "Open in Walkthrough" navigation
- "See similar" suggestions

#### 4.4.3 Feature Instance Data

Each catalogued feature instance includes:

| Field | Description |
|-------|-------------|
| `id` | Unique identifier |
| `feature_id` | Reference to feature taxonomy |
| `piece_id` | BWV number and type |
| `measure_start` | Beginning measure |
| `measure_end` | Ending measure |
| `beat_start` | Beat within start measure |
| `beat_end` | Beat within end measure |
| `voices` | Which voices involved |
| `key_context` | Local key at this point |
| `description` | Specific explanation (1-3 sentences) |
| `difficulty` | 1-5 scale of complexity |
| `curriculum_refs` | Related lesson IDs |
| `related_instances` | Similar examples elsewhere |
| `annotations` | Score overlay data |

#### 4.4.4 Explorer Statistics and Insights

**Aggregate Views**:
- Feature frequency charts (which techniques appear most often?)
- Distribution by key (does Bach use more stretto in minor keys?)
- Distribution by book (differences between 1722 and 1742 compositions)
- Technique co-occurrence (what often appears with stretto?)

**Personal Insights**:
- Which features have you explored?
- Coverage map: features seen in context vs. not yet encountered
- Suggested exploration based on curriculum progress

---

## 5. User Interface Specification

### 5.1 Design System & Visual Language

#### 5.1.1 Design Principles

1. **Content-First**: The music score and explanations are primary; UI chrome should recede
2. **Calm and Focused**: Avoid visual noise that competes with musical attention
3. **Progressive Disclosure**: Show core features immediately; reveal advanced options on demand
4. **Consistent Patterns**: Same interactions work the same way across all modes
5. **Respectful of Tradition**: Score rendering should feel authoritative and traditional; UI can be modern

#### 5.1.2 Color Palette

**Primary Colors**:
- Background: #FFFFFF (pure white) or #F9FAFB (warm white)
- Text: #111827 (near-black)
- Accent: #2563EB (blue) – for interactive elements, links, current position
- Secondary Accent: #059669 (green) – for success, completion, "correct"

**Voice Colors** (consistent throughout):
- Soprano/Melody: #2563EB (blue)
- Alto: #059669 (green)
- Tenor: #D97706 (amber)
- Bass: #7C3AED (purple)

**Semantic Colors**:
- Error/Warning: #DC2626 (red)
- Information: #0891B2 (cyan)
- Neutral/Disabled: #9CA3AF (gray)

**Dark Mode** (optional enhancement):
- Background: #111827
- Text: #F9FAFB
- Accent colors adjusted for contrast compliance

#### 5.1.3 Typography

**Font Stack**:
- Primary text: Inter, system-ui, sans-serif
- Monospace (for technical notation): JetBrains Mono, monospace
- Score text (lyrics, annotations): Serif font matching score engraving

**Type Scale**:
- Body: 16px / 1.5 line-height
- Small: 14px / 1.4 line-height
- Caption: 12px / 1.4 line-height
- H1: 28px / 1.2 line-height
- H2: 22px / 1.3 line-height
- H3: 18px / 1.4 line-height

**Text Styling**:
- Music terminology: Italic on first use
- Interactive terms: Underline (dashed) + hover tooltip
- Measure references: Monospace, clickable

#### 5.1.4 Spacing System

Based on 4px grid:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

#### 5.1.5 Elevation and Depth

- Base content: No shadow
- Cards and panels: 0 1px 3px rgba(0,0,0,0.1)
- Modals and overlays: 0 4px 16px rgba(0,0,0,0.15)
- Tooltips: 0 2px 8px rgba(0,0,0,0.12)

#### 5.1.6 Motion and Animation

- Duration: 150ms for micro-interactions, 250ms for transitions
- Easing: ease-out for entering, ease-in for exiting
- Reduced motion: Respect prefers-reduced-motion media query
- Score cursor: Smooth animation matching playback tempo
- No decorative animations; all motion serves function

### 5.2 Layout Architecture

#### 5.2.1 Global Shell

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Clavier          [Mode Tabs]          [Settings] [Profile]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                       [Mode-Specific Content]                       │
│                                                                     │
│                                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Header** (fixed, 56px height):
- Logo and app name (left)
- Mode tabs: Walkthrough | Curriculum | Explorer (center)
- Settings and profile (right)
- Minimal, unobtrusive design

#### 5.2.2 Walkthrough Mode Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Piece Selector: BWV 846 Prelude in C Major]    [View: ≡] [···]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                        [SCORE VIEW - 60%]                           │
│     ══════════════════════════════════════════════════════════      │
│     𝄞 ... musical notation with cursor and highlighting ...        │
│     𝄢 ...                                                           │
│                                                                     │
├──────────────────────────────────────────────────────────────┬──────┤
│                     [KEYBOARD VIEW - 40%]                    │ ▲    │
│     ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐    │ │    │
│     │ │█│ │█│ │ │█│ │█│ │█│ │ │█│ │█│ │ │█│ │█│ │█│ │ │    │ │    │
│     │ │█│ │█│ │ │█│ │█│ │█│ │ │█│ │█│ │ │█│ │█│ │█│ │ │    │ │    │
│     │ └┬┘ └┬┘ │ └┬┘ └┬┘ └┬┘ │ └┬┘ └┬┘ │ └┬┘ └┬┘ └┬┘ │ │    │ ▼    │
│     │  │   │  │  │   │   │  │  │   │  │  │   │   │  │ │    │      │
│     └──┴───┴──┴──┴───┴───┴──┴──┴───┴──┴──┴───┴───┴──┴─┘    │      │
├─────────────────────────────────────────────────────────────────────┤
│ [◄] Measure 4 of 35                    [▶]    ⏮ ▶ ⏭  🔊 ─○── │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  COMMENTARY: Measure 4                                              │
│                                                                     │
│  The bass descends to E, creating an inverted tonic chord (I⁶).    │
│  The arpeggiated pattern continues with the same rhythm as the     │
│  previous measures, but notice how the harmonic color shifts...     │
│                                                                     │
│  [▶ Listen] [📖 Learn: Chord Inversions] [🔍 Find: I⁶ examples]    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### 5.2.3 Curriculum Mode Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Harmony > Diatonic Harmony > Chord Functions            [Map]    │
├──────────────────────┬──────────────────────────────────────────────┤
│                      │                                              │
│  LESSON OUTLINE      │   THE DOMINANT AND ITS RESOLUTION            │
│                      │                                              │
│  ✓ 1. Introduction   │   The V chord creates tension that          │
│  → 2. Guided Example │   naturally resolves to I. Listen to this   │
│    3. Practice       │   measure from the C Major Prelude:          │
│    4. Context        │                                              │
│    5. Summary        │   [Embedded Score: BWV 846, m. 11-12]       │
│                      │   [▶ Play]                                   │
│                      │                                              │
│                      │   Notice how the G in the bass creates an   │
│  ──────────────────  │   expectation that is satisfied when we     │
│                      │   arrive at C in the following measure...   │
│  Progress: 40%       │                                              │
│  ▓▓▓▓▓▓▓░░░░░░░░░   │                                              │
│                      │   [← Previous Section]  [Next Section →]     │
│                      │                                              │
└──────────────────────┴──────────────────────────────────────────────┘
```

#### 5.2.4 Explorer Mode Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🔍 Search features...                              [Filters ▼]     │
├──────────────────────┬──────────────────────────────────────────────┤
│                      │                                              │
│  FILTERS             │   RESULTS: "Stretto" (23 instances found)   │
│                      │                                              │
│  Category            │   ┌────────────────────────────────────────┐ │
│  ▼ Counterpoint      │   │ BWV 847 Fugue in C minor              │ │
│    ☑ Stretto         │   │ Measures 20-22                        │ │
│    ☐ Inversion       │   │ Three-voice stretto at one beat       │ │
│    ☐ Augmentation    │   │ [▶] [Open in Walkthrough]             │ │
│                      │   └────────────────────────────────────────┘ │
│  Key                 │   ┌────────────────────────────────────────┐ │
│  [All Keys     ▼]    │   │ BWV 849 Fugue in C# minor             │ │
│                      │   │ Measures 35-38                        │ │
│  Book                │   │ Dense stretto with inversion          │ │
│  ☑ Book I            │   │ [▶] [Open in Walkthrough]             │ │
│  ☑ Book II           │   └────────────────────────────────────────┘ │
│                      │                                              │
│  Type                │   ┌────────────────────────────────────────┐ │
│  ☐ Preludes          │   │ BWV 853 Fugue in E♭ minor             │ │
│  ☑ Fugues            │   │ Measures 45-49                        │ │
│                      │   │ Four-voice stretto, subject in bass   │ │
│  ──────────────────  │   │ [▶] [Open in Walkthrough]             │ │
│  [Clear All Filters] │   └────────────────────────────────────────┘ │
│                      │                                              │
└──────────────────────┴──────────────────────────────────────────────┘
```

### 5.3 Navigation & Information Architecture

#### 5.3.1 Primary Navigation

**Mode Switching**:
- Always visible in header
- Current mode visually indicated (underline, background, or color)
- Mode switch preserves context when possible:
  - Walkthrough → Curriculum: "Learn about the concept you just saw"
  - Walkthrough → Explorer: "Find more examples of this technique"
  - Curriculum → Walkthrough: "See this in the piece context"
  - Explorer → Walkthrough: "Open this instance in full context"

**Within-Mode Navigation**:
- Breadcrumbs for hierarchical modes (Curriculum, Explorer categories)
- Piece selector for Walkthrough (dropdown or search)
- Back button respects mode-specific history

#### 5.3.2 Cross-Mode Links

Common patterns that should be one-click:

| From | To | Context |
|------|-----|---------|
| Walkthrough measure commentary | Curriculum lesson | "Learn about [concept]" |
| Walkthrough measure commentary | Explorer search | "Find more [technique]" |
| Curriculum example | Walkthrough | "See full piece context" |
| Curriculum lesson | Explorer | "All instances in WTC" |
| Explorer instance | Walkthrough | "Open in context" |
| Explorer instance | Curriculum | "Learn about this" |

#### 5.3.3 URL Structure

All views should have bookmarkable URLs:

```
/walkthrough/bwv-846/prelude           # Piece at beginning
/walkthrough/bwv-846/prelude/m/15      # Specific measure
/walkthrough/bwv-846/prelude/m/15-20   # Measure range

/curriculum                             # Curriculum overview
/curriculum/harmony                     # Domain
/curriculum/harmony/diatonic           # Unit
/curriculum/harmony/diatonic/functions # Module
/curriculum/harmony/diatonic/functions/dominant  # Lesson

/explore                                # Explorer home
/explore?q=stretto                      # Search query
/explore?category=counterpoint&feature=stretto&book=1  # Filtered
/explore/instance/abc123                # Specific instance
```

### 5.4 Responsive Behavior

#### 5.4.1 Breakpoints

- Large Desktop: ≥1440px (full experience)
- Desktop: 1024-1439px (standard experience)
- Tablet Landscape: 768-1023px (adapted layout)
- Tablet Portrait: 600-767px (simplified layout)
- Mobile: <600px (minimal, read-only experience)

#### 5.4.2 Adaptation Strategy

**Desktop (1024px+)**:
- All features available
- Multi-column layouts
- Side-by-side panels
- Full keyboard visualization

**Tablet (768-1023px)**:
- Combined view becomes toggled (score OR keyboard, not both)
- Commentary panel slides up from bottom
- Filters in collapsible drawer
- Touch-optimized controls

**Tablet Portrait / Mobile (<768px)**:
- Single-column layout
- Score view prioritized; keyboard available but secondary
- Commentary in expandable accordion sections
- Simplified curriculum navigation
- Note: "This app is optimized for larger screens" advisory

### 5.5 Accessibility Requirements

#### 5.5.1 WCAG 2.1 AA Compliance

- All interactive elements keyboard accessible
- Focus indicators visible (2px accent color outline)
- Color contrast minimum 4.5:1 for text, 3:1 for large text and UI
- No information conveyed by color alone (combine with icons, text, pattern)

#### 5.5.2 Screen Reader Support

- Semantic HTML (proper headings, landmarks, buttons)
- ARIA labels for controls without visible text
- Live regions for dynamic content updates (measure changes, playback status)
- Skip links to main content

#### 5.5.3 Motor Accessibility

- Click targets minimum 44x44px
- No time-limited interactions
- Playback controllable via keyboard
- No hover-only functionality (hover reveals must be accessible via click/focus)

#### 5.5.4 Cognitive Accessibility

- Consistent navigation patterns
- Clear feedback for all actions
- Progress indicators for multi-step processes
- Ability to pause, stop, or hide any animation

#### 5.5.5 Audio Accessibility

- Visual playback indicator synchronized with audio
- Visual keyboard showing notes as they play
- All narration content available as readable text
- Captions/transcript option for narrated content

---

## 6. Audio & Narration System

### 6.1 Music Playback

#### 6.1.1 Audio Engine Requirements

**Core Capabilities**:
- MIDI-to-audio synthesis using sampled piano sounds
- Sample library: Salamander Grand Piano (or equivalent quality)
- Polyphony: Minimum 32 simultaneous voices
- Latency: Target <20ms; acceptable <50ms
- Volume normalization across pieces
- Fade in/out for non-jarring starts/stops

**Playback Features**:
- Variable tempo (25%-150% of base)
- A-B looping with configurable loop points
- Measure-accurate seeking
- Beat-accurate position tracking for UI synchronization
- Sustain pedal interpretation from MIDI data

**Browser Compatibility**:
- Chrome, Firefox, Safari, Edge (latest versions)
- Graceful handling of AudioContext autoplay restrictions
- Fallback messaging if Web Audio unavailable

#### 6.1.2 Synchronization Requirements

The audio engine must emit events for UI synchronization:

| Event | Data | Purpose |
|-------|------|---------|
| `noteOn` | pitch, velocity, voice, time | Highlight note on score and keyboard |
| `noteOff` | pitch, voice, time | Remove highlight |
| `measureChange` | measureNumber, time | Update measure indicator; advance walkthrough |
| `beatChange` | beatNumber, time | Fine-grained position tracking |
| `playbackStart` | startMeasure, startBeat | Initialize UI state |
| `playbackStop` | endMeasure, endBeat, completed | Update UI state |
| `loopPoint` | direction (start/end) | Visual loop indicator |

Synchronization accuracy: Events must fire within 10ms of their audio time.

### 6.2 Text-to-Speech Narration

#### 6.2.1 TTS Provider Strategy

**Primary**: edge-tts (Microsoft Edge voices via Python library)
- Free, no API costs
- Good quality neural voices
- Supports SSML for pronunciation control
- Pre-generate all content during build process

**Fallback Options**:
- Piper TTS (open-source, runs locally)
- Mozilla TTS (open-source)
- Coqui TTS (open-source)

**Production Consideration**: All narration is pre-generated and stored as audio files (MP3/OGG). No runtime TTS calls.

#### 6.2.2 Voice Selection

**Recommended Voice Characteristics**:
- Clear, neutral accent (American or British English)
- Warm but professional tone (educational, not dramatic)
- Natural pacing suitable for instructional content
- Good handling of pauses and phrasing

**Suggested Voices (edge-tts)**:
- Primary: en-US-AriaNeural (clear, warm)
- Alternative: en-US-GuyNeural (male option)
- Alternative: en-GB-SoniaNeural (British alternative)

#### 6.2.3 Pronunciation Handling

Music theory contains Italian, German, French, and English terms requiring pronunciation attention:

**Italian Terms** (pronunciation guide embedded in SSML):
- Stretto: STREH-toh
- Fugue: FYOOG
- Pedal: Standard English
- Countersubject: Standard English

**SSML Lexicon Requirements**:
- Custom lexicon file with phonetic transcriptions
- IPA or provider-specific phoneme format
- Applied during audio generation

**Example SSML**:
```xml
<speak>
  The <phoneme alphabet="ipa" ph="ˈstrɛtoʊ">stretto</phoneme> 
  begins in measure 25, where the subject enters in close 
  <phoneme alphabet="ipa" ph="ɪmɪˈteɪʃən">imitation</phoneme>.
</speak>
```

#### 6.2.4 Narration Content Types

| Content Type | Typical Length | Use Context |
|--------------|---------------|-------------|
| Measure commentary | 15-45 seconds | Walkthrough mode |
| Lesson section narration | 1-3 minutes | Curriculum mode |
| Feature instance description | 15-30 seconds | Explorer mode |
| Concept definition | 10-20 seconds | Glossary / tooltips |
| Piece introduction | 1-2 minutes | Walkthrough start |

#### 6.2.5 Narration Synchronization

**With Music Playback**:
- Narration should be able to play before, during, or after music
- Option: "Narrate, then play" (explanation first, then music)
- Option: "Play, then narrate" (listen first, then explanation)
- Option: "Narrate over music" (lowered music volume, voice over)

**Implementation**:
- Store timing metadata with each narration clip
- Measure references in narration map to playback positions
- "Listen to measure 15" in narration triggers music playback of that measure

### 6.3 Audio File Management

#### 6.3.1 File Formats

- Music playback: MIDI interpreted in real-time (no audio files for music)
- Narration: MP3 (128kbps) for broad compatibility; OGG as progressive enhancement
- Total narration storage estimate: ~500MB for full WTC coverage

#### 6.3.2 Loading Strategy

- Narration audio loaded on-demand per piece/lesson
- Preload next likely narration clips during idle time
- Cache aggressively (narration content is static)
- Progressive loading indicator for first-time loads

---

## 7. Data Architecture

### 7.1 Score Data Model

#### 7.1.1 Piece Entity

```
Piece
├── id: UUID
├── bwv_number: Integer (846-893)
├── book: Integer (1 or 2)
├── number_in_book: Integer (1-24)
├── type: Enum (PRELUDE, FUGUE)
├── key_tonic: String (C, C#, D, Eb, etc.)
├── key_mode: Enum (MAJOR, MINOR)
├── time_signature: String (4/4, 3/4, etc.)
├── tempo_suggestion_bpm: Integer
├── total_measures: Integer
├── total_duration_seconds: Float
├── voice_count: Integer (for fugues)
├── subject_length_measures: Float (for fugues)
├── musicxml_path: String
├── midi_path: String
├── metadata: JSON
│   ├── schirmer_page_numbers: [Int]
│   ├── alternative_titles: [String]
│   └── composition_notes: String
└── created_at, updated_at: Timestamp
```

#### 7.1.2 Measure Entity

```
Measure
├── id: UUID
├── piece_id: FK → Piece
├── measure_number: Integer
├── beat_count: Integer
├── is_pickup: Boolean
├── is_final: Boolean
├── start_time_seconds: Float
├── end_time_seconds: Float
├── local_key: String (may differ from piece key)
├── local_mode: Enum
├── content_hash: String (for change detection)
└── musicxml_excerpt: Text (optional, for quick rendering)
```

#### 7.1.3 Note Entity (for detailed analysis)

```
Note
├── id: UUID
├── measure_id: FK → Measure
├── voice: Integer (1-5, where 1 is highest)
├── voice_name: Enum (SOPRANO, ALTO, TENOR, BASS)
├── pitch_class: String (C, C#, D, etc.)
├── octave: Integer (0-8)
├── midi_number: Integer (0-127)
├── start_beat: Float
├── duration_beats: Float
├── tied_from: FK → Note (nullable)
├── tied_to: FK → Note (nullable)
├── articulation: [String] (staccato, accent, etc.)
├── dynamic: String (nullable)
└── ornament: String (nullable)
```

### 7.2 Theory Annotation Schema

#### 7.2.1 Annotation Entity

```
Annotation
├── id: UUID
├── piece_id: FK → Piece
├── measure_start: Integer
├── measure_end: Integer
├── beat_start: Float
├── beat_end: Float
├── annotation_type: Enum (see below)
├── content: JSON (type-specific)
├── display_text: String
├── voices_involved: [Integer]
├── layer: Integer (for stacked annotations)
├── source: Enum (GENERATED, IMPORTED, MANUAL)
└── verified: Boolean
```

**Annotation Types**:
- `HARMONY`: Roman numeral, chord symbol, figured bass
- `CADENCE`: Cadence type and classification
- `FORM`: Structural label (exposition, episode, coda)
- `TECHNIQUE`: Contrapuntal device (stretto, inversion, sequence)
- `FUGUE_ELEMENT`: Subject, answer, countersubject entry
- `PHRASE`: Phrase boundary, extension, elision
- `PERFORMANCE`: Articulation guidance, suggested fingering

#### 7.2.2 Annotation Content Examples

**Harmony Annotation**:
```json
{
  "roman_numeral": "V7",
  "chord_symbol": "G7",
  "inversion": "root",
  "function": "dominant",
  "secondary": null,
  "figured_bass": "7"
}
```

**Fugue Element Annotation**:
```json
{
  "element_type": "subject",
  "entry_number": 3,
  "voice": "alto",
  "key": "G major",
  "modification": null,
  "is_answer": false
}
```

**Technique Annotation**:
```json
{
  "technique": "stretto",
  "distance_beats": 4,
  "voices": ["soprano", "alto"],
  "subject_complete": true,
  "overlapping_entries": 2
}
```

### 7.3 Curriculum & Progress Model

#### 7.3.1 Curriculum Structure Entities

```
Domain
├── id: UUID
├── name: String
├── description: Text
├── order_index: Integer
└── icon: String

Unit
├── id: UUID
├── domain_id: FK → Domain
├── name: String
├── description: Text
├── order_index: Integer
└── prerequisites: [FK → Unit]

Module
├── id: UUID
├── unit_id: FK → Unit
├── name: String
├── description: Text
├── order_index: Integer
└── estimated_duration_minutes: Integer

Lesson
├── id: UUID
├── module_id: FK → Module
├── name: String
├── description: Text
├── order_index: Integer
├── content_version: Integer
└── sections: JSON (see below)
```

**Lesson Sections Structure**:
```json
{
  "sections": [
    {
      "id": "intro",
      "type": "text",
      "title": "Introduction",
      "content": "Markdown content here...",
      "narration_audio_path": "/audio/lessons/lesson-123-intro.mp3"
    },
    {
      "id": "example1",
      "type": "guided_example",
      "title": "Guided Example",
      "piece_id": "uuid-of-bwv-846-prelude",
      "measure_range": [11, 12],
      "annotations": ["uuid-annotation-1", "uuid-annotation-2"],
      "walkthrough_text": "Markdown content here...",
      "narration_audio_path": "/audio/lessons/lesson-123-example1.mp3"
    },
    {
      "id": "practice",
      "type": "recognition",
      "title": "Recognition Practice",
      "examples": [
        {"piece_id": "uuid", "measure_range": [5, 6], "expected_answer": "V-I"},
        {"piece_id": "uuid", "measure_range": [15, 16], "expected_answer": "V-I"}
      ]
    },
    {
      "id": "summary",
      "type": "summary",
      "title": "Summary",
      "terms": ["dominant", "resolution", "V-I"],
      "key_points": ["Markdown list items"],
      "narration_audio_path": "/audio/lessons/lesson-123-summary.mp3"
    }
  ]
}
```

#### 7.3.2 Progress Tracking Entities

```
UserProgress
├── id: UUID
├── user_id: String (for future multi-user; can be "default")
├── entity_type: Enum (PIECE, MEASURE, LESSON, MODULE, UNIT, DOMAIN, FEATURE)
├── entity_id: UUID
├── status: Enum (NOT_STARTED, IN_PROGRESS, COMPLETED)
├── started_at: Timestamp
├── completed_at: Timestamp
├── last_accessed_at: Timestamp
├── metadata: JSON (type-specific progress data)
└── updated_at: Timestamp
```

**Measure Progress Metadata Example**:
```json
{
  "visited": true,
  "times_played": 5,
  "narration_heard": true,
  "marked_reviewed": true,
  "notes": "Need to revisit - unclear on the modulation"
}
```

### 7.4 Feature Taxonomy

#### 7.4.1 Feature Entity

```
Feature
├── id: UUID
├── name: String
├── slug: String (URL-friendly)
├── category: Enum (HARMONY, COUNTERPOINT, FORM, TEXTURE, FUGUE)
├── parent_feature_id: FK → Feature (nullable, for hierarchy)
├── description: Text
├── explanation_beginner: Text
├── explanation_intermediate: Text
├── explanation_advanced: Text
├── difficulty_level: Integer (1-5)
├── curriculum_lesson_ids: [FK → Lesson]
├── search_keywords: [String]
└── icon: String
```

#### 7.4.2 Feature Instance Entity

```
FeatureInstance
├── id: UUID
├── feature_id: FK → Feature
├── piece_id: FK → Piece
├── measure_start: Integer
├── measure_end: Integer
├── beat_start: Float
├── beat_end: Float
├── voices_involved: [Integer]
├── local_key: String
├── description: Text (specific to this instance)
├── complexity_score: Integer (1-5)
├── quality_score: Integer (1-5, how exemplary)
├── annotation_ids: [FK → Annotation]
├── related_instance_ids: [FK → FeatureInstance]
├── verified: Boolean
├── source: Enum (ALGOMUS, GENERATED, MANUAL)
└── metadata: JSON
```

---

## 8. Content Pipeline

### 8.1 Score Data Acquisition & Processing

#### 8.1.1 Source Materials

| Source | Format | Use | License |
|--------|--------|-----|---------|
| Open Well-Tempered Clavier | MuseScore (.mscz) | Primary score source | CC0 |
| MuseScore Export | MusicXML | Parsed for measure structure | CC0 |
| MuseScore Export | MIDI | Playback data | CC0 |
| KernScores (Humdrum) | Kern (.krn) | Alternative/verification | Public domain |
| Algomus Fugue Dataset | Custom XML | Pre-annotated fugue analysis | Academic |

#### 8.1.2 Processing Pipeline

**Step 1: Source Acquisition**
- Download MuseScore files from welltemperedclavier.org
- Verify completeness (all 48 pieces)
- Document version and date acquired

**Step 2: MusicXML Export**
- Export each MuseScore file to MusicXML via MuseScore CLI
- Validate XML structure
- Store both original and exported versions

**Step 3: MIDI Export**
- Export each MuseScore file to MIDI
- Verify note accuracy against MusicXML
- Normalize velocity and tempo

**Step 4: Structural Parsing**
- Parse MusicXML into database entities (Piece, Measure, Note)
- Extract measure boundaries, time signatures, key signatures
- Calculate timing data based on tempo

**Step 5: Algomus Integration (Book I Fugues)**
- Parse Algomus XML annotations
- Map to database annotation schema
- Cross-reference with parsed measures

**Step 6: Verification**
- Spot-check measure counts against Schirmer edition
- Verify key signatures
- Validate note counts for complex passages

### 8.2 Theory Content Generation

#### 8.2.1 Content Types and Volume

| Content Type | Count | Avg Length | Total Words | Generation Method |
|--------------|-------|------------|-------------|-------------------|
| Piece introductions | 48 | 200 words | 9,600 | LLM |
| Measure commentaries | ~4,500 | 75 words | 337,500 | LLM |
| Lesson sections | ~150 | 500 words | 75,000 | LLM + Human edit |
| Feature descriptions | ~100 | 150 words | 15,000 | LLM |
| Feature instances | ~1,000 | 50 words | 50,000 | LLM |
| Glossary terms | ~200 | 75 words | 15,000 | LLM + Human edit |
| **Total** | — | — | **~500,000** | — |

#### 8.2.2 LLM Generation Strategy

**Model Selection**: Claude Sonnet 4 (via Anthropic Batch API for cost efficiency)

**Prompt Engineering Approach**:

1. **System Prompt**: Establish persona as music theory educator familiar with WTC
2. **Context Injection**: Include relevant score data (measures, notes, existing annotations)
3. **Format Specification**: Structured output (JSON or Markdown with frontmatter)
4. **Quality Guardrails**: Request specific terminology, appropriate difficulty level
5. **Chain-of-Thought**: For harmonic analysis, request step-by-step reasoning

**Example Prompt Structure for Measure Commentary**:
```
You are a music theory educator creating measure-by-measure commentary 
for the Well-Tempered Clavier. The student is an intelligent adult 
with basic music reading skills but limited formal theory training.

Generate commentary for measure {N} of BWV {BWV} ({Key} {Type}).

Context:
- Previous measure: {summary of m. N-1}
- Current measure harmonic analysis: {Roman numerals}
- Voices present: {voice info}
- Any notable techniques: {annotations}
- Upcoming measure: {summary of m. N+1}

Requirements:
- Write 2-4 sentences
- Explain what's happening harmonically and melodically
- Reference previous context naturally ("continuing from the previous measure...")
- Use Italian terminology with natural English explanations
- If introducing a new concept, provide a brief definition
- If a fugue: note any subject/answer entries
- Be conversational but informative

Output as JSON:
{
  "commentary": "...",
  "terminology_used": ["term1", "term2"],
  "concepts_introduced": ["concept1"],
  "cross_references": {"measure": N+5, "reason": "resolution of this setup"}
}
```

#### 8.2.3 Generation Workflow

1. **Batch Preparation**: Group measures by piece; prepare context for each
2. **Batch Submission**: Submit to Anthropic Batch API (50% cost reduction)
3. **Result Processing**: Parse JSON outputs; validate structure
4. **Quality Flags**: Automatically flag outputs that seem incomplete or off-topic
5. **Human Review Queue**: Route flagged items for manual review
6. **Iteration**: Refine prompts based on review feedback; regenerate problem content

**Estimated Cost** (Claude Sonnet via Batch API):
- ~1M tokens input, ~500K tokens output
- ~$3 input + ~$7.50 output = ~$10-15 per full generation pass
- With iteration: Budget $50-150 total

#### 8.2.4 Human Review Process

**Review Priorities**:
1. All lesson content (curriculum mode)
2. Piece introductions
3. First measure of each piece (sets the tone)
4. Measures with complex harmonic content
5. Feature definitions

**Review Criteria**:
- Factual accuracy (correct Roman numerals, terminology)
- Appropriate difficulty level
- Engaging and clear writing
- Proper connection to context
- No hallucinated references

### 8.3 Audio Narration Production

#### 8.3.1 TTS Pipeline

**Tool**: edge-tts (Python library using Microsoft Edge neural voices)

**Voice Configuration**:
- Voice: en-US-AriaNeural (or selected alternative)
- Rate: +0% (natural speed)
- Pitch: +0% (natural pitch)

**Processing Steps**:

1. **Text Preparation**
   - Extract narration text from generated content
   - Apply SSML markup for pronunciation fixes
   - Insert pauses at appropriate points (after terminology, before examples)
   - Mark measure references for later synchronization

2. **Audio Generation**
   - Generate MP3 audio via edge-tts
   - Process in batches by piece/lesson
   - Generate timing metadata (word timestamps)

3. **Post-Processing**
   - Normalize audio levels
   - Add subtle room ambience (optional, for warmth)
   - Trim silence from start/end
   - Generate OGG alternative encoding

4. **Metadata Extraction**
   - Parse timing data from edge-tts output
   - Map measure references to specific timestamps
   - Store synchronization data as JSON sidecar files

#### 8.3.2 Storage and Delivery

**File Organization**:
```
/audio
├── narration
│   ├── walkthrough
│   │   ├── bwv-846-prelude
│   │   │   ├── intro.mp3
│   │   │   ├── m001.mp3
│   │   │   ├── m002.mp3
│   │   │   └── ...
│   │   └── ...
│   ├── curriculum
│   │   ├── harmony-diatonic-functions-dominant
│   │   │   ├── section-intro.mp3
│   │   │   ├── section-example1.mp3
│   │   │   └── ...
│   │   └── ...
│   └── explorer
│       ├── feature-stretto.mp3
│       └── ...
└── timing
    ├── bwv-846-prelude-m001.json
    └── ...
```

**Timing Metadata Format**:
```json
{
  "audio_path": "/audio/narration/walkthrough/bwv-846-prelude/m001.mp3",
  "duration_ms": 15000,
  "word_timings": [
    {"word": "The", "start_ms": 0, "end_ms": 150},
    {"word": "dominant", "start_ms": 151, "end_ms": 600},
    ...
  ],
  "measure_references": [
    {"measure": 1, "start_ms": 0, "end_ms": 5000},
    {"measure": 2, "start_ms": 12000, "end_ms": 15000}
  ]
}
```

### 8.4 Quality Assurance Process

#### 8.4.1 Automated Checks

| Check Type | Description | Threshold |
|------------|-------------|-----------|
| Completeness | All expected content exists | 100% |
| Length | Commentary within word count range | 40-200 words |
| Terminology | Uses expected terms for identified features | >80% match |
| Cross-references | Referenced measures exist | 100% valid |
| Audio duration | Narration within expected range | 10s-120s |
| Audio quality | No clipping, appropriate levels | -3dB to -12dB RMS |

#### 8.4.2 Manual Review Workflow

**Phase 1: Sample Review**
- Review 10% sample from each content type
- Identify systematic issues
- Refine prompts and regenerate if needed

**Phase 2: Full Curriculum Review**
- All lesson content reviewed by human
- Focus on pedagogical clarity and accuracy
- Edit as needed; mark approved

**Phase 3: Spot Check Walkthrough**
- Review all piece introductions
- Review first 4 measures of each piece
- Random sample of 5% of remaining measures

**Phase 4: Ongoing Corrections**
- User feedback mechanism ("Report issue")
- Queue for periodic review and update
- Version control for content updates

---

## 9. Technical Architecture

### 9.1 Platform & Deployment

#### 9.1.1 Platform Decision: Web Application (PWA)

**Rationale**:
- Consistent with existing tech stack (React, Vercel)
- Immediate accessibility without installation
- Easy updates and content deployment
- PWA capabilities enable offline study
- Web Audio API performance is sufficient for study/listening tool

**Desktop Wrapper (Future Option)**: Tauri
- Retain option to package as desktop app if needed
- Same React codebase
- Enhanced audio performance if required for MIDI input phase

#### 9.1.2 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vercel Edge Network                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│   │   Static    │     │    API      │     │   Static    │      │
│   │   Assets    │     │   Routes    │     │   Audio     │      │
│   │  (Next.js)  │     │  (Next.js)  │     │   Files     │      │
│   └─────────────┘     └─────────────┘     └─────────────┘      │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             │                                   │
│                    ┌────────┴────────┐                         │
│                    │    Database     │                         │
│                    │   (Postgres)    │                         │
│                    └─────────────────┘                         │
│                             │                                   │
│                    ┌────────┴────────┐                         │
│                    │   Blob Storage  │                         │
│                    │  (Vercel Blob)  │                         │
│                    └─────────────────┘                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Frontend Architecture

#### 9.2.1 Framework and Libraries

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | Next.js 14+ (App Router) | React framework with SSR/SSG |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first styling |
| UI Components | Radix UI primitives | Accessible component primitives |
| State Management | Zustand | Lightweight global state |
| Data Fetching | TanStack Query | Server state and caching |
| Notation Rendering | OpenSheetMusicDisplay | MusicXML to rendered score |
| Audio Engine | Tone.js | Web Audio synthesis and scheduling |
| Piano Visualization | react-piano | Keyboard component |
| Routing | Next.js App Router | File-based routing |

#### 9.2.2 Application State Structure

```typescript
interface AppState {
  // Global UI
  currentMode: 'walkthrough' | 'curriculum' | 'explorer';
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Playback State
  playback: {
    isPlaying: boolean;
    currentPieceId: string | null;
    currentMeasure: number;
    currentBeat: number;
    tempo: number;
    tempoMultiplier: number;
    volume: number;
    isMuted: boolean;
    loopEnabled: boolean;
    loopStart: { measure: number; beat: number } | null;
    loopEnd: { measure: number; beat: number } | null;
    activeNotes: number[]; // MIDI note numbers
  };
  
  // View State
  view: {
    scoreZoom: number;
    voiceColors: boolean;
    showAnnotations: boolean;
    annotationLayers: string[];
    keyboardVisible: boolean;
    splitPosition: number; // percentage
  };
  
  // Walkthrough State
  walkthrough: {
    currentPieceId: string | null;
    currentMeasure: number;
    autoAdvance: boolean;
    narrationEnabled: boolean;
    narrationAutoPlay: boolean;
  };
  
  // Curriculum State
  curriculum: {
    currentLessonId: string | null;
    currentSectionIndex: number;
  };
  
  // Explorer State
  explorer: {
    searchQuery: string;
    selectedCategories: string[];
    selectedFeatures: string[];
    filters: ExplorerFilters;
    sortBy: 'piece' | 'measure' | 'complexity' | 'relevance';
  };
  
  // User Progress (synced to storage)
  progress: {
    completedLessons: string[];
    visitedMeasures: Record<string, number[]>;
    featuresSeen: string[];
    lastPosition: {
      mode: string;
      pieceId?: string;
      measure?: number;
      lessonId?: string;
    };
  };
}
```

#### 9.2.3 Component Architecture

```
components/
├── layout/
│   ├── AppShell.tsx
│   ├── Header.tsx
│   ├── ModeTabs.tsx
│   └── Sidebar.tsx
│
├── score/
│   ├── ScoreViewer.tsx         # OSMD wrapper
│   ├── ScoreCursor.tsx         # Playback position indicator
│   ├── ScoreAnnotations.tsx    # Overlay layer for annotations
│   └── MeasureHighlight.tsx    # Highlight specific measures
│
├── keyboard/
│   ├── PianoKeyboard.tsx       # Main keyboard component
│   ├── KeyLabel.tsx            # Note name labels
│   └── ActiveNoteHighlight.tsx # Voice-colored highlights
│
├── playback/
│   ├── TransportControls.tsx   # Play/pause/stop/seek
│   ├── TempoSlider.tsx
│   ├── VolumeControl.tsx
│   ├── LoopControls.tsx
│   └── PlaybackPosition.tsx    # Measure/beat display
│
├── narration/
│   ├── NarrationPlayer.tsx     # Audio playback for TTS
│   ├── NarrationControls.tsx   # Play narration, auto-narrate toggle
│   └── NarrationSync.tsx       # Sync manager
│
├── walkthrough/
│   ├── WalkthroughView.tsx     # Main mode view
│   ├── PieceSelector.tsx
│   ├── MeasureNavigation.tsx
│   ├── CommentaryPanel.tsx
│   └── TermTooltip.tsx         # Hoverable terminology
│
├── curriculum/
│   ├── CurriculumView.tsx      # Main mode view
│   ├── CurriculumMap.tsx       # Visual overview
│   ├── LessonView.tsx
│   ├── LessonProgress.tsx
│   ├── SectionRenderer.tsx     # Renders different section types
│   └── RecognitionPractice.tsx # Interactive exercise
│
├── explorer/
│   ├── ExplorerView.tsx        # Main mode view
│   ├── SearchBar.tsx
│   ├── FilterPanel.tsx
│   ├── FeatureTree.tsx         # Category navigation
│   ├── ResultsList.tsx
│   ├── InstanceCard.tsx
│   └── InstanceDetail.tsx
│
└── shared/
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    ├── Select.tsx
    ├── Slider.tsx
    ├── Tooltip.tsx
    ├── Modal.tsx
    ├── ProgressBar.tsx
    └── LoadingSpinner.tsx
```

### 9.3 Backend Services

#### 9.3.1 API Routes

All API routes implemented as Next.js API routes (serverless functions).

**Piece Endpoints**:
```
GET  /api/pieces                    # List all pieces (with filters)
GET  /api/pieces/:id                # Get piece details
GET  /api/pieces/:id/measures       # Get all measures for a piece
GET  /api/pieces/:id/measures/:num  # Get specific measure details
GET  /api/pieces/:id/annotations    # Get annotations for a piece
GET  /api/pieces/:id/score          # Get MusicXML content
GET  /api/pieces/:id/midi           # Get MIDI data (as JSON)
```

**Curriculum Endpoints**:
```
GET  /api/curriculum                # Get curriculum structure
GET  /api/curriculum/domains/:id    # Get domain details
GET  /api/curriculum/lessons/:id    # Get full lesson content
POST /api/progress/lesson/:id       # Update lesson progress
GET  /api/progress                  # Get user progress summary
```

**Explorer Endpoints**:
```
GET  /api/features                  # Get feature taxonomy
GET  /api/features/:id              # Get feature details
GET  /api/features/:id/instances    # Get instances of a feature
GET  /api/search                    # Full-text search across features
GET  /api/instances/:id             # Get specific instance details
```

**Audio Endpoints**:
```
GET  /api/audio/narration/:path     # Serve narration audio (via Vercel Blob)
GET  /api/audio/timing/:path        # Get timing metadata for narration
```

#### 9.3.2 Audio Serving Strategy

- MIDI files: Stored as JSON representations, served via API
- Narration MP3s: Stored in Vercel Blob, served directly with CDN caching
- Piano samples (Salamander): Hosted on CDN or bundled with application

### 9.4 Data Storage

#### 9.4.1 Primary Database: PostgreSQL

**Provider Options**:
- Vercel Postgres (Neon under the hood)
- Supabase PostgreSQL
- Railway PostgreSQL

**Schema**: As defined in Section 7 (Data Architecture)

**Indexes Required**:
- Pieces: bwv_number, book, type, key_tonic, key_mode
- Measures: piece_id, measure_number (compound)
- Annotations: piece_id, measure_start, annotation_type
- FeatureInstances: feature_id, piece_id, measure_start
- UserProgress: user_id, entity_type, entity_id (compound)
- Full-text: GIN index on searchable text columns

#### 9.4.2 File Storage: Vercel Blob

**Contents**:
- MusicXML files (~5-50KB each, ~1MB total)
- MIDI files as JSON (~10-100KB each, ~2MB total)
- Narration audio (~500MB total)
- Timing metadata (~5MB total)
- Piano samples (~25-50MB, or CDN reference)

#### 9.4.3 Client-Side Storage

**IndexedDB** (via idb or Dexie):
- User progress data (sync with server)
- Cached lesson content for offline access
- Recently accessed audio files

**LocalStorage**:
- User preferences (theme, volume, playback settings)
- Session state (last position, current mode)

### 9.5 Performance Requirements

#### 9.5.1 Loading Performance

| Metric | Target | Maximum |
|--------|--------|---------|
| Time to First Byte (TTFB) | <200ms | <500ms |
| First Contentful Paint | <1s | <2s |
| Largest Contentful Paint | <2s | <3s |
| Time to Interactive | <3s | <5s |
| Score render (single page) | <500ms | <1s |

#### 9.5.2 Runtime Performance

| Metric | Target | Maximum |
|--------|--------|---------|
| Audio latency (note-on to sound) | <20ms | <50ms |
| UI response to interaction | <100ms | <200ms |
| Measure navigation | <200ms | <500ms |
| Search results display | <300ms | <1s |
| Mode switching | <500ms | <1s |

#### 9.5.3 Offline Capability

- Core application shell: Always available offline
- Last-accessed piece: Available offline
- Current lesson: Available offline
- Full offline mode: Requires explicit download (~500MB)

---

## 10. Future Considerations

### 10.1 MIDI Keyboard Input (Deferred Feature)

**Purpose**: Allow users to play along with the music on a connected MIDI keyboard, with the application tracking and potentially evaluating their performance.

**Technical Requirements**:
- Web MIDI API support (Chrome, Edge, Opera; Firefox via extension)
- Low-latency input handling (<20ms)
- Note matching algorithm to compare played notes against expected
- Visual feedback for correct/incorrect notes

**Potential Features**:
- Practice mode: Slow tempo with note-by-note guidance
- Performance mode: Play along at tempo with accuracy tracking
- Chord exploration: Play any chord, see its analysis
- Melodic dictation: Hear a phrase, play it back

**Architecture Considerations**:
- State management must handle real-time input
- Audio engine must support concurrent input and playback
- May benefit from Tauri desktop wrapper for lower latency

### 10.2 Additional Repertoire

While out of scope for v1, the architecture should not preclude future expansion:

**Potential Additions**:
- Bach Inventions and Sinfonias (BWV 772-801)
- Bach French and English Suites
- Handel keyboard works
- User-uploaded MusicXML files

**Architecture Requirements**:
- Piece model is not WTC-specific
- Annotation schema is general
- Feature taxonomy can grow
- Curriculum can reference multiple works

### 10.3 Collaborative Features

If desired in the future:

- Shared progress with teacher/mentor
- Discussion threads on specific measures
- Community-contributed annotations
- Comparative analyses

### 10.4 Mobile Application

Current spec is desktop-first. Future mobile considerations:

- React Native with expo for mobile wrapper
- Simplified UI for smaller screens
- Offline-first architecture
- Touch-optimized score interaction

### 10.5 AI Tutor Enhancements

Beyond pre-generated content:

- Interactive Q&A about the current passage
- Adaptive difficulty based on demonstrated knowledge
- Personalized practice recommendations
- Real-time chord analysis of arbitrary passages

---

## 11. Project Phases & Milestones

### Phase 1: Foundation (Weeks 1-4)

**Objectives**: 
- Establish technical infrastructure
- Process and import score data
- Implement basic playback

**Deliverables**:
- [ ] Next.js project setup with TypeScript and Tailwind
- [ ] Database schema implemented and deployed
- [ ] MusicXML files processed and imported
- [ ] MIDI data extracted and stored
- [ ] OpenSheetMusicDisplay integration (render any piece)
- [ ] Tone.js audio engine (play any piece)
- [ ] Basic transport controls

**Exit Criteria**: Can load, display, and play any of the 48 pieces

### Phase 2: Walkthrough Mode (Weeks 5-8)

**Objectives**:
- Implement measure-by-measure navigation
- Generate and integrate commentary content
- Add narration system

**Deliverables**:
- [ ] Measure navigation UI
- [ ] Commentary panel implementation
- [ ] LLM prompt development and testing
- [ ] Batch generation of commentary for 12 pieces (25%)
- [ ] TTS narration generation for those pieces
- [ ] Narration playback and controls
- [ ] Score/audio/narration synchronization

**Exit Criteria**: Complete walkthrough experience for Book I, C Major prelude and fugue

### Phase 3: Curriculum Mode (Weeks 9-12)

**Objectives**:
- Build curriculum structure
- Create lesson content
- Implement progress tracking

**Deliverables**:
- [ ] Curriculum navigation and map
- [ ] Lesson viewer implementation
- [ ] Content generation for first 2 domains (Fundamentals, Harmony basics)
- [ ] Embedded score examples in lessons
- [ ] Progress tracking system
- [ ] Cross-mode navigation links

**Exit Criteria**: User can complete 10+ lessons covering basic concepts

### Phase 4: Explorer Mode (Weeks 13-16)

**Objectives**:
- Import/generate feature annotations
- Build search and filter interface
- Connect to other modes

**Deliverables**:
- [ ] Feature taxonomy database
- [ ] Algomus data import for Book I fugues
- [ ] Feature instance cataloging (manual + generated)
- [ ] Search and filter UI
- [ ] Instance detail view
- [ ] Links to walkthrough and curriculum

**Exit Criteria**: Can find and explore all stretto examples in Book I

### Phase 5: Polish and Expansion (Weeks 17-20)

**Objectives**:
- Complete content for all 48 pieces
- Refine UX based on usage
- Optimize performance

**Deliverables**:
- [ ] Commentary generated for all pieces
- [ ] Narration generated for all pieces
- [ ] Curriculum expanded to all planned domains
- [ ] Feature instances expanded to Book II
- [ ] PWA offline support
- [ ] Performance optimization
- [ ] Accessibility audit and fixes

**Exit Criteria**: Full WTC coverage; application is polished and performant

### Ongoing: Content Quality

- Weekly review sessions for generated content
- Continuous improvement of LLM prompts
- User self-feedback mechanism
- Periodic content regeneration as prompts improve

---

## 12. Appendices

### Appendix A: BWV Catalog Reference

| BWV | Book | Key | Prelude Character | Fugue Voices |
|-----|------|-----|-------------------|--------------|
| 846 | I | C major | Arpeggiated, famous | 4 |
| 847 | I | C minor | Fiery, virtuosic | 3 |
| 848 | I | C# major | Joyful, running | 3 |
| 849 | I | C# minor | Sublime, profound | 5 |
| 850 | I | D major | Bright, fanfare-like | 4 |
| ... | ... | ... | ... | ... |
| 893 | II | B minor | Contemplative | 3 |

*Full table to be completed during implementation*

### Appendix B: Music Theory Terminology Glossary

**Sample entries** (full glossary to be generated):

**Cadence**: A harmonic progression that provides a sense of resolution or pause. Types include perfect authentic (V-I with soprano on tonic), half (ending on V), deceptive (V-vi), and plagal (IV-I).

**Countersubject**: A recurring melodic line in a fugue that accompanies the subject when it appears. A good countersubject provides rhythmic and melodic contrast while maintaining proper counterpoint with the subject.

**Stretto**: A contrapuntal device in fugue where subject entries overlap, creating increased intensity. The second entry begins before the first completes.

### Appendix C: Key Technical Resources

**Libraries Documentation**:
- OpenSheetMusicDisplay: https://opensheetmusicdisplay.github.io/
- Tone.js: https://tonejs.github.io/
- react-piano: https://github.com/kevinsqi/react-piano

**Data Sources**:
- Open WTC: https://www.welltemperedclavier.org/
- Algomus: https://algomus.fr/fugues/
- KernScores: https://kern.humdrum.org/

**Reference Materials**:
- MusicXML 4.0 Specification
- Web Audio API W3C Specification
- Web MIDI API W3C Specification

### Appendix D: Content Generation Prompt Templates

*To be developed during Phase 2; will include templates for*:
- Measure commentary
- Piece introductions
- Lesson sections
- Feature definitions
- Instance descriptions

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2024 | Brandon | Initial specification |

---

*End of Specification Document*
