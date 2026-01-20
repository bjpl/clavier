import { PrismaClient } from '@prisma/client';

/**
 * Curriculum structure for learning the Well-Tempered Clavier
 * Organized into Domains → Units → Modules → Lessons
 */

interface DomainData {
  name: string;
  description: string;
  orderIndex: number;
  icon?: string;
}

interface UnitData {
  domainName: string;
  name: string;
  description: string;
  orderIndex: number;
}

interface ModuleData {
  domainName: string;
  unitName: string;
  name: string;
  description: string;
  orderIndex: number;
  estimatedDurationMinutes?: number;
}

interface LessonData {
  domainName: string;
  unitName: string;
  moduleName: string;
  name: string;
  description: string;
  orderIndex: number;
  sections: any;
}

const DOMAINS: DomainData[] = [
  {
    name: 'Fundamentals',
    description: 'Core concepts needed to understand Bach\'s counterpoint and harmony',
    orderIndex: 1,
    icon: '🎵',
  },
  {
    name: 'Harmonic Analysis',
    description: 'Understanding chord progressions, cadences, and tonal structure',
    orderIndex: 2,
    icon: '🎹',
  },
  {
    name: 'Contrapuntal Techniques',
    description: 'Principles of voice leading and polyphonic composition',
    orderIndex: 3,
    icon: '🎼',
  },
  {
    name: 'Fugue',
    description: 'Specialized study of fugal form and technique',
    orderIndex: 4,
    icon: '🎶',
  },
  {
    name: 'Performance Practice',
    description: 'Interpretation, articulation, and performance considerations',
    orderIndex: 5,
    icon: '🎭',
  },
];

const UNITS: UnitData[] = [
  // FUNDAMENTALS DOMAIN
  {
    domainName: 'Fundamentals',
    name: 'Reading Bach',
    description: 'Basic skills for reading and understanding Bach\'s notation',
    orderIndex: 1,
  },
  {
    domainName: 'Fundamentals',
    name: 'Keyboard Fundamentals',
    description: 'Essential keyboard skills for navigating polyphonic textures',
    orderIndex: 2,
  },

  // HARMONIC ANALYSIS DOMAIN
  {
    domainName: 'Harmonic Analysis',
    name: 'Diatonic Harmony',
    description: 'Triads, seventh chords, and basic progressions',
    orderIndex: 1,
  },
  {
    domainName: 'Harmonic Analysis',
    name: 'Chromatic Harmony',
    description: 'Altered chords, secondary dominants, and modulation',
    orderIndex: 2,
  },
  {
    domainName: 'Harmonic Analysis',
    name: 'Cadential Structures',
    description: 'Types of cadences and their structural functions',
    orderIndex: 3,
  },

  // CONTRAPUNTAL TECHNIQUES DOMAIN
  {
    domainName: 'Contrapuntal Techniques',
    name: 'Species Counterpoint',
    description: 'Fundamental principles of voice leading',
    orderIndex: 1,
  },
  {
    domainName: 'Contrapuntal Techniques',
    name: 'Imitative Techniques',
    description: 'Canon, imitation, and motivic development',
    orderIndex: 2,
  },
  {
    domainName: 'Contrapuntal Techniques',
    name: 'Invertible Counterpoint',
    description: 'Techniques for creating interchangeable voices',
    orderIndex: 3,
  },

  // FUGUE DOMAIN
  {
    domainName: 'Fugue',
    name: 'Fugue Anatomy',
    description: 'Understanding the structure and elements of fugue',
    orderIndex: 1,
  },
  {
    domainName: 'Fugue',
    name: 'Subject and Answer',
    description: 'Analysis and construction of fugue subjects',
    orderIndex: 2,
  },
  {
    domainName: 'Fugue',
    name: 'Developmental Techniques',
    description: 'Episodes, stretto, augmentation, and diminution',
    orderIndex: 3,
  },

  // PERFORMANCE PRACTICE DOMAIN
  {
    domainName: 'Performance Practice',
    name: 'Baroque Performance',
    description: 'Historical context and performance conventions',
    orderIndex: 1,
  },
  {
    domainName: 'Performance Practice',
    name: 'Articulation and Phrasing',
    description: 'Techniques for bringing out musical structure',
    orderIndex: 2,
  },
  {
    domainName: 'Performance Practice',
    name: 'Ornamentation',
    description: 'Trills, mordents, and other Baroque ornaments',
    orderIndex: 3,
  },
];

