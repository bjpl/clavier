# Clavier Content Generation Prompt Guide
## Complete Prompt Engineering for LLM-Generated Music Theory Content

**Purpose**: This document provides ready-to-use prompts for generating all educational content for the Clavier music theory learning tool using Claude Code with Opus 4.5.

**Estimated Output**: ~500,000 words of structured content across all content types.

---

## Table of Contents

1. [Generation Strategy Overview](#1-generation-strategy-overview)
2. [System Prompt (Use for All Sessions)](#2-system-prompt-use-for-all-sessions)
3. [Content Type 1: Piece Introductions](#3-content-type-1-piece-introductions)
4. [Content Type 2: Measure-by-Measure Commentary](#4-content-type-2-measure-by-measure-commentary)
5. [Content Type 3: Curriculum Lessons](#5-content-type-3-curriculum-lessons)
6. [Content Type 4: Feature Definitions](#6-content-type-4-feature-definitions)
7. [Content Type 5: Feature Instance Descriptions](#7-content-type-5-feature-instance-descriptions)
8. [Content Type 6: Glossary Terms](#8-content-type-6-glossary-terms)
9. [Batch Processing Scripts](#9-batch-processing-scripts)
10. [Quality Checklist](#10-quality-checklist)

---

## 1. Generation Strategy Overview

### 1.1 Recommended Order of Generation

Generate content in this order to build contextual consistency:

1. **Glossary Terms** (foundation vocabulary)
2. **Feature Definitions** (technique explanations)
3. **Piece Introductions** (overview before detail)
4. **Curriculum Lessons** (structured pedagogy)
5. **Measure-by-Measure Commentary** (detailed analysis)
6. **Feature Instance Descriptions** (specific examples)

### 1.2 Session Structure

For Claude Code sessions, work in focused batches:

- **Per session**: Generate content for 2-4 pieces OR 5-10 lessons OR 20-30 glossary terms
- **Context window management**: Include relevant prior content as context
- **Output format**: Always request JSON for easy database import
- **Validation**: Review first few outputs before generating remainder

### 1.3 File Organization

Save generated content to:
```
content/
├── glossary/
│   └── terms.json
├── features/
│   ├── definitions.json
│   └── instances/
│       ├── bwv-846-fugue.json
│       └── ...
├── pieces/
│   ├── introductions.json
│   └── commentary/
│       ├── bwv-846-prelude.json
│       ├── bwv-846-fugue.json
│       └── ...
└── curriculum/
    ├── structure.json
    └── lessons/
        ├── fundamentals/
        ├── harmony/
        ├── counterpoint/
        ├── fugue/
        ├── form/
        └── advanced/
```

---

## 2. System Prompt (Use for All Sessions)

Copy this system prompt at the start of every Claude Code session for content generation:

```
You are an expert music theorist and educator creating content for "Clavier," a personal music theory learning application centered entirely on Bach's Well-Tempered Clavier (BWV 846-893).

## Your Role

You are writing for a single learner: an intelligent adult with strong analytical skills but limited formal music theory training. He can read basic treble and bass clef, understands major/minor conceptually, but has no experience with Roman numeral analysis, counterpoint, or formal music theory terminology.

## Core Principles

1. **Situated Learning**: Every concept must emerge from actual musical examples in the WTC, never presented abstractly first
2. **Accessible Depth**: Explain advanced concepts (stretto, inversion, augmentation) accessibly when they appear—don't defer them to "advanced" sections
3. **Conversational Authority**: Write like a knowledgeable friend explaining over coffee, not a textbook—but maintain complete accuracy
4. **Contextual Awareness**: Every explanation should connect to what came before and what follows
5. **Terminology Introduction**: On first use of any term, provide a natural inline definition; on subsequent uses, the term can stand alone

## Musical Knowledge You Have

You have deep knowledge of:
- All 48 preludes and fugues (24 in each book)
- Harmonic progressions, cadences, modulations
- Contrapuntal techniques (imitation, inversion, augmentation, stretto, etc.)
- Fugue construction (subject, answer, countersubject, episodes, etc.)
- Baroque keyboard style and performance practice
- The theoretical literature on Bach's keyboard works

## Output Requirements

- Always output valid JSON unless otherwise specified
- Use consistent terminology across all content
- Reference specific measure numbers when discussing musical events
- Use modern note naming (C4 = middle C, sharps as #, flats as b)
- Roman numerals: uppercase for major (I, IV, V), lowercase for minor (ii, iii, vi)
- For secondary dominants: V/V, V/vi, etc.
- For inversions: I6, V65, V43, V42, etc.

## Voice and Tone

- Warm, encouraging, intellectually engaged
- Express genuine enthusiasm for beautiful moments in the music
- Acknowledge when something is complex, but convey that it's comprehensible
- Never condescending; never assume the learner "won't understand"
- Use "we" and "you" naturally ("Notice how Bach..." / "When we arrive at measure 15...")
```

---

## 3. Content Type 1: Piece Introductions

### 3.1 Purpose

Brief orientation before studying each piece—what to expect, what makes it special, key features to listen for.

### 3.2 Prompt Template

```
Generate an introduction for the following piece from the Well-Tempered Clavier.

## Piece Information
- BWV: [NUMBER]
- Book: [1 or 2]
- Key: [KEY] [major/minor]
- Type: [Prelude/Fugue]
- Time Signature: [TIME]
- Total Measures: [NUMBER]
- For Fugues: [NUMBER] voices

## Output Format

Return a JSON object with this exact structure:

{
  "bwv": 846,
  "type": "prelude",
  "key": "C major",
  "book": 1,
  "introduction": {
    "opening_hook": "A single sentence that captures what makes this piece special or memorable.",
    "character_description": "2-3 sentences describing the overall character, mood, and affect of the piece.",
    "notable_features": [
      "First notable feature or technique (1 sentence)",
      "Second notable feature (1 sentence)",
      "Third if applicable (1 sentence)"
    ],
    "listening_focus": "2-3 sentences suggesting what to pay attention to when first experiencing this piece.",
    "technical_overview": "For preludes: brief description of texture and form. For fugues: subject character, answer type (real/tonal), notable contrapuntal devices used.",
    "historical_context": "1-2 sentences of relevant context (optional—only if genuinely interesting, not filler)."
  },
  "metadata": {
    "difficulty_level": 1-5,
    "estimated_study_time_minutes": 15-60,
    "prerequisite_concepts": ["concept1", "concept2"],
    "concepts_introduced": ["concept1", "concept2"]
  }
}

## Guidelines

- Opening hook should be memorable and specific, not generic
- Avoid superlatives like "one of the greatest" or "the most famous"
- Notable features should be concrete and verifiable in the score
- Listening focus should guide first encounter, not comprehensive analysis
- Technical overview should be honest about complexity level
- Prerequisite concepts reference curriculum lessons needed first
- Concepts introduced lists what studying this piece will teach
```

### 3.3 Example Output (BWV 846 Prelude)

```json
{
  "bwv": 846,
  "type": "prelude",
  "key": "C major",
  "book": 1,
  "introduction": {
    "opening_hook": "This prelude's gentle arpeggiated pattern has become one of the most recognized sounds in classical music—deceptively simple on the surface, yet harmonically rich underneath.",
    "character_description": "The mood is contemplative and serene, almost improvisatory in feel. Each measure presents a single harmony spread across a consistent broken-chord pattern, creating a meditative flow that seems to suspend time. Despite the rhythmic uniformity, the harmonic journey is surprisingly colorful.",
    "notable_features": [
      "The unchanging sixteenth-note arpeggiation pattern creates a hypnotic, almost minimalist texture that continues for all 35 measures.",
      "The harmonic rhythm (one chord per measure, mostly) allows us to hear each harmony clearly before moving to the next.",
      "A striking chromatic passage in the middle section briefly clouds the key before the satisfying return to C major."
    ],
    "listening_focus": "On first listen, let yourself settle into the pattern and notice when the emotional color shifts—there's a moment around the middle where things get darker and more uncertain before resolving. Try to hear the bass notes as the foundation of each harmony; they tell the harmonic story.",
    "technical_overview": "The texture is essentially arpeggiated chords over a bass line, with five-note groups in the right hand against steady bass notes and inner-voice pedal tones. The form is through-composed, moving from tonic through various related harmonies to a dominant pedal point before the final cadence.",
    "historical_context": "This prelude later inspired Gounod's famous 'Ave Maria' melody superimposed over Bach's harmonies, demonstrating how complete the harmonic structure is even without an explicit melody."
  },
  "metadata": {
    "difficulty_level": 1,
    "estimated_study_time_minutes": 20,
    "prerequisite_concepts": ["triads", "arpeggios", "major-keys"],
    "concepts_introduced": ["harmonic-rhythm", "pedal-point", "through-composed-form"]
  }
}
```

### 3.4 Batch Generation Command

Generate all 48 introductions in groups:

```
Generate introductions for Book I Preludes BWV 846, 848, 850, 852 (C, C#, D, Eb major).

[Include piece information for each]

Return as a JSON array of introduction objects.
```

---

## 4. Content Type 2: Measure-by-Measure Commentary

### 4.1 Purpose

Detailed, contextually-aware explanation of what happens in each measure, building understanding progressively.

### 4.2 Context Requirements

For each piece, you'll need to provide:
- Basic harmonic analysis (Roman numerals per measure)
- Voice assignments (for fugues)
- Notable events (subject entries, cadences, sequences, etc.)

**Obtaining this data**: Use music21 or manual analysis to create a simple analysis file first, then feed it into the commentary generation.

### 4.3 Prompt Template

```
Generate measure-by-measure commentary for the following piece.

## Piece Information
- BWV: [NUMBER]
- Type: [Prelude/Fugue]
- Key: [KEY]
- Total Measures: [NUMBER]
- Time Signature: [TIME]

## Harmonic Analysis Data
[Provide a simple measure-by-measure analysis, e.g.:]
m1: I
m2: ii6
m3: V7
m4: I
...

## Structural Events
[List notable events, e.g.:]
- m1-4: Opening subject statement (soprano)
- m5-8: Answer in alto (dominant)
- m9-12: Subject in tenor
- m15: First episode begins
- m20-24: Stretto passage
...

## Output Format

Return a JSON object with this structure:

{
  "bwv": 847,
  "type": "fugue",
  "key": "C minor",
  "measures": [
    {
      "measure_number": 1,
      "beats": "1-4",
      "harmony": {
        "roman_numeral": "i",
        "chord": "Cm",
        "function": "tonic",
        "inversion": "root"
      },
      "commentary": "The fugue opens with the subject alone in the soprano voice—a dramatic, angular theme that outlines the tonic triad before rushing upward in sixteenth notes. Notice the strong emphasis on the first beat followed by the restless upward motion; this rhythmic profile will become our constant companion throughout the piece.",
      "voice_activity": {
        "soprano": "Subject statement begins",
        "alto": "Rest",
        "tenor": "Rest (fugue is 3-voice)"
      },
      "terminology_introduced": [
        {
          "term": "subject",
          "definition": "The main theme of a fugue, stated alone at the opening and then passed between voices throughout the piece."
        }
      ],
      "connections": {
        "references_back": null,
        "sets_up": "The answer will enter in measure 3 when this subject statement completes."
      },
      "notable_features": ["subject-entry"],
      "curriculum_links": ["fugue-basics", "subject-and-answer"]
    },
    {
      "measure_number": 2,
      "beats": "1-4",
      "harmony": {
        "roman_numeral": "iv6",
        "chord": "Fm/Ab",
        "function": "predominant",
        "inversion": "first"
      },
      "commentary": "The subject continues its upward trajectory, now moving through the subdominant harmony. The sixteenth-note motion creates momentum toward the coming cadence—Bach is establishing the rhythmic energy that will characterize this entire fugue.",
      "voice_activity": {
        "soprano": "Subject continuation",
        "alto": "Rest",
        "tenor": "Rest"
      },
      "terminology_introduced": [],
      "connections": {
        "references_back": "Continuing the subject begun in m1",
        "sets_up": "Building toward the half-cadence that will welcome the answer"
      },
      "notable_features": [],
      "curriculum_links": []
    }
  ]
}

## Commentary Guidelines

1. **Length**: 2-4 sentences per measure. Simple measures can be shorter; complex ones longer.

2. **First measure of piece**: Always orient the listener—what are we hearing? What's the texture? What should we notice?

3. **Subject entries (fugues)**: Always note which voice, whether it's subject or answer, and any modifications.

4. **Harmonic events**: Explain significant harmonic motion, especially:
   - Cadences (always name the type)
   - Modulations (explain where we're going and how)
   - Chromatic chords (what are they doing?)
   - Sequences (identify the pattern)

5. **Connections**: Every measure should connect to its context:
   - "Continuing from the previous measure..."
   - "This resolves the tension built up in m15..."
   - "Bach is setting up the arrival at..."

6. **Terminology**: Use the `terminology_introduced` field for first occurrences only.

7. **Tone variations**:
   - Moments of arrival: Express satisfaction ("Finally, we arrive at...")
   - Complex passages: Acknowledge complexity while guiding ("This gets dense, but focus on...")
   - Beautiful moments: Share genuine appreciation ("Listen to how the voices interweave here...")

8. **What NOT to include**:
   - Performance instructions (fingering, tempo choices)
   - Comparisons to other composers
   - Speculative interpretations
   - Personal opinions about quality
```

### 4.4 Example: Commentary Batch for BWV 846 Prelude (Measures 1-5)

```json
{
  "bwv": 846,
  "type": "prelude",
  "key": "C major",
  "measures": [
    {
      "measure_number": 1,
      "harmony": {
        "roman_numeral": "I",
        "chord": "C",
        "function": "tonic",
        "inversion": "root"
      },
      "commentary": "We begin in the most stable place possible: a pure C major chord, broken into a gentle arpeggiated pattern. The left hand establishes the bass C and an inner G that will sustain throughout the measure, while the right hand traces the chord tones in a repeating five-note figure. This seemingly simple texture—which will continue unchanged for the entire piece—is actually a meditation on harmony itself.",
      "terminology_introduced": [
        {
          "term": "arpeggio",
          "definition": "A chord whose notes are played one after another rather than simultaneously, often creating a flowing, harp-like effect."
        }
      ],
      "connections": {
        "references_back": null,
        "sets_up": "This pattern establishes the template; every following measure will use the same figuration with different harmonies."
      },
      "notable_features": ["arpeggiated-texture", "pedal-tone"],
      "curriculum_links": ["triads", "chord-inversions"]
    },
    {
      "measure_number": 2,
      "harmony": {
        "roman_numeral": "ii6/5",
        "chord": "Dm7/F",
        "function": "predominant",
        "inversion": "first-seventh"
      },
      "commentary": "The first harmonic motion: we move to a D minor seventh chord in first inversion. Notice how smooth this feels—the bass simply steps up from C to D, and only a couple of notes change in the arpeggiation. This is the supertonic chord, functioning as a predominant that will eventually lead us toward the dominant.",
      "terminology_introduced": [
        {
          "term": "predominant",
          "definition": "A chord that typically appears before the dominant (V), preparing and strengthening the eventual resolution to tonic. The ii and IV chords often serve this role."
        }
      ],
      "connections": {
        "references_back": "Same texture as m1, new harmony",
        "sets_up": "Beginning a harmonic progression that will reach the dominant"
      },
      "notable_features": ["predominant-function"],
      "curriculum_links": ["seventh-chords", "harmonic-function"]
    },
    {
      "measure_number": 3,
      "harmony": {
        "roman_numeral": "V6/5",
        "chord": "G7/B",
        "function": "dominant",
        "inversion": "first-seventh"
      },
      "commentary": "Here's our first dominant seventh chord—the G7 that wants to pull us back to C major. It appears in first inversion (B in the bass), which creates a stepwise bass line: C–D–B–C. This smooth bass motion is a hallmark of Baroque style. Listen for the slight tension of the seventh (the F) wanting to fall to E.",
      "terminology_introduced": [
        {
          "term": "dominant seventh",
          "definition": "A major triad with an added minor seventh, built on the fifth scale degree. The most tension-filled chord in tonal harmony, it strongly pulls toward resolution to the tonic."
        }
      ],
      "connections": {
        "references_back": "Follows naturally from the predominant ii chord",
        "sets_up": "Creating expectation for the resolution to I in the next measure"
      },
      "notable_features": ["dominant-seventh", "bass-voice-leading"],
      "curriculum_links": ["dominant-function", "seventh-chords"]
    },
    {
      "measure_number": 4,
      "harmony": {
        "roman_numeral": "I",
        "chord": "C",
        "function": "tonic",
        "inversion": "root"
      },
      "commentary": "Resolution: we're home again on C major. These four measures have just demonstrated the most fundamental progression in tonal music: I–ii–V–I, the journey from stability through tension and back. In the time it took you to read this, Bach has taught us the essential grammar of Western harmony.",
      "terminology_introduced": [
        {
          "term": "cadence",
          "definition": "A harmonic arrival point, like punctuation in a sentence. This V–I motion is an authentic cadence, the strongest form of harmonic resolution."
        }
      ],
      "connections": {
        "references_back": "Resolves the V7 from m3",
        "sets_up": "The pattern now repeats with more adventurous harmonies"
      },
      "notable_features": ["authentic-cadence", "harmonic-rhythm"],
      "curriculum_links": ["cadences", "harmonic-progressions"]
    },
    {
      "measure_number": 5,
      "harmony": {
        "roman_numeral": "vi7",
        "chord": "Am7",
        "function": "tonic-substitute",
        "inversion": "root"
      },
      "commentary": "Instead of staying on C, we immediately shift to A minor seventh—the relative minor. This is a subtle darkening of color without any real sense of instability. Bach is beginning to explore beyond the simple I–ii–V–I pattern, showing us that harmony can be a journey of continuous motion rather than constant return.",
      "terminology_introduced": [
        {
          "term": "relative minor",
          "definition": "The minor key that shares the same key signature as a major key. C major and A minor are relatives, sharing no sharps or flats."
        }
      ],
      "connections": {
        "references_back": "Surprising after the stability of m4's resolution",
        "sets_up": "Beginning a longer harmonic sequence"
      },
      "notable_features": ["tonic-substitute", "modal-color"],
      "curriculum_links": ["relative-keys", "chord-substitution"]
    }
  ]
}
```

### 4.5 Batch Generation Strategy

For efficient generation, work piece by piece:

```
I'm generating measure-by-measure commentary for BWV 846 Prelude in C Major.

Here is the harmonic analysis for measures 1-11:
m1: I
m2: ii6/5
m3: V6/5
m4: I
m5: vi7
m6: ii7
m7: V7
m8: I
m9: ii7/V (secondary dominant)
m10: V
m11: V7/vi

Generate detailed commentary for measures 1-11. Remember to:
- Introduce terminology on first use only
- Connect each measure to surrounding context
- Note this is an arpeggiated prelude with consistent texture
- The learner has not seen this piece before

[Continue with measures 12-23, 24-35 in subsequent prompts]
```

---

## 5. Content Type 3: Curriculum Lessons

### 5.1 Purpose

Structured, progressive lessons that teach music theory concepts using WTC examples.

### 5.2 Lesson Structure

Each lesson follows this format:
1. Introduction (what we're learning, why it matters)
2. Core Concept Explanation
3. Guided Example (WTC excerpt, step-by-step)
4. Additional Examples (2-3 more WTC references)
5. Summary and Terminology Review

### 5.3 Prompt Template

```
Generate a complete lesson for the Clavier curriculum.

## Lesson Metadata
- Domain: [Harmony/Counterpoint/Fugue/Form/Fundamentals/Advanced]
- Unit: [Unit name]
- Module: [Module name]
- Lesson Title: [Title]
- Position in Sequence: [What comes before and after]

## Learning Objectives
By the end of this lesson, the learner should be able to:
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

## WTC Examples to Use
- Primary Example: BWV [X], [Prelude/Fugue], measures [X-Y]
- Secondary Examples: 
  - BWV [X], measures [X-Y]
  - BWV [X], measures [X-Y]

## Prerequisites
- Prior lessons: [list]
- Assumed knowledge: [list concepts]

## Output Format

{
  "lesson_id": "harmony-diatonic-dominant-resolution",
  "title": "The Dominant and Its Resolution",
  "domain": "Harmony",
  "unit": "Diatonic Harmony",
  "module": "Chord Functions",
  "position": {
    "previous_lesson": "lesson-id",
    "next_lesson": "lesson-id"
  },
  "learning_objectives": [
    "Recognize dominant (V) chords in context",
    "Understand why V creates tension that resolves to I",
    "Identify authentic cadences in the Well-Tempered Clavier"
  ],
  "estimated_time_minutes": 15,
  "sections": [
    {
      "section_id": "intro",
      "section_type": "introduction",
      "title": "Introduction",
      "content": "Markdown content introducing the concept...",
      "narration_text": "Slightly adapted text optimized for TTS reading..."
    },
    {
      "section_id": "concept",
      "section_type": "explanation",
      "title": "What Makes a Chord 'Dominant'?",
      "content": "Markdown explanation of the core concept...",
      "key_points": [
        "The V chord is built on the fifth scale degree",
        "It contains the leading tone, which pulls toward tonic",
        "Adding the seventh increases the tension"
      ],
      "narration_text": "..."
    },
    {
      "section_id": "example1",
      "section_type": "guided_example",
      "title": "Guided Example: BWV 846, Measures 3-4",
      "piece_reference": {
        "bwv": 846,
        "type": "prelude",
        "measure_start": 3,
        "measure_end": 4
      },
      "walkthrough": "Step-by-step markdown explanation of what we see and hear...",
      "annotations": [
        {"measure": 3, "label": "V6/5", "description": "Dominant seventh in first inversion"},
        {"measure": 4, "label": "I", "description": "Resolution to tonic"}
      ],
      "listening_prompts": [
        "First, just listen. Notice the sense of 'arrival' on the second measure.",
        "Now listen again. Can you hear the tension in the first chord wanting to resolve?"
      ],
      "narration_text": "..."
    },
    {
      "section_id": "examples",
      "section_type": "additional_examples",
      "title": "More Examples",
      "examples": [
        {
          "bwv": 847,
          "type": "fugue",
          "measure_start": 12,
          "measure_end": 13,
          "brief_description": "A strong V-i cadence in C minor...",
          "what_to_notice": "In minor keys, the dominant still pulls to tonic just as strongly."
        },
        {
          "bwv": 850,
          "type": "prelude",
          "measure_start": 8,
          "measure_end": 9,
          "brief_description": "A half cadence—arriving ON the V...",
          "what_to_notice": "Not every dominant resolves immediately. Sometimes we pause on V."
        }
      ]
    },
    {
      "section_id": "summary",
      "section_type": "summary",
      "title": "Summary",
      "key_takeaways": [
        "The V chord creates harmonic tension through the leading tone",
        "V-I is the most fundamental resolution in tonal music",
        "Authentic cadences (V-I) provide strong closure"
      ],
      "terminology": [
        {
          "term": "dominant",
          "definition": "The chord built on the fifth scale degree; creates tension that resolves to tonic"
        },
        {
          "term": "authentic cadence",
          "definition": "A V-I (or V-i) harmonic resolution; the strongest form of cadence"
        }
      ],
      "narration_text": "..."
    }
  ],
  "explorer_links": [
    {"feature": "authentic-cadence", "description": "See all authentic cadences in the WTC"},
    {"feature": "dominant-seventh", "description": "See all V7 chords in the WTC"}
  ],
  "next_steps": "In the next lesson, we'll explore what happens before the dominant—the predominant chords that set it up."
}

## Writing Guidelines

1. **Introduction**: Hook the reader with why this matters. Connect to what they already know.

2. **Explanation**: 
   - Start concrete, then abstract
   - Use analogies when helpful
   - Keep paragraphs short (3-4 sentences max)
   - Build complexity gradually

3. **Guided Example**:
   - Walk through beat by beat if needed
   - Tell them what to listen for BEFORE they listen
   - Confirm what they should have heard AFTER
   - Connect the example back to the concept

4. **Additional Examples**:
   - Show variety (different keys, piece types, contexts)
   - Keep descriptions brief—they can explore in Walkthrough mode
   - Note what's similar and what's different from the primary example

5. **Summary**:
   - No new information
   - Reinforce the key insight
   - Bridge to what's next

6. **Narration Text**:
   - Slightly simpler sentence structure than written text
   - Add transitional phrases for audio flow
   - Avoid abbreviations (write "measure" not "m.")
   - Spell out numerals under 10
```

### 5.4 Complete Curriculum Outline for Generation

Use this outline to generate all lessons systematically:

```
## Domain 1: Fundamentals (6 lessons)

### Unit 1.1: Reading Music
- Lesson: The Staff and Clefs
- Lesson: Note Names and Octaves
- Lesson: Reading Rhythm

### Unit 1.2: Keys and Scales
- Lesson: Major Scales
- Lesson: Minor Scales (Natural, Harmonic, Melodic)
- Lesson: Key Signatures and the Circle of Fifths

---

## Domain 2: Harmony (15 lessons)

### Unit 2.1: Chords
- Lesson: Triads (Major, Minor, Diminished, Augmented)
- Lesson: Seventh Chords
- Lesson: Chord Inversions
- Lesson: Figured Bass Notation

### Unit 2.2: Harmonic Function
- Lesson: Tonic Function (I, vi)
- Lesson: Dominant Function (V, vii°)
- Lesson: Predominant Function (ii, IV)
- Lesson: The I-IV-V-I Progression

### Unit 2.3: Cadences
- Lesson: Authentic Cadences (PAC, IAC)
- Lesson: Half Cadences
- Lesson: Deceptive and Plagal Cadences

### Unit 2.4: Beyond Diatonic
- Lesson: Secondary Dominants (V/V, V/ii, etc.)
- Lesson: Mode Mixture
- Lesson: Modulation Basics
- Lesson: Sequences

---

## Domain 3: Counterpoint (10 lessons)

### Unit 3.1: Voice Leading
- Lesson: Melodic Motion Types
- Lesson: The Rules of Voice Leading
- Lesson: Common Voice Leading Patterns

### Unit 3.2: Two-Voice Counterpoint
- Lesson: Consonance and Dissonance
- Lesson: First Species Counterpoint
- Lesson: Adding Rhythm

### Unit 3.3: Multi-Voice Textures
- Lesson: Three-Voice Writing
- Lesson: Four-Voice Writing
- Lesson: Suspensions and Retardations
- Lesson: Imitation

---

## Domain 4: Fugue (12 lessons)

### Unit 4.1: Fugue Basics
- Lesson: What Is a Fugue?
- Lesson: The Subject
- Lesson: The Answer (Real vs. Tonal)
- Lesson: The Countersubject

### Unit 4.2: Fugal Exposition
- Lesson: Voice Entry Order
- Lesson: The Bridge Passage
- Lesson: Exposition Completion

### Unit 4.3: Fugal Development
- Lesson: Episodes
- Lesson: Sequences in Fugue
- Lesson: Stretto
- Lesson: Augmentation and Diminution
- Lesson: Inversion

---

## Domain 5: Form (8 lessons)

### Unit 5.1: Phrase Structure
- Lesson: Phrases and Periods
- Lesson: Phrase Extension and Elision

### Unit 5.2: Prelude Forms
- Lesson: Arpeggiated/Textural Preludes
- Lesson: Binary and Ternary Forms
- Lesson: Invention-Style Preludes
- Lesson: Toccata-Style Preludes

### Unit 5.3: Large-Scale Fugue Form
- Lesson: Tonal Plan of a Fugue
- Lesson: Multi-Section Fugue Structure

---

## Domain 6: Advanced Topics (8 lessons)

### Unit 6.1: Chromaticism
- Lesson: Chromatic Voice Leading
- Lesson: Neapolitan Sixth
- Lesson: Augmented Sixth Chords

### Unit 6.2: Complex Counterpoint
- Lesson: Invertible Counterpoint
- Lesson: Double and Triple Fugue
- Lesson: Combining Multiple Subjects

### Unit 6.3: Style and Expression
- Lesson: Baroque Keyboard Style
- Lesson: Affect and Expression in Bach
```

---

## 6. Content Type 4: Feature Definitions

### 6.1 Purpose

Clear, multi-level explanations of each music theory technique or concept that can be searched in the Explorer.

### 6.2 Prompt Template

```
Generate comprehensive definitions for music theory features that will be searchable in the Clavier Explorer.

## Features to Define
[List of features in this batch]

## Output Format

{
  "features": [
    {
      "feature_id": "stretto",
      "name": "Stretto",
      "category": "counterpoint",
      "subcategory": "fugal-devices",
      "related_features": ["imitation", "fugue-subject", "voice-entry"],
      "definitions": {
        "brief": "A single sentence definition suitable for tooltips.",
        "standard": "A 2-3 sentence definition for normal use in commentary and lessons.",
        "detailed": "A full paragraph explanation with technical detail for those wanting to go deeper."
      },
      "what_to_listen_for": "1-2 sentences describing how to recognize this aurally.",
      "visual_markers": "1-2 sentences describing what to look for in the score.",
      "common_contexts": [
        "Often appears near the end of a fugue to increase intensity",
        "Can occur at various intervals (one beat, one measure, etc.)"
      ],
      "difficulty_level": 3,
      "curriculum_lesson": "fugue-development-stretto",
      "search_keywords": ["overlapping", "imitation", "close", "entries", "fugue", "intensification"]
    }
  ]
}

## Guidelines

1. **Brief definition**: Must be one clear sentence. Used in tooltips and quick reference.

2. **Standard definition**: The go-to explanation. Assumes some context. 2-3 sentences.

3. **Detailed definition**: For "tell me more" situations. Can include history, variants, edge cases.

4. **What to listen for**: Practical listening guidance. What does this sound like?

5. **Visual markers**: What does this look like on the page?

6. **Common contexts**: Where does this typically appear? Why?

7. **Search keywords**: Include synonyms, related terms, descriptive words someone might search.
```

### 6.3 Feature List for Generation

Generate definitions for all of these features:

```
## Harmony Features
- authentic-cadence-perfect
- authentic-cadence-imperfect
- half-cadence
- deceptive-cadence
- plagal-cadence
- phrygian-cadence
- secondary-dominant
- secondary-leading-tone
- neapolitan
- augmented-sixth-italian
- augmented-sixth-german
- augmented-sixth-french
- mode-mixture
- modulation-pivot-chord
- modulation-direct
- sequence-descending-fifths
- sequence-ascending-5-6
- sequence-descending-thirds
- pedal-point-tonic
- pedal-point-dominant

## Counterpoint Features
- parallel-thirds
- parallel-sixths
- voice-exchange
- suspension-4-3
- suspension-7-6
- suspension-9-8
- suspension-2-3 (bass)
- retardation
- anticipation
- passing-tone
- neighbor-tone
- escape-tone
- appoggiatura
- imitation-strict
- imitation-free
- canon
- invertible-counterpoint

## Fugue Features
- fugue-subject
- fugue-answer-real
- fugue-answer-tonal
- countersubject
- bridge-passage
- episode
- stretto
- augmentation
- diminution
- inversion
- retrograde
- pedal-point-fugue
- coda

## Form Features
- exposition-fugue
- development-section
- recapitulation
- binary-form
- ternary-form
- rounded-binary
- through-composed
- phrase-period
- phrase-sentence
- phrase-extension
- phrase-elision
- fragmentation

## Texture Features
- monophonic
- homophonic
- polyphonic
- homorhythmic
- arpeggiated-texture
- alberti-bass (rare but possible)
- walking-bass
```

---

## 7. Content Type 5: Feature Instance Descriptions

### 7.1 Purpose

Brief, specific descriptions of each occurrence of a feature in the WTC—what makes this instance notable or interesting.

### 7.2 Prompt Template

```
Generate instance descriptions for occurrences of [FEATURE] in the Well-Tempered Clavier.

## Feature Information
- Feature: [name]
- Feature ID: [id]
- Brief Definition: [one-line definition for context]

## Instances to Describe
[List of specific occurrences with measure numbers]

## Output Format

{
  "feature_id": "stretto",
  "instances": [
    {
      "instance_id": "stretto-bwv847-fugue-m20",
      "bwv": 847,
      "type": "fugue",
      "key": "C minor",
      "measure_start": 20,
      "measure_end": 22,
      "beat_start": 1,
      "beat_end": 4,
      "voices_involved": ["soprano", "alto"],
      "description": "A compact stretto at one beat's distance—the alto enters with the subject just as the soprano reaches its second measure. The close overlap creates a sense of urgency as we approach the final cadence.",
      "what_makes_it_notable": "This is the first stretto in the fugue, appearing as a climactic device in the final section.",
      "difficulty_level": 2,
      "quality_rating": 4,
      "related_instances": ["stretto-bwv849-fugue-m35"]
    }
  ]
}

## Guidelines

1. **Description**: 2-3 sentences. What's happening and why is it interesting?

2. **What makes it notable**: Why might someone want to study THIS instance specifically?

3. **Difficulty level** (1-5): How complex is this example?
   - 1: Clear, simple, isolated
   - 2: Clear but with some context needed
   - 3: Moderately complex
   - 4: Dense or subtle
   - 5: Highly complex, multiple layers

4. **Quality rating** (1-5): How exemplary is this instance for teaching the concept?
   - 5: Textbook example, perfect for teaching
   - 4: Very clear, good for learning
   - 3: Solid example
   - 2: Usable but not ideal
   - 1: Edge case or unusual variant
```

### 7.3 Batch Generation Strategy

Use the Algomus dataset for Book I fugues (pre-annotated), then generate for:
- Book I preludes (manual annotation needed)
- Book II preludes and fugues (manual annotation needed)

```
I have the following stretto instances identified in Book I fugues from the Algomus dataset:

BWV 847 Fugue (C minor):
- m20-22: soprano-alto stretto at 1 beat
- m24-26: alto-bass stretto at 2 beats

BWV 849 Fugue (C# minor):
- m35-38: soprano-alto-tenor triple stretto
- m42-45: soprano-alto stretto with inversion

[Continue with all instances]

Generate instance descriptions for each.
```

---

## 8. Content Type 6: Glossary Terms

### 8.1 Purpose

Comprehensive terminology reference with multiple detail levels and practical guidance.

### 8.2 Prompt Template

```
Generate glossary entries for music theory terminology used in Clavier.

## Terms to Define
[List of terms for this batch]

## Output Format

{
  "glossary": [
    {
      "term": "stretto",
      "pronunciation": "STREH-toh",
      "part_of_speech": "noun",
      "language_origin": "Italian (meaning 'tight' or 'narrow')",
      "definitions": {
        "tooltip": "Overlapping entries of a fugue subject.",
        "short": "A fugal technique where the subject enters in one voice before it has finished in another, creating overlapping statements.",
        "full": "In fugue composition, stretto refers to the overlapping of subject entries—one voice begins the subject before another voice has completed it. This creates a sense of compression and intensification, and is often reserved for climactic moments in a fugue. The term comes from the Italian for 'tight' or 'narrow,' referring to the narrowed time interval between entries. Stretto passages can vary widely: some use just two voices, others involve three or four; some overlap by just one beat, others by several measures; some use the subject in its original form, others combine stretto with inversion or augmentation."
      },
      "related_terms": ["fugue", "subject", "imitation", "answer"],
      "first_encounter": {
        "bwv": 847,
        "type": "fugue",
        "measure": 20,
        "context": "The first stretto in the C minor fugue, where alto and soprano overlap dramatically."
      },
      "common_confusions": "Often confused with general imitation; stretto specifically refers to overlapping subject entries, not any imitative passage.",
      "category": "fugue"
    }
  ]
}

## Guidelines

1. **Pronunciation**: Use simple phonetic spelling for Italian/German terms.

2. **Tooltip definition**: Maximum 10 words. Used on hover.

3. **Short definition**: 1-2 sentences. For in-line first encounters.

4. **Full definition**: A complete paragraph. For dedicated glossary view.

5. **First encounter**: The first place this term naturally appears in the WTC walkthrough.

6. **Common confusions**: What do people often mix this up with?
```

### 8.3 Complete Term List

Generate entries for all these terms:

```
## Basic Terms
- staff, clef, treble-clef, bass-clef, grand-staff
- note, rest, beam, tie, slur
- measure, bar, barline, time-signature
- key, key-signature, accidental, sharp, flat, natural
- major, minor, scale, mode
- octave, interval, step, skip, leap

## Harmony Terms
- chord, triad, seventh-chord
- root, third, fifth, seventh
- inversion, root-position, first-inversion, second-inversion
- major-triad, minor-triad, diminished-triad, augmented-triad
- dominant-seventh, diminished-seventh, half-diminished-seventh
- roman-numeral, figured-bass
- tonic, dominant, subdominant, mediant, submediant, leading-tone, supertonic
- harmonic-function, tonic-function, dominant-function, predominant-function
- cadence, authentic-cadence, half-cadence, deceptive-cadence, plagal-cadence
- progression, voice-leading
- secondary-dominant, tonicization, modulation
- pivot-chord, common-tone
- sequence, harmonic-sequence
- pedal-point, pedal-tone
- suspension, resolution
- neapolitan, augmented-sixth
- mode-mixture, borrowed-chord

## Counterpoint Terms
- counterpoint, voice, part
- consonance, dissonance
- parallel-motion, contrary-motion, similar-motion, oblique-motion
- parallel-fifths, parallel-octaves
- passing-tone, neighbor-tone, suspension, retardation, anticipation
- appoggiatura, escape-tone
- imitation, canon
- invertible-counterpoint, double-counterpoint

## Fugue Terms
- fugue, fugal
- subject, answer, real-answer, tonal-answer
- countersubject, free-counterpoint
- exposition, entry, voice-entry
- episode, development
- stretto, augmentation, diminution, inversion, retrograde
- pedal-point (fugue context)
- coda

## Form Terms
- phrase, period, sentence
- antecedent, consequent
- binary-form, ternary-form, rounded-binary
- through-composed
- extension, elision, fragmentation

## Texture Terms
- texture, monophonic, homophonic, polyphonic
- melody, accompaniment
- voices (number), two-voice, three-voice, four-voice, five-voice

## General Music Terms
- tempo, rhythm, meter, beat
- dynamics, articulation
- ornament, trill, mordent, turn
- baroque, classical
```

---

## 9. Batch Processing Scripts

### 9.1 Recommended Claude Code Session Structure

For each session, structure your work like this:

```bash
# Session: Generate BWV 846 Prelude Commentary

# Step 1: Set up context
# Paste the system prompt from Section 2

# Step 2: Provide piece data
# Include harmonic analysis and structural events

# Step 3: Generate in batches
# Request measures 1-10, then 11-20, then 21-35

# Step 4: Validate and save
# Review outputs, save to content/pieces/commentary/bwv-846-prelude.json

# Step 5: Track progress
# Update your generation tracking document
```

### 9.2 Progress Tracking Template

Create a file to track what's been generated:

```markdown
# Clavier Content Generation Progress

## Glossary Terms
- [x] Basic Terms (25 terms) - 2024-01-15
- [x] Harmony Terms (40 terms) - 2024-01-16
- [ ] Counterpoint Terms (20 terms)
- [ ] Fugue Terms (15 terms)
- [ ] Form Terms (10 terms)
- [ ] Texture Terms (8 terms)

## Feature Definitions
- [x] Harmony Features (20 features) - 2024-01-17
- [ ] Counterpoint Features (17 features)
- [ ] Fugue Features (13 features)
- [ ] Form Features (12 features)

## Piece Introductions
- [x] Book I Preludes (24) - 2024-01-18
- [ ] Book I Fugues (24)
- [ ] Book II Preludes (24)
- [ ] Book II Fugues (24)

## Curriculum Lessons
- [ ] Fundamentals (6 lessons)
- [ ] Harmony (15 lessons)
- [ ] Counterpoint (10 lessons)
- [ ] Fugue (12 lessons)
- [ ] Form (8 lessons)
- [ ] Advanced (8 lessons)

## Measure Commentary
- [ ] BWV 846 Prelude (35 measures)
- [ ] BWV 846 Fugue (27 measures)
- [ ] BWV 847 Prelude (38 measures)
- [ ] BWV 847 Fugue (31 measures)
... [continue for all 48 pieces]

## Feature Instances
- [ ] Stretto instances (estimated 50)
- [ ] Sequence instances (estimated 100)
- [ ] Cadence instances (estimated 200)
... [continue for all features]
```

### 9.3 File Naming Conventions

```
content/
├── glossary/
│   └── terms.json                    # All glossary terms
│
├── features/
│   ├── definitions.json              # All feature definitions
│   └── instances/
│       ├── harmony/
│       │   ├── cadences.json         # All cadence instances
│       │   ├── sequences.json
│       │   └── ...
│       ├── counterpoint/
│       └── fugue/
│
├── pieces/
│   ├── introductions.json            # All 48 introductions
│   └── commentary/
│       ├── book1/
│       │   ├── bwv-846-prelude.json
│       │   ├── bwv-846-fugue.json
│       │   └── ...
│       └── book2/
│
└── curriculum/
    ├── structure.json                # Curriculum outline
    └── lessons/
        ├── fundamentals/
        │   ├── staff-and-clefs.json
        │   └── ...
        ├── harmony/
        ├── counterpoint/
        ├── fugue/
        ├── form/
        └── advanced/
```

---

## 10. Quality Checklist

### 10.1 Per-Item Checks

Run through this checklist for sampled outputs:

**Accuracy**
- [ ] Roman numerals are correct for the key
- [ ] Measure numbers match actual score
- [ ] Terminology is used correctly
- [ ] Claims are verifiable in the music

**Accessibility**
- [ ] Language is clear to non-musicians
- [ ] Terms are defined on first use
- [ ] Complex ideas are broken down
- [ ] No unexplained jargon

**Tone**
- [ ] Warm and encouraging
- [ ] Not condescending
- [ ] Intellectually engaging
- [ ] Appropriately enthusiastic

**Connections**
- [ ] Links to previous context
- [ ] Sets up what's coming
- [ ] Cross-references curriculum appropriately
- [ ] Explorer links are accurate

**Format**
- [ ] Valid JSON structure
- [ ] All required fields present
- [ ] Consistent key naming
- [ ] Appropriate length

### 10.2 Batch Validation

After generating a batch:

1. **Parse JSON**: Ensure all outputs parse correctly
2. **Spot check 10%**: Read through random samples
3. **Term consistency**: Verify terminology matches glossary
4. **Cross-reference**: Check that measure references exist
5. **Length audit**: Flag any unusually short or long entries

### 10.3 Known Edge Cases

Watch for these issues:

- **Anacrusis (pickup) measures**: Number carefully (some scores call it m0, others m1)
- **First vs. second endings**: Note which ending is being described
- **Ornaments**: Be careful about interpreting realizations
- **Editorial markings vs. original**: Schirmer editions have some editorial additions
- **Tempo and dynamics**: These are often editorial in WTC; note this if discussing

---

## Final Notes

This guide is designed for batch content generation using Claude Code with Opus 4.5. The system prompt establishes consistent voice and approach; individual prompts provide specific structure and context.

**Estimated total generation time**: 20-30 Claude Code sessions of 30-60 minutes each, depending on complexity and review cycles.

**Storage estimate**: Generated JSON files will total approximately 20-50MB depending on verbosity.

**Key success factors**:
1. Provide accurate harmonic analysis data for commentary generation
2. Generate in order (glossary first, then features, then lessons, then commentary)
3. Review early outputs carefully and refine prompts before bulk generation
4. Track progress systematically to avoid gaps or duplicates

Good luck with the generation process! The result will be a complete, structured content library ready to import into the Clavier application.
