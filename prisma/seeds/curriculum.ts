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
  // FUNDAMENTALS - Reading Bach - Key Signatures
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

  // HARMONIC ANALYSIS - Cadential Structures - Authentic Cadences
  {
    domainName: 'Harmonic Analysis',
    unitName: 'Cadential Structures',
    moduleName: 'Authentic Cadences',
    name: 'Perfect Authentic Cadence',
    description: 'The strongest type of cadence: V-I with tonic in soprano',
    orderIndex: 1,
    sections: {
      introduction: 'The perfect authentic cadence (PAC) provides the strongest sense of closure in tonal music.',
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

  // FUGUE - Fugue Anatomy - Exposition
  {
    domainName: 'Fugue',
    unitName: 'Fugue Anatomy',
    moduleName: 'Exposition',
    name: 'Subject and Answer',
    description: 'Understanding the primary thematic material and its imitation',
    orderIndex: 1,
    sections: {
      introduction: 'The fugue exposition presents the subject in all voices, alternating with its answer.',
      concepts: [
        'Fugue subject: the main melodic idea',
        'Real answer vs tonal answer',
        'Subject-answer alternation pattern',
      ],
      examples: [
        {
          piece: 'C Major Fugue, BWV 846',
          subject: 'mm. 1-2',
          answer: 'mm. 3-4',
          type: 'tonal answer',
        },
        {
          piece: 'C# Major Fugue, BWV 872',
          subject: 'mm. 1-4',
          answer: 'mm. 5-8',
          type: 'real answer',
        },
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
      introduction: 'A countersubject is a melodic line that consistently appears with the subject throughout the fugue.',
      concepts: [
        'Countersubject definition and function',
        'Invertible counterpoint at the octave',
        'Multiple countersubjects',
      ],
      examples: [
        {
          piece: 'C Minor Fugue, BWV 871',
          countersubject: 'First appears in soprano, mm. 3-5',
          characteristics: 'Stepwise motion contrasting with subject\'s leaps',
        },
      ],
      exercises: [
        'Identify countersubject entrances',
        'Analyze contrapuntal relationship with subject',
        'Track countersubject through entire fugue',
      ],
    },
  },

  // PERFORMANCE PRACTICE - Articulation and Phrasing - Voice Independence
  {
    domainName: 'Performance Practice',
    unitName: 'Articulation and Phrasing',
    moduleName: 'Voice Independence',
    name: 'Bringing Out Individual Voices',
    description: 'Techniques for projecting polyphonic texture at the keyboard',
    orderIndex: 1,
    sections: {
      introduction: 'In polyphonic music, each voice must be heard as an independent melodic line.',
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