const MODULES: ModuleData[] = [
  // FUNDAMENTALS - Reading Bach
  {
    domainName: 'Fundamentals',
    unitName: 'Reading Bach',
    name: 'Clef Reading',
    description: 'Navigating treble, bass, alto, and tenor clefs',
    orderIndex: 1,
    estimatedDurationMinutes: 30,
  },
  {
    domainName: 'Fundamentals',
    unitName: 'Reading Bach',
    name: 'Key Signatures',
    description: 'All 24 major and minor keys used in the WTC',
    orderIndex: 2,
    estimatedDurationMinutes: 45,
  },

  // HARMONIC ANALYSIS - Diatonic Harmony
  {
    domainName: 'Harmonic Analysis',
    unitName: 'Diatonic Harmony',
    name: 'Triads and Inversions',
    description: 'Building and identifying triads in all positions',
    orderIndex: 1,
    estimatedDurationMinutes: 40,
  },
  {
    domainName: 'Harmonic Analysis',
    unitName: 'Diatonic Harmony',
    name: 'Seventh Chords',
    description: 'Dominant sevenths, diminished sevenths, and other seventh chords',
    orderIndex: 2,
    estimatedDurationMinutes: 50,
  },

  // HARMONIC ANALYSIS - Cadential Structures
  {
    domainName: 'Harmonic Analysis',
    unitName: 'Cadential Structures',
    name: 'Authentic Cadences',
    description: 'Perfect and imperfect authentic cadences',
    orderIndex: 1,
    estimatedDurationMinutes: 35,
  },
  {
    domainName: 'Harmonic Analysis',
    unitName: 'Cadential Structures',
    name: 'Half and Deceptive Cadences',
    description: 'Recognizing and analyzing incomplete cadences',
    orderIndex: 2,
    estimatedDurationMinutes: 35,
  },

  // CONTRAPUNTAL TECHNIQUES - Imitative Techniques
  {
    domainName: 'Contrapuntal Techniques',
    unitName: 'Imitative Techniques',
    name: 'Simple Imitation',
    description: 'Basic principles of imitative counterpoint',
    orderIndex: 1,
    estimatedDurationMinutes: 45,
  },
  {
    domainName: 'Contrapuntal Techniques',
    unitName: 'Imitative Techniques',
    name: 'Canon',
    description: 'Strict imitation and canonic devices',
    orderIndex: 2,
    estimatedDurationMinutes: 60,
  },

  // FUGUE - Fugue Anatomy
  {
    domainName: 'Fugue',
    unitName: 'Fugue Anatomy',
    name: 'Exposition',
    description: 'The opening section: subject, answer, and countersubject',
    orderIndex: 1,
    estimatedDurationMinutes: 50,
  },
  {
    domainName: 'Fugue',
    unitName: 'Fugue Anatomy',
    name: 'Episodes and Development',
    description: 'Connecting passages and developmental sections',
    orderIndex: 2,
    estimatedDurationMinutes: 55,
  },

  // PERFORMANCE PRACTICE - Articulation and Phrasing
  {
    domainName: 'Performance Practice',
    unitName: 'Articulation and Phrasing',
    name: 'Voice Independence',
    description: 'Bringing out individual voices in polyphonic texture',
    orderIndex: 1,
    estimatedDurationMinutes: 40,
  },
  {
    domainName: 'Performance Practice',
    unitName: 'Articulation and Phrasing',
    name: 'Structural Articulation',
    description: 'Using articulation to clarify form and harmony',
    orderIndex: 2,
    estimatedDurationMinutes: 45,
  },
];

const LESSONS: LessonData[] = [
  // ===========================================
  // FUNDAMENTALS DOMAIN
  // ===========================================

  // Reading Bach - Clef Reading
  {
    domainName: 'Fundamentals',
    unitName: 'Reading Bach',
    moduleName: 'Clef Reading',
    name: 'The Grand Staff',
    description: 'Introduction to treble and bass clefs',
    orderIndex: 1,
    sections: {
      introduction: 'The grand staff combines treble and bass clefs to represent the full range of keyboard music.',
      concepts: [
        'Treble clef reads higher pitches',
        'Bass clef reads lower pitches',
        'Middle C connects both staves',
        'Ledger lines extend the range',
      ],
      exercises: [
        'Identify notes on the treble clef',
        'Identify notes on the bass clef',
        'Practice reading both staves together',
      ],
    },
  },
  {
    domainName: 'Fundamentals',
    unitName: 'Reading Bach',
    moduleName: 'Clef Reading',
    name: 'Reading Notes on the Staff',
    description: 'Practice identifying notes in both clefs',
    orderIndex: 2,
    sections: {
      introduction: 'Fluent note reading is essential for learning Bach\'s keyboard works.',
      concepts: [
        'Lines and spaces pattern recognition',
        'Mnemonics for note names (FACE, Every Good Boy Does Fine)',
        'Octave identification',
        'Accidentals and their effects',
      ],
      exercises: [
        'Flash card practice for note names',
        'Sight-read simple melodies in each clef',
        'Identify octave positions',
      ],
    },
  },

  // Reading Bach - Key Signatures
  {
    domainName: 'Fundamentals',
    unitName: 'Reading Bach',
    moduleName: 'Key Signatures',
    name: 'Major Keys',
    description: 'The 12 major key signatures in the WTC',
    orderIndex: 1,
    sections: {
      introduction: 'Bach organized the Well-Tempered Clavier to demonstrate all 24 major and minor keys.',
      concepts: [
        'Circle of fifths organization',
        'Sharp and flat key signatures',
        'Enharmonic equivalents (e.g., C# major vs Db major)',
      ],
      examples: [
        { key: 'C Major', bwv: 846, sharpsFlats: 0 },
        { key: 'G Major', bwv: 884, sharpsFlats: 1 },
        { key: 'D Major', bwv: 874, sharpsFlats: 2 },
      ],
      exercises: [
        'Identify key signatures in WTC preludes',
        'Write out circle of fifths',
        'Practice scales in all major keys',
      ],
    },
  },
  {
    domainName: 'Fundamentals',
    unitName: 'Reading Bach',
    moduleName: 'Key Signatures',
    name: 'Minor Keys',
    description: 'The 12 minor key signatures and their relationships to relative majors',
    orderIndex: 2,
    sections: {
      introduction: 'Each major key has a relative minor sharing the same key signature.',
      concepts: [
        'Relative major/minor relationships',
        'Natural, harmonic, and melodic minor scales',
        'Leading tone alterations in minor keys',
      ],
      examples: [
        { key: 'C Minor', bwv: 871, relative: 'Eb Major' },
        { key: 'A Minor', bwv: 889, relative: 'C Major' },
        { key: 'E Minor', bwv: 879, relative: 'G Major' },
      ],
      exercises: [
        'Identify relative major/minor pairs',
        'Analyze scale degrees in minor key fugues',
        'Practice harmonic minor scales',
      ],
    },
  },

  // Keyboard Fundamentals
  {
    domainName: 'Fundamentals',
    unitName: 'Keyboard Fundamentals',
    moduleName: 'Clef Reading',
    name: 'Hand Position and Fingering',
    description: 'Basic keyboard technique for polyphonic music',
    orderIndex: 3,
    sections: {
      introduction: 'Proper hand position is essential for playing multiple independent voices.',
      concepts: [
        'Curved finger position',
        'Thumb under and over techniques',
        'Independent finger control',
        'Fingering patterns for scales',
      ],
      exercises: [
        'Five-finger exercises',
        'Scales with correct fingering',
        'Independence exercises',
      ],
    },
  },

  // ===========================================
  // HARMONIC ANALYSIS DOMAIN
  // ===========================================

  // Diatonic Harmony - Triads and Inversions
  {
    domainName: 'Harmonic Analysis',
    unitName: 'Diatonic Harmony',
    moduleName: 'Triads and Inversions',
    name: 'Building Triads',
    description: 'Constructing triads from scales',
    orderIndex: 1,
    sections: {
      introduction: 'Triads are three-note chords built by stacking thirds.',
      concepts: [
        'Root, third, and fifth',
        'Major triads: major third + minor third',
        'Minor triads: minor third + major third',
        'Diminished and augmented triads',
      ],
      examples: [
        { chord: 'C Major', notes: 'C-E-G' },
        { chord: 'D Minor', notes: 'D-F-A' },
        { chord: 'B Diminished', notes: 'B-D-F' },
      ],
      exercises: [
        'Build triads on each scale degree',
        'Identify triad quality by ear',
        'Spell triads quickly',
      ],
    },
  },
  {
    domainName: 'Harmonic Analysis',
    unitName: 'Diatonic Harmony',
    moduleName: 'Triads and Inversions',
    name: 'Triad Inversions',
    description: 'Root position, first inversion, and second inversion',
    orderIndex: 2,
    sections: {
      introduction: 'Inversions change which note is in the bass while keeping the same chord.',
      concepts: [
        'Root position: root in bass',
        'First inversion (6): third in bass',
        'Second inversion (6/4): fifth in bass',
        'Figured bass notation',
      ],
      examples: [
        { chord: 'C Major root', notes: 'C-E-G', figured: '5/3' },
        { chord: 'C Major first inv', notes: 'E-G-C', figured: '6' },
        { chord: 'C Major second inv', notes: 'G-C-E', figured: '6/4' },
      ],
      exercises: [
        'Play inversions of all triads',
        'Identify inversions by ear',
        'Analyze inversions in Bach chorales',
      ],
    },
  },

  // Diatonic Harmony - Seventh Chords
  {
    domainName: 'Harmonic Analysis',
    unitName: 'Diatonic Harmony',
    moduleName: 'Seventh Chords',
    name: 'Dominant Seventh Chords',
    description: 'V7 construction and resolution',
    orderIndex: 1,
    sections: {
      introduction: 'The dominant seventh chord creates strong harmonic drive toward resolution.',
      concepts: [
        'Dominant seventh structure: major triad + minor seventh',
        'Tendency tones: leading tone and chordal seventh',
        'Resolution to tonic',
        'Inversions of V7',
      ],
      examples: [
        { piece: 'C Major Prelude, BWV 846', measure: 33, description: 'G7 resolving to C' },
      ],
      exercises: [
        'Build V7 in all keys',
        'Practice V7-I resolutions',
        'Identify V7 chords in WTC preludes',
      ],
    },
  },
  {
    domainName: 'Harmonic Analysis',
    unitName: 'Diatonic Harmony',
    moduleName: 'Seventh Chords',
    name: 'Other Diatonic Seventh Chords',
    description: 'ii7, IV7, vi7, and diminished seventh chords',
    orderIndex: 2,
    sections: {
      introduction: 'Each scale degree can support its own seventh chord.',
      concepts: [
        'Major seventh: ii7 in major',
        'Minor seventh: IV7, vi7',
        'Half-diminished: viiø7 in major',
        'Fully diminished: vii°7 in minor',
      ],
      exercises: [
        'Build seventh chords on each scale degree',
        'Analyze seventh chord progressions',
        'Voice lead common seventh chord patterns',
      ],
    },
  },

  // Cadential Structures - Authentic Cadences
  {
    domainName: 'Harmonic Analysis',
    unitName: 'Cadential Structures',
    moduleName: 'Authentic Cadences',
    name: 'Perfect Authentic Cadence',
    description: 'The strongest type of cadence: V-I with tonic in soprano',
    orderIndex: 1,
    sections: {
      introduction: 'The perfect authentic cadence (PAC) provides the strongest sense of closure.',
      concepts: [
        'V-I progression in root position',
        'Tonic in the soprano voice',
        'Structural significance and phrase-ending function',
      ],
      examples: [
        { piece: 'C Major Prelude, BWV 846', measure: 34 },
        { piece: 'D Major Fugue, BWV 874', measure: 47 },
      ],
      exercises: [
        'Locate PACs in assigned pieces',
        'Analyze voice leading in cadences',
        'Compare PACs to other cadence types',
      ],
    },
  },
  {
    domainName: 'Harmonic Analysis',
    unitName: 'Cadential Structures',
    moduleName: 'Authentic Cadences',
    name: 'Imperfect Authentic Cadence',
    description: 'V-I without tonic in soprano or with inverted chords',
    orderIndex: 2,
    sections: {
      introduction: 'Imperfect authentic cadences provide closure but less finality than PAC.',
      concepts: [
        'V-I with third or fifth in soprano',
        'Using inverted V or I chords',
        'Hierarchical relationship to PAC',
      ],
      exercises: [
        'Compare IAC to PAC in the same piece',
        'Identify which variation of IAC is used',
      ],
    },
  },

  // Cadential Structures - Half and Deceptive Cadences
  {
    domainName: 'Harmonic Analysis',
    unitName: 'Cadential Structures',
    moduleName: 'Half and Deceptive Cadences',
    name: 'Half Cadences',
    description: 'Phrases ending on the dominant',
    orderIndex: 1,
    sections: {
      introduction: 'Half cadences create expectation by ending on V.',
      concepts: [
        'Any chord moving to V',
        'Creates open, unfinished feeling',
        'Often used at phrase midpoints',
      ],
      exercises: [
        'Find half cadences in WTC pieces',
        'Analyze what chords precede V in half cadences',
      ],
    },
  },
  {
    domainName: 'Harmonic Analysis',
    unitName: 'Cadential Structures',
    moduleName: 'Half and Deceptive Cadences',
    name: 'Deceptive Cadences',
    description: 'V resolving to vi instead of I',
    orderIndex: 2,
    sections: {
      introduction: 'Deceptive cadences surprise the listener by avoiding expected resolution.',
      concepts: [
        'V-vi progression',
        'Voice leading from V to vi',
        'Dramatic and expressive effect',
      ],
      examples: [
        { piece: 'C Minor Prelude, BWV 871', description: 'Deceptive cadence extends phrase' },
      ],
      exercises: [
        'Practice V-vi voice leading',
        'Locate deceptive cadences in Bach',
      ],
    },
  },

  // Chromatic Harmony
  {
    domainName: 'Harmonic Analysis',
    unitName: 'Chromatic Harmony',
    moduleName: 'Triads and Inversions',
    name: 'Secondary Dominants',
    description: 'V/V, V/IV, and other tonicizations',
    orderIndex: 3,
    sections: {
      introduction: 'Secondary dominants temporarily tonicize non-tonic chords.',
      concepts: [
        'Applied dominant concept',
        'V/V resolves to V',
        'V/ii, V/IV, V/vi patterns',
        'Chromatic voice leading',
      ],
      examples: [
        { piece: 'G Major Prelude, BWV 884', measure: 12, description: 'V/V tonicization' },
      ],
      exercises: [
        'Identify secondary dominants in WTC',
        'Voice lead secondary dominant progressions',
      ],
    },
  },

  // ===========================================
  // CONTRAPUNTAL TECHNIQUES DOMAIN
  // ===========================================

  // Species Counterpoint
  {
    domainName: 'Contrapuntal Techniques',
    unitName: 'Species Counterpoint',
    moduleName: 'Simple Imitation',
    name: 'First Species',
    description: 'Note-against-note counterpoint',
    orderIndex: 1,
    sections: {
      introduction: 'First species is the foundation of all counterpoint.',
      concepts: [
        'One note against one note',
        'Consonant intervals only',
        'Contrary and oblique motion preferred',
        'Beginning and ending on perfect consonances',
      ],
      exercises: [
        'Write first species above a cantus firmus',
        'Write first species below a cantus firmus',
      ],
    },
  },
  {
    domainName: 'Contrapuntal Techniques',
    unitName: 'Species Counterpoint',
    moduleName: 'Simple Imitation',
    name: 'Second Species',
    description: 'Two notes against one',
    orderIndex: 2,
    sections: {
      introduction: 'Second species introduces rhythmic variety and dissonance treatment.',
      concepts: [
        'Two notes against each note of cantus firmus',
        'Passing tones on weak beats',
        'Strong beats must be consonant',
      ],
      exercises: [
        'Write second species counterpoint',
        'Identify passing tones in Bach',
      ],
    },
  },

  // Imitative Techniques
  {
    domainName: 'Contrapuntal Techniques',
    unitName: 'Imitative Techniques',
    moduleName: 'Simple Imitation',
    name: 'Imitation at the Octave',
    description: 'Basic principles of imitative counterpoint',
    orderIndex: 1,
    sections: {
      introduction: 'Imitation is the foundation of fugal writing.',
      concepts: [
        'Leading voice presents material first',
        'Following voice imitates at a time interval',
        'Pitch transposition',
        'Strict vs free imitation',
      ],
      examples: [
        { piece: 'C Major Fugue, BWV 846', description: 'Subject imitated at the octave' },
      ],
      exercises: [
        'Identify imitative entries',
        'Write short imitative passages',
      ],
    },
  },
  {
    domainName: 'Contrapuntal Techniques',
    unitName: 'Imitative Techniques',
    moduleName: 'Canon',
    name: 'Canon at the Unison',
    description: 'Strict imitation at the same pitch level',
    orderIndex: 1,
    sections: {
      introduction: 'Canon is the strictest form of imitation.',
      concepts: [
        'Exact melodic imitation',
        'Dux (leader) and comes (follower)',
        'Time interval of imitation',
      ],
      exercises: [
        'Write a simple canon at the unison',
        'Analyze canonic passages in WTC',
      ],
    },
  },
  {
    domainName: 'Contrapuntal Techniques',
    unitName: 'Imitative Techniques',
    moduleName: 'Canon',
    name: 'Canon at the Fifth',
    description: 'Strict imitation transposed by a fifth',
    orderIndex: 2,
    sections: {
      introduction: 'Canon at the fifth requires careful handling of tonal adjustments.',
      concepts: [
        'Transposition up or down a fifth',
        'Tonal vs real answer considerations',
        'Maintaining harmonic consistency',
      ],
      exercises: [
        'Write a canon at the fifth',
        'Compare canons at the unison and fifth',
      ],
    },
  },

  // Invertible Counterpoint
  {
    domainName: 'Contrapuntal Techniques',
    unitName: 'Invertible Counterpoint',
    moduleName: 'Simple Imitation',
    name: 'Double Counterpoint at the Octave',
    description: 'Two voices that can switch positions',
    orderIndex: 3,
    sections: {
      introduction: 'Double counterpoint allows voices to interchange.',
      concepts: [
        'Both voices work in either position',
        'Interval considerations for invertibility',
        'Avoiding parallel fifths when inverted',
      ],
      exercises: [
        'Analyze invertible counterpoint in fugues',
        'Write a short passage in double counterpoint',
      ],
    },
  },

  // ===========================================
  // FUGUE DOMAIN
  // ===========================================

  // Fugue Anatomy - Exposition
  {
    domainName: 'Fugue',
    unitName: 'Fugue Anatomy',
    moduleName: 'Exposition',
    name: 'Subject and Answer',
    description: 'Understanding the primary thematic material and its imitation',
    orderIndex: 1,
    sections: {
      introduction: 'The fugue exposition presents the subject in all voices.',
      concepts: [
        'Fugue subject: the main melodic idea',
        'Real answer vs tonal answer',
        'Subject-answer alternation pattern',
      ],
      examples: [
        { piece: 'C Major Fugue, BWV 846', subject: 'mm. 1-2', answer: 'mm. 3-4', type: 'tonal answer' },
        { piece: 'C# Major Fugue, BWV 872', subject: 'mm. 1-4', answer: 'mm. 5-8', type: 'real answer' },
      ],
      exercises: [
        'Identify subject entries in exposition',
        'Determine whether answers are real or tonal',
        'Map the complete exposition structure',
      ],
    },
  },
  {
    domainName: 'Fugue',
    unitName: 'Fugue Anatomy',
    moduleName: 'Exposition',
    name: 'Countersubject',
    description: 'The recurring contrapuntal line accompanying the subject',
    orderIndex: 2,
    sections: {
      introduction: 'A countersubject consistently appears with the subject.',
      concepts: [
        'Countersubject definition and function',
        'Invertible counterpoint at the octave',
        'Multiple countersubjects',
      ],
      examples: [
        { piece: 'C Minor Fugue, BWV 871', countersubject: 'mm. 3-5', characteristics: 'Stepwise motion contrasting with leaps' },
      ],
      exercises: [
        'Identify countersubject entrances',
        'Analyze contrapuntal relationship with subject',
        'Track countersubject through entire fugue',
      ],
    },
  },
  {
    domainName: 'Fugue',
    unitName: 'Fugue Anatomy',
    moduleName: 'Exposition',
    name: 'Complete Exposition Analysis',
    description: 'Mapping all entries in a fugue exposition',
    orderIndex: 3,
    sections: {
      introduction: 'Understanding the full structure of a fugue exposition.',
      concepts: [
        'Order of voice entries',
        'Codetta passages between entries',
        'Link material',
        'When exposition ends',
      ],
      exercises: [
        'Analyze a complete 3-voice exposition',
        'Analyze a complete 4-voice exposition',
      ],
    },
  },

  // Subject and Answer
  {
    domainName: 'Fugue',
    unitName: 'Subject and Answer',
    moduleName: 'Exposition',
    name: 'Real vs Tonal Answer',
    description: 'When to modify the answer and why',
    orderIndex: 4,
    sections: {
      introduction: 'The answer may be exact (real) or modified (tonal).',
      concepts: [
        'Real answer: exact transposition to the dominant',
        'Tonal answer: modified transposition',
        'Subjects beginning on scale degrees 1 or 5',
        'Head and tail modification',
      ],
      examples: [
        { piece: 'G Minor Fugue, BWV 885', type: 'tonal', reason: 'Subject begins on dominant' },
      ],
      exercises: [
        'Determine answer type for various subjects',
        'Write tonal answers for given subjects',
      ],
    },
  },

  // Fugue Development
  {
    domainName: 'Fugue',
    unitName: 'Developmental Techniques',
    moduleName: 'Episodes and Development',
    name: 'Episode Construction',
    description: 'Creating episodes from subject material',
    orderIndex: 1,
    sections: {
      introduction: 'Episodes connect subject entries and modulate.',
      concepts: [
        'Sequences derived from subject',
        'Modulation to related keys',
        'Motivic fragmentation',
      ],
      exercises: [
        'Analyze episode material origins',
        'Track key areas through episodes',
      ],
    },
  },
  {
    domainName: 'Fugue',
    unitName: 'Developmental Techniques',
    moduleName: 'Episodes and Development',
    name: 'Stretto',
    description: 'Overlapping subject entries',
    orderIndex: 2,
    sections: {
      introduction: 'Stretto intensifies the fugue by overlapping entries.',
      concepts: [
        'Subject entries before previous completion',
        'Stretto at different time intervals',
        'Building tension toward climax',
      ],
      examples: [
        { piece: 'C Major Fugue, BWV 846', measure: 22, description: 'Two-voice stretto' },
      ],
      exercises: [
        'Identify stretto passages in WTC fugues',
        'Analyze stretto intervals',
      ],
    },
  },
  {
    domainName: 'Fugue',
    unitName: 'Developmental Techniques',
    moduleName: 'Episodes and Development',
    name: 'Augmentation and Diminution',
    description: 'Rhythmic transformation of the subject',
    orderIndex: 3,
    sections: {
      introduction: 'Subjects can be lengthened or shortened rhythmically.',
      concepts: [
        'Augmentation: doubling note values',
        'Diminution: halving note values',
        'Combined with other voices',
      ],
      exercises: [
        'Find augmented subjects in WTC',
        'Analyze the effect of rhythmic transformation',
      ],
    },
  },

  // ===========================================
  // PERFORMANCE PRACTICE DOMAIN
  // ===========================================

  // Baroque Performance
  {
    domainName: 'Performance Practice',
    unitName: 'Baroque Performance',
    moduleName: 'Voice Independence',
    name: 'Historical Context',
    description: 'Understanding Baroque performance conventions',
    orderIndex: 1,
    sections: {
      introduction: 'Baroque music requires understanding of historical performance practice.',
      concepts: [
        'Keyboard instruments of Bach\'s time',
        'Touch and articulation conventions',
        'Tempo and rhythm interpretation',
        'Dynamic terracing',
      ],
      exercises: [
        'Compare harpsichord and piano performances',
        'Research clavichord characteristics',
      ],
    },
  },

  // Articulation and Phrasing
  {
    domainName: 'Performance Practice',
    unitName: 'Articulation and Phrasing',
    moduleName: 'Voice Independence',
    name: 'Bringing Out Individual Voices',
    description: 'Techniques for projecting polyphonic texture at the keyboard',
    orderIndex: 1,
    sections: {
      introduction: 'In polyphonic music, each voice must be heard as independent.',
      concepts: [
        'Dynamic shaping of individual voices',
        'Articulation differences between voices',
        'Fingering choices that support voice clarity',
      ],
      techniques: [
        'Practice each voice separately',
        'Emphasize voice entries',
        'Use subtle dynamic gradation',
        'Maintain consistent touch within each voice',
      ],
      exercises: [
        'Play C Major Prelude with exaggerated voice differentiation',
        'Practice bringing out soprano, then alto, then bass',
        'Record and listen critically to voice balance',
      ],
    },
  },
  {
    domainName: 'Performance Practice',
    unitName: 'Articulation and Phrasing',
    moduleName: 'Structural Articulation',
    name: 'Phrase Structure',
    description: 'Identifying and shaping phrases',
    orderIndex: 1,
    sections: {
      introduction: 'Musical phrases in Bach often follow rhetorical principles.',
      concepts: [
        'Phrase beginnings and endings',
        'Breathing points',
        'Phrase rhythm and hierarchy',
      ],
      exercises: [
        'Mark phrase boundaries in a prelude',
        'Practice phrase shaping',
      ],
    },
  },
  {
    domainName: 'Performance Practice',
    unitName: 'Articulation and Phrasing',
    moduleName: 'Structural Articulation',
    name: 'Articulation Patterns',
    description: 'Standard Baroque articulation practices',
    orderIndex: 2,
    sections: {
      introduction: 'Articulation clarifies structure and affects expression.',
      concepts: [
        'Detached vs legato touch',
        'Paired slurring patterns',
        'Note inégale in appropriate contexts',
      ],
      exercises: [
        'Apply articulation patterns to scales',
        'Experiment with different articulation interpretations',
      ],
    },
  },

  // Ornamentation
  {
    domainName: 'Performance Practice',
    unitName: 'Ornamentation',
    moduleName: 'Voice Independence',
    name: 'Trills',
    description: 'Trill execution in Baroque music',
    orderIndex: 2,
    sections: {
      introduction: 'Trills are the most common Baroque ornament.',
      concepts: [
        'Trills typically begin on upper note',
        'Trill speed and length',
        'Termination patterns',
        'Trills in context',
      ],
      exercises: [
        'Practice trill exercises',
        'Apply trills to marked passages',
      ],
    },
  },
  {
    domainName: 'Performance Practice',
    unitName: 'Ornamentation',
    moduleName: 'Voice Independence',
    name: 'Mordents and Turns',
    description: 'Other essential Baroque ornaments',
    orderIndex: 3,
    sections: {
      introduction: 'Mordents and turns add rhythmic interest.',
      concepts: [
        'Lower mordent execution',
        'Turn patterns',
        'Rhythmic placement',
      ],
      exercises: [
        'Practice mordent exercises',
        'Add appropriate ornaments to a prelude',
      ],
    },
  },
];

export async function seedCurriculum(prisma: PrismaClient) {
  console.log('Seeding curriculum structure...');

  // Create domains
  const domainMap = new Map<string, string>();
  for (const domainData of DOMAINS) {
    const domain = await prisma.domain.upsert({
      where: { name: domainData.name },
      update: {},
      create: domainData,
    });
    domainMap.set(domain.name, domain.id);
  }
  console.log(`✓ Created ${DOMAINS.length} domains`);

  // Create units
  const unitMap = new Map<string, string>();
  for (const unitData of UNITS) {
    const domainId = domainMap.get(unitData.domainName);
    if (!domainId) continue;

    const { domainName, ...data } = unitData;
    const unit = await prisma.unit.upsert({
      where: {
        domainId_orderIndex: {
          domainId,
          orderIndex: data.orderIndex,
        },
      },
      update: {},
      create: {
        ...data,
        domainId,
      },
    });
    unitMap.set(`${unitData.domainName}:${unitData.name}`, unit.id);
  }
  console.log(`✓ Created ${UNITS.length} units`);

  // Create modules
  const moduleMap = new Map<string, string>();
  for (const moduleData of MODULES) {
    const unitId = unitMap.get(`${moduleData.domainName}:${moduleData.unitName}`);
    if (!unitId) continue;

    const { domainName, unitName, ...data } = moduleData;
    const module = await prisma.module.upsert({
      where: {
        unitId_orderIndex: {
          unitId,
          orderIndex: data.orderIndex,
        },
      },
      update: {},
      create: {
        ...data,
        unitId,
      },
    });
    moduleMap.set(
      `${moduleData.domainName}:${moduleData.unitName}:${moduleData.name}`,
      module.id
    );
  }
  console.log(`✓ Created ${MODULES.length} modules`);

  // Create lessons
  for (const lessonData of LESSONS) {
    const moduleId = moduleMap.get(
      `${lessonData.domainName}:${lessonData.unitName}:${lessonData.moduleName}`
    );
    if (!moduleId) continue;

    const { domainName, unitName, moduleName, ...data } = lessonData;
    await prisma.lesson.upsert({
      where: {
        moduleId_orderIndex: {
          moduleId,
          orderIndex: data.orderIndex,
        },
      },
      update: {},
      create: {
        ...data,
        moduleId,
      },
    });
  }
  console.log(`✓ Created ${LESSONS.length} lessons`);
}
