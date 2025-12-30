/**
 * Curriculum Structure - 6 Domains with Units and Modules
 * This defines the hierarchical organization of the curriculum
 */

import { Domain } from '@/lib/types/curriculum';

export const curriculumDomains: Domain[] = [
  {
    id: 'fundamentals',
    name: 'Fundamentals',
    description: 'Core concepts of music notation, rhythm, and basic harmony',
    order: 1,
    color: '#3B82F6', // blue
    icon: '🎵',
    units: [
      {
        id: 'notation-basics',
        domainId: 'fundamentals',
        name: 'Notation Basics',
        description: 'Reading and writing standard music notation',
        order: 1,
        modules: [
          {
            id: 'staff-clefs',
            unitId: 'notation-basics',
            name: 'Staff and Clefs',
            description: 'Understanding the staff, clefs, and note placement',
            order: 1,
            lessons: [
              {
                id: 'lesson-fund-001',
                moduleId: 'staff-clefs',
                title: 'The Grand Staff',
                description: 'Introduction to treble and bass clefs',
                duration: 15,
                difficulty: 'beginner',
                order: 1,
              },
              {
                id: 'lesson-fund-002',
                moduleId: 'staff-clefs',
                title: 'Reading Notes on the Staff',
                description: 'Practice identifying notes in both clefs',
                duration: 20,
                difficulty: 'beginner',
                order: 2,
                prerequisites: ['lesson-fund-001'],
              },
            ],
          },
        ],
      },
      {
        id: 'rhythm-meter',
        domainId: 'fundamentals',
        name: 'Rhythm and Meter',
        description: 'Time signatures, note values, and rhythmic patterns',
        order: 2,
        modules: [
          {
            id: 'time-signatures',
            unitId: 'rhythm-meter',
            name: 'Time Signatures',
            description: 'Understanding meter and beat groupings',
            order: 1,
            lessons: [
              {
                id: 'lesson-fund-003',
                moduleId: 'time-signatures',
                title: 'Simple Meter',
                description: 'Common time signatures: 2/4, 3/4, 4/4',
                duration: 18,
                difficulty: 'beginner',
                order: 1,
              },
              {
                id: 'lesson-fund-004',
                moduleId: 'time-signatures',
                title: 'Compound Meter',
                description: 'Understanding 6/8, 9/8, and 12/8',
                duration: 22,
                difficulty: 'intermediate',
                order: 2,
                prerequisites: ['lesson-fund-003'],
              },
            ],
          },
        ],
      },
      {
        id: 'scales-keys',
        domainId: 'fundamentals',
        name: 'Scales and Keys',
        description: 'Major and minor scales, key signatures',
        order: 3,
        modules: [
          {
            id: 'major-scales',
            unitId: 'scales-keys',
            name: 'Major Scales',
            description: 'Construction and recognition of major scales',
            order: 1,
            lessons: [
              {
                id: 'lesson-fund-005',
                moduleId: 'major-scales',
                title: 'The Major Scale',
                description: 'Whole and half steps, scale degrees',
                duration: 20,
                difficulty: 'beginner',
                order: 1,
              },
              {
                id: 'lesson-fund-006',
                moduleId: 'major-scales',
                title: 'Key Signatures',
                description: 'Circle of fifths and key identification',
                duration: 25,
                difficulty: 'intermediate',
                order: 2,
                prerequisites: ['lesson-fund-005'],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'harmony',
    name: 'Harmony',
    description: 'Chord construction, progressions, and voice leading',
    order: 2,
    color: '#10B981', // green
    icon: '🎹',
    units: [
      {
        id: 'triads',
        domainId: 'harmony',
        name: 'Triads',
        description: 'Three-note chords and their inversions',
        order: 1,
        modules: [
          {
            id: 'triad-types',
            unitId: 'triads',
            name: 'Triad Types',
            description: 'Major, minor, diminished, and augmented triads',
            order: 1,
            lessons: [
              {
                id: 'lesson-harm-001',
                moduleId: 'triad-types',
                title: 'Building Triads',
                description: 'Constructing triads from scales',
                duration: 20,
                difficulty: 'beginner',
                order: 1,
              },
              {
                id: 'lesson-harm-002',
                moduleId: 'triad-types',
                title: 'Triad Quality Recognition',
                description: 'Identifying major, minor, diminished, augmented',
                duration: 18,
                difficulty: 'beginner',
                order: 2,
                prerequisites: ['lesson-harm-001'],
              },
            ],
          },
          {
            id: 'inversions',
            unitId: 'triads',
            name: 'Inversions',
            description: 'Root position, first, and second inversion',
            order: 2,
            lessons: [
              {
                id: 'lesson-harm-003',
                moduleId: 'inversions',
                title: 'Triad Inversions',
                description: 'Root position, 6, and 6/4 chords',
                duration: 22,
                difficulty: 'intermediate',
                order: 1,
                prerequisites: ['lesson-harm-002'],
              },
            ],
          },
        ],
      },
      {
        id: 'seventh-chords',
        domainId: 'harmony',
        name: 'Seventh Chords',
        description: 'Four-note chords and their functions',
        order: 2,
        modules: [
          {
            id: 'seventh-types',
            unitId: 'seventh-chords',
            name: 'Seventh Chord Types',
            description: 'Major, minor, dominant, half-diminished, diminished',
            order: 1,
            lessons: [
              {
                id: 'lesson-harm-004',
                moduleId: 'seventh-types',
                title: 'Dominant Seventh Chords',
                description: 'V7 construction and resolution',
                duration: 25,
                difficulty: 'intermediate',
                order: 1,
                prerequisites: ['lesson-harm-003'],
              },
              {
                id: 'lesson-harm-005',
                moduleId: 'seventh-types',
                title: 'Diatonic Seventh Chords',
                description: 'Seventh chords built on each scale degree',
                duration: 28,
                difficulty: 'intermediate',
                order: 2,
                prerequisites: ['lesson-harm-004'],
              },
            ],
          },
        ],
      },
      {
        id: 'progressions',
        domainId: 'harmony',
        name: 'Chord Progressions',
        description: 'Harmonic motion and functional harmony',
        order: 3,
        modules: [
          {
            id: 'basic-progressions',
            unitId: 'progressions',
            name: 'Basic Progressions',
            description: 'Common chord patterns and cadences',
            order: 1,
            lessons: [
              {
                id: 'lesson-harm-006',
                moduleId: 'basic-progressions',
                title: 'Tonic, Subdominant, Dominant',
                description: 'The three harmonic functions',
                duration: 20,
                difficulty: 'intermediate',
                order: 1,
                prerequisites: ['lesson-harm-003'],
              },
              {
                id: 'lesson-harm-007',
                moduleId: 'basic-progressions',
                title: 'Cadences',
                description: 'Authentic, plagal, half, and deceptive cadences',
                duration: 22,
                difficulty: 'intermediate',
                order: 2,
                prerequisites: ['lesson-harm-006'],
              },
            ],
          },
        ],
      },
      {
        id: 'voice-leading',
        domainId: 'harmony',
        name: 'Voice Leading',
        description: 'Smooth motion between chords',
        order: 4,
        modules: [
          {
            id: 'four-part-writing',
            unitId: 'voice-leading',
            name: 'Four-Part Writing',
            description: 'SATB writing and voice leading principles',
            order: 1,
            lessons: [
              {
                id: 'lesson-harm-008',
                moduleId: 'four-part-writing',
                title: 'Voice Leading Basics',
                description: 'Common tone, stepwise motion, and leaps',
                duration: 25,
                difficulty: 'intermediate',
                order: 1,
                prerequisites: ['lesson-harm-006'],
              },
              {
                id: 'lesson-harm-009',
                moduleId: 'four-part-writing',
                title: 'Parallel Motion Rules',
                description: 'Avoiding parallel fifths and octaves',
                duration: 20,
                difficulty: 'intermediate',
                order: 2,
                prerequisites: ['lesson-harm-008'],
              },
            ],
          },
        ],
      },
      {
        id: 'chromatic-harmony',
        domainId: 'harmony',
        name: 'Chromatic Harmony',
        description: 'Secondary dominants and borrowed chords',
        order: 5,
        modules: [
          {
            id: 'secondary-dominants',
            unitId: 'chromatic-harmony',
            name: 'Secondary Dominants',
            description: 'V/V and other tonicization techniques',
            order: 1,
            lessons: [
              {
                id: 'lesson-harm-010',
                moduleId: 'secondary-dominants',
                title: 'Introduction to Secondary Dominants',
                description: 'V/V, V/IV, and V/vi',
                duration: 28,
                difficulty: 'advanced',
                order: 1,
                prerequisites: ['lesson-harm-007'],
              },
              {
                id: 'lesson-harm-011',
                moduleId: 'secondary-dominants',
                title: 'Secondary Leading-Tone Chords',
                description: 'vii°/V and other secondary diminished chords',
                duration: 25,
                difficulty: 'advanced',
                order: 2,
                prerequisites: ['lesson-harm-010'],
              },
            ],
          },
          {
            id: 'modal-mixture',
            unitId: 'chromatic-harmony',
            name: 'Modal Mixture',
            description: 'Borrowing chords from parallel modes',
            order: 2,
            lessons: [
              {
                id: 'lesson-harm-012',
                moduleId: 'modal-mixture',
                title: 'Borrowed Chords',
                description: 'iv in major, ♭VI, ♭VII, and others',
                duration: 30,
                difficulty: 'advanced',
                order: 1,
                prerequisites: ['lesson-harm-010'],
              },
              {
                id: 'lesson-harm-013',
                moduleId: 'modal-mixture',
                title: 'Neapolitan Sixth Chord',
                description: 'The ♭II6 chord and its uses',
                duration: 22,
                difficulty: 'advanced',
                order: 2,
                prerequisites: ['lesson-harm-012'],
              },
              {
                id: 'lesson-harm-014',
                moduleId: 'modal-mixture',
                title: 'Augmented Sixth Chords',
                description: 'Italian, French, and German sixth chords',
                duration: 28,
                difficulty: 'advanced',
                order: 3,
                prerequisites: ['lesson-harm-013'],
              },
            ],
          },
        ],
      },
      {
        id: 'modulation',
        domainId: 'harmony',
        name: 'Modulation',
        description: 'Changing keys and tonal centers',
        order: 6,
        modules: [
          {
            id: 'modulation-techniques',
            unitId: 'modulation',
            name: 'Modulation Techniques',
            description: 'Common-chord and chromatic modulation',
            order: 1,
            lessons: [
              {
                id: 'lesson-harm-015',
                moduleId: 'modulation-techniques',
                title: 'Common-Chord Modulation',
                description: 'Modulating via shared chords',
                duration: 25,
                difficulty: 'advanced',
                order: 1,
                prerequisites: ['lesson-harm-007'],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'counterpoint',
    name: 'Counterpoint',
    description: 'Independent melodic lines and polyphonic writing',
    order: 3,
    color: '#8B5CF6', // purple
    icon: '🎼',
    units: [
      {
        id: 'species-counterpoint',
        domainId: 'counterpoint',
        name: 'Species Counterpoint',
        description: 'Five species approach to contrapuntal writing',
        order: 1,
        modules: [
          {
            id: 'first-species',
            unitId: 'species-counterpoint',
            name: 'First Species',
            description: 'Note-against-note counterpoint',
            order: 1,
            lessons: [
              {
                id: 'lesson-cpt-001',
                moduleId: 'first-species',
                title: 'First Species Rules',
                description: 'Basic principles of note-against-note writing',
                duration: 25,
                difficulty: 'intermediate',
                order: 1,
              },
              {
                id: 'lesson-cpt-002',
                moduleId: 'first-species',
                title: 'Consonant Intervals',
                description: 'Perfect and imperfect consonances',
                duration: 20,
                difficulty: 'intermediate',
                order: 2,
                prerequisites: ['lesson-cpt-001'],
              },
            ],
          },
          {
            id: 'second-species',
            unitId: 'species-counterpoint',
            name: 'Second Species',
            description: 'Two notes against one',
            order: 2,
            lessons: [
              {
                id: 'lesson-cpt-003',
                moduleId: 'second-species',
                title: 'Second Species Introduction',
                description: 'Adding rhythmic variety with two-against-one',
                duration: 28,
                difficulty: 'intermediate',
                order: 1,
                prerequisites: ['lesson-cpt-002'],
              },
              {
                id: 'lesson-cpt-004',
                moduleId: 'second-species',
                title: 'Passing and Neighbor Tones',
                description: 'Dissonance treatment in second species',
                duration: 25,
                difficulty: 'intermediate',
                order: 2,
                prerequisites: ['lesson-cpt-003'],
              },
            ],
          },
          {
            id: 'third-species',
            unitId: 'species-counterpoint',
            name: 'Third Species',
            description: 'Four notes against one',
            order: 3,
            lessons: [
              {
                id: 'lesson-cpt-005',
                moduleId: 'third-species',
                title: 'Third Species Writing',
                description: 'Four-against-one counterpoint',
                duration: 30,
                difficulty: 'advanced',
                order: 1,
                prerequisites: ['lesson-cpt-004'],
              },
            ],
          },
          {
            id: 'fourth-species',
            unitId: 'species-counterpoint',
            name: 'Fourth Species',
            description: 'Syncopation and suspensions',
            order: 4,
            lessons: [
              {
                id: 'lesson-cpt-006',
                moduleId: 'fourth-species',
                title: 'Suspensions',
                description: 'Preparation, suspension, and resolution',
                duration: 28,
                difficulty: 'advanced',
                order: 1,
                prerequisites: ['lesson-cpt-004'],
              },
              {
                id: 'lesson-cpt-007',
                moduleId: 'fourth-species',
                title: 'Chains of Suspensions',
                description: 'Creating longer suspended passages',
                duration: 25,
                difficulty: 'advanced',
                order: 2,
                prerequisites: ['lesson-cpt-006'],
              },
            ],
          },
          {
            id: 'fifth-species',
            unitId: 'species-counterpoint',
            name: 'Fifth Species',
            description: 'Florid counterpoint combining all species',
            order: 5,
            lessons: [
              {
                id: 'lesson-cpt-008',
                moduleId: 'fifth-species',
                title: 'Florid Counterpoint',
                description: 'Combining techniques from all species',
                duration: 35,
                difficulty: 'advanced',
                order: 1,
                prerequisites: ['lesson-cpt-007'],
              },
            ],
          },
        ],
      },
      {
        id: 'invertible-counterpoint',
        domainId: 'counterpoint',
        name: 'Invertible Counterpoint',
        description: 'Contrapuntal lines that work when inverted',
        order: 2,
        modules: [
          {
            id: 'inversion-techniques',
            unitId: 'invertible-counterpoint',
            name: 'Inversion Techniques',
            description: 'Double counterpoint at the octave and other intervals',
            order: 1,
            lessons: [
              {
                id: 'lesson-cpt-009',
                moduleId: 'inversion-techniques',
                title: 'Double Counterpoint at the Octave',
                description: 'Writing invertible lines',
                duration: 30,
                difficulty: 'advanced',
                order: 1,
                prerequisites: ['lesson-cpt-008'],
              },
              {
                id: 'lesson-cpt-010',
                moduleId: 'inversion-techniques',
                title: 'Triple and Quadruple Counterpoint',
                description: 'Multiple invertible voices',
                duration: 35,
                difficulty: 'advanced',
                order: 2,
                prerequisites: ['lesson-cpt-009'],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'fugue',
    name: 'Fugue',
    description: 'Imitative contrapuntal composition',
    order: 4,
    color: '#EF4444', // red
    icon: '🎺',
    units: [
      {
        id: 'fugue-exposition',
        domainId: 'fugue',
        name: 'Fugue Exposition',
        description: 'Subject, answer, and countersubject',
        order: 1,
        modules: [
          {
            id: 'subject-design',
            unitId: 'fugue-exposition',
            name: 'Subject Design',
            description: 'Creating effective fugue subjects',
            order: 1,
            lessons: [
              {
                id: 'lesson-fugue-001',
                moduleId: 'subject-design',
                title: 'The Fugue Subject',
                description: 'Characteristics of a good fugue subject',
                duration: 25,
                difficulty: 'advanced',
                order: 1,
                prerequisites: ['lesson-cpt-008'],
              },
              {
                id: 'lesson-fugue-002',
                moduleId: 'subject-design',
                title: 'Tonal vs Real Answer',
                description: 'Answering the subject at the fifth',
                duration: 28,
                difficulty: 'advanced',
                order: 2,
                prerequisites: ['lesson-fugue-001'],
              },
            ],
          },
          {
            id: 'countersubject',
            unitId: 'fugue-exposition',
            name: 'Countersubject',
            description: 'Writing counterpoint to the subject',
            order: 2,
            lessons: [
              {
                id: 'lesson-fugue-003',
                moduleId: 'countersubject',
                title: 'Creating a Countersubject',
                description: 'Complementary material to the subject',
                duration: 30,
                difficulty: 'advanced',
                order: 1,
                prerequisites: ['lesson-fugue-002'],
              },
              {
                id: 'lesson-fugue-004',
                moduleId: 'countersubject',
                title: 'Invertible Countersubjects',
                description: 'Using double counterpoint in fugue',
                duration: 32,
                difficulty: 'advanced',
                order: 2,
                prerequisites: ['lesson-fugue-003', 'lesson-cpt-009'],
              },
            ],
          },
          {
            id: 'exposition-structure',
            unitId: 'fugue-exposition',
            name: 'Exposition Structure',
            description: 'Organizing subject entries',
            order: 3,
            lessons: [
              {
                id: 'lesson-fugue-005',
                moduleId: 'exposition-structure',
                title: 'Three-Voice Exposition',
                description: 'Standard exposition format',
                duration: 28,
                difficulty: 'advanced',
                order: 1,
                prerequisites: ['lesson-fugue-004'],
              },
              {
                id: 'lesson-fugue-006',
                moduleId: 'exposition-structure',
                title: 'Four-Voice Exposition',
                description: 'Adding a fourth voice',
                duration: 30,
                difficulty: 'advanced',
                order: 2,
                prerequisites: ['lesson-fugue-005'],
              },
            ],
          },
        ],
      },
      {
        id: 'fugue-development',
        domainId: 'fugue',
        name: 'Fugue Development',
        description: 'Episodes, entries, and modulation',
        order: 2,
        modules: [
          {
            id: 'episodes',
            unitId: 'fugue-development',
            name: 'Episodes',
            description: 'Non-thematic developmental sections',
            order: 1,
            lessons: [
              {
                id: 'lesson-fugue-007',
                moduleId: 'episodes',
                title: 'Episode Construction',
                description: 'Creating episodes from subject material',
                duration: 30,
                difficulty: 'advanced',
                order: 1,
                prerequisites: ['lesson-fugue-006'],
              },
              {
                id: 'lesson-fugue-008',
                moduleId: 'episodes',
                title: 'Modulating Episodes',
                description: 'Using episodes to change key',
                duration: 28,
                difficulty: 'advanced',
                order: 2,
                prerequisites: ['lesson-fugue-007'],
              },
            ],
          },
          {
            id: 'middle-entries',
            unitId: 'fugue-development',
            name: 'Middle Entries',
            description: 'Subject entries in new keys',
            order: 2,
            lessons: [
              {
                id: 'lesson-fugue-009',
                moduleId: 'middle-entries',
                title: 'Middle Entries in Related Keys',
                description: 'Dominant, subdominant, and relative key entries',
                duration: 32,
                difficulty: 'advanced',
                order: 1,
                prerequisites: ['lesson-fugue-008'],
              },
            ],
          },
          {
            id: 'stretto',
            unitId: 'fugue-development',
            name: 'Stretto',
            description: 'Overlapping subject entries',
            order: 3,
            lessons: [
              {
                id: 'lesson-fugue-010',
                moduleId: 'stretto',
                title: 'Stretto Technique',
                description: 'Creating effective stretto passages',
                duration: 35,
                difficulty: 'advanced',
                order: 1,
                prerequisites: ['lesson-fugue-009'],
              },
            ],
          },
        ],
      },
      {
        id: 'special-techniques',
        domainId: 'fugue',
        name: 'Special Techniques',
        description: 'Advanced fugal devices',
        order: 3,
        modules: [
          {
            id: 'augmentation-diminution',
            unitId: 'special-techniques',
            name: 'Augmentation and Diminution',
            description: 'Altering the rhythmic values of the subject',
            order: 1,
            lessons: [
              {
                id: 'lesson-fugue-011',
                moduleId: 'augmentation-diminution',
                title: 'Augmentation and Diminution',
                description: 'Rhythmic transformation of the subject',
                duration: 30,
                difficulty: 'advanced',
                order: 1,
                prerequisites: ['lesson-fugue-009'],
              },
            ],
          },
          {
            id: 'inversion-retrograde',
            unitId: 'special-techniques',
            name: 'Inversion and Retrograde',
            description: 'Melodic transformation of the subject',
            order: 2,
            lessons: [
              {
                id: 'lesson-fugue-012',
                moduleId: 'inversion-retrograde',
                title: 'Subject Inversion and Retrograde',
                description: 'Inverting and reversing the subject',
                duration: 32,
                difficulty: 'advanced',
                order: 1,
                prerequisites: ['lesson-fugue-011'],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'form',
    name: 'Form',
    description: 'Musical structure and large-scale organization',
    order: 5,
    color: '#F59E0B', // amber
    icon: '🏛️',
    units: [
      {
        id: 'binary-ternary',
        domainId: 'form',
        name: 'Binary and Ternary Forms',
        description: 'Two-part and three-part structures',
        order: 1,
        modules: [
          {
            id: 'binary-form',
            unitId: 'binary-ternary',
            name: 'Binary Form',
            description: 'Simple and rounded binary structures',
            order: 1,
            lessons: [
              {
                id: 'lesson-form-001',
                moduleId: 'binary-form',
                title: 'Simple Binary Form',
                description: 'Two-part AB structure',
                duration: 22,
                difficulty: 'intermediate',
                order: 1,
              },
              {
                id: 'lesson-form-002',
                moduleId: 'binary-form',
                title: 'Rounded Binary Form',
                description: 'ABA structure in baroque dance movements',
                duration: 25,
                difficulty: 'intermediate',
                order: 2,
                prerequisites: ['lesson-form-001'],
              },
            ],
          },
          {
            id: 'ternary-form',
            unitId: 'binary-ternary',
            name: 'Ternary Form',
            description: 'Three-part ABA structure',
            order: 2,
            lessons: [
              {
                id: 'lesson-form-003',
                moduleId: 'ternary-form',
                title: 'Simple Ternary Form',
                description: 'ABA structure in character pieces',
                duration: 23,
                difficulty: 'intermediate',
                order: 1,
                prerequisites: ['lesson-form-002'],
              },
            ],
          },
        ],
      },
      {
        id: 'rondo',
        domainId: 'form',
        name: 'Rondo Form',
        description: 'Recurring refrain with contrasting episodes',
        order: 2,
        modules: [
          {
            id: 'rondo-types',
            unitId: 'rondo',
            name: 'Rondo Types',
            description: 'Five-part and seven-part rondos',
            order: 1,
            lessons: [
              {
                id: 'lesson-form-004',
                moduleId: 'rondo-types',
                title: 'Five-Part Rondo (ABACA)',
                description: 'Classical rondo form',
                duration: 25,
                difficulty: 'intermediate',
                order: 1,
                prerequisites: ['lesson-form-003'],
              },
              {
                id: 'lesson-form-005',
                moduleId: 'rondo-types',
                title: 'Seven-Part Rondo (ABACABA)',
                description: 'Extended rondo with additional return',
                duration: 28,
                difficulty: 'advanced',
                order: 2,
                prerequisites: ['lesson-form-004'],
              },
            ],
          },
        ],
      },
      {
        id: 'sonata-form',
        domainId: 'form',
        name: 'Sonata Form',
        description: 'Exposition, development, recapitulation',
        order: 3,
        modules: [
          {
            id: 'sonata-structure',
            unitId: 'sonata-form',
            name: 'Sonata Structure',
            description: 'Understanding the three main sections',
            order: 1,
            lessons: [
              {
                id: 'lesson-form-006',
                moduleId: 'sonata-structure',
                title: 'Sonata Form Exposition',
                description: 'First and second theme groups',
                duration: 30,
                difficulty: 'advanced',
                order: 1,
                prerequisites: ['lesson-form-004'],
              },
              {
                id: 'lesson-form-007',
                moduleId: 'sonata-structure',
                title: 'Development Section',
                description: 'Thematic transformation and modulation',
                duration: 32,
                difficulty: 'advanced',
                order: 2,
                prerequisites: ['lesson-form-006'],
              },
              {
                id: 'lesson-form-008',
                moduleId: 'sonata-structure',
                title: 'Recapitulation and Coda',
                description: 'Return of themes in tonic key',
                duration: 28,
                difficulty: 'advanced',
                order: 3,
                prerequisites: ['lesson-form-007'],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced Topics',
    description: 'Extended techniques, 20th century harmony, analysis',
    order: 6,
    color: '#6366F1', // indigo
    icon: '🎨',
    units: [
      {
        id: 'extended-harmony',
        domainId: 'advanced',
        name: 'Extended Harmony',
        description: 'Ninth, eleventh, and thirteenth chords',
        order: 1,
        modules: [
          {
            id: 'extended-chords',
            unitId: 'extended-harmony',
            name: 'Extended Chords',
            description: 'Beyond the seventh chord',
            order: 1,
            lessons: [
              {
                id: 'lesson-adv-001',
                moduleId: 'extended-chords',
                title: 'Ninth Chords',
                description: 'Major, minor, and dominant ninths',
                duration: 28,
                difficulty: 'advanced',
                order: 1,
              },
              {
                id: 'lesson-adv-002',
                moduleId: 'extended-chords',
                title: 'Eleventh and Thirteenth Chords',
                description: 'Upper extensions in jazz harmony',
                duration: 30,
                difficulty: 'advanced',
                order: 2,
                prerequisites: ['lesson-adv-001'],
              },
            ],
          },
        ],
      },
      {
        id: 'twentieth-century',
        domainId: 'advanced',
        name: '20th Century Techniques',
        description: 'Modern compositional approaches',
        order: 2,
        modules: [
          {
            id: 'impressionism',
            unitId: 'twentieth-century',
            name: 'Impressionism',
            description: 'Debussy and the whole-tone scale',
            order: 1,
            lessons: [
              {
                id: 'lesson-adv-003',
                moduleId: 'impressionism',
                title: 'Whole-Tone and Pentatonic Scales',
                description: 'Non-functional harmony in impressionism',
                duration: 30,
                difficulty: 'advanced',
                order: 1,
              },
              {
                id: 'lesson-adv-004',
                moduleId: 'impressionism',
                title: 'Planing and Parallelism',
                description: 'Moving chord structures in parallel motion',
                duration: 28,
                difficulty: 'advanced',
                order: 2,
                prerequisites: ['lesson-adv-003'],
              },
            ],
          },
          {
            id: 'serialism',
            unitId: 'twentieth-century',
            name: 'Serialism',
            description: 'Twelve-tone technique',
            order: 2,
            lessons: [
              {
                id: 'lesson-adv-005',
                moduleId: 'serialism',
                title: 'Twelve-Tone Rows',
                description: 'Schoenberg and serial composition',
                duration: 35,
                difficulty: 'advanced',
                order: 1,
              },
              {
                id: 'lesson-adv-006',
                moduleId: 'serialism',
                title: 'Row Transformations',
                description: 'Prime, retrograde, inversion, retrograde-inversion',
                duration: 32,
                difficulty: 'advanced',
                order: 2,
                prerequisites: ['lesson-adv-005'],
              },
            ],
          },
        ],
      },
      {
        id: 'analysis',
        domainId: 'advanced',
        name: 'Musical Analysis',
        description: 'Analytical techniques and methodologies',
        order: 3,
        modules: [
          {
            id: 'schenkerian',
            unitId: 'analysis',
            name: 'Schenkerian Analysis',
            description: 'Structural levels and linear analysis',
            order: 1,
            lessons: [
              {
                id: 'lesson-adv-007',
                moduleId: 'schenkerian',
                title: 'Introduction to Schenkerian Analysis',
                description: 'Fundamental structure and prolongation',
                duration: 35,
                difficulty: 'advanced',
                order: 1,
              },
              {
                id: 'lesson-adv-008',
                moduleId: 'schenkerian',
                title: 'Creating a Schenkerian Graph',
                description: 'Practical application of analytical techniques',
                duration: 40,
                difficulty: 'advanced',
                order: 2,
                prerequisites: ['lesson-adv-007'],
              },
            ],
          },
        ],
      },
    ],
  },
];

/**
 * Get a flattened list of all lessons in curriculum order
 */
export function getAllLessons(): Array<{
  lesson: import('@/lib/types/curriculum').LessonMetadata;
  domain: string;
  unit: string;
  module: string;
}> {
  const lessons: Array<{
    lesson: import('@/lib/types/curriculum').LessonMetadata;
    domain: string;
    unit: string;
    module: string;
  }> = [];

  curriculumDomains.forEach((domain) => {
    domain.units.forEach((unit) => {
      unit.modules.forEach((module) => {
        module.lessons.forEach((lesson) => {
          lessons.push({
            lesson,
            domain: domain.name,
            unit: unit.name,
            module: module.name,
          });
        });
      });
    });
  });

  return lessons;
}

/**
 * Find a lesson by ID
 */
export function findLessonById(lessonId: string) {
  for (const domain of curriculumDomains) {
    for (const unit of domain.units) {
      for (const currModule of unit.modules) {
        const lesson = currModule.lessons.find((l) => l.id === lessonId);
        if (lesson) {
          return {
            lesson,
            domain,
            unit,
            module: currModule,
          };
        }
      }
    }
  }
  return null;
}

/**
 * Get prerequisites for a lesson
 */
export function getLessonPrerequisites(lessonId: string) {
  const found = findLessonById(lessonId);
  if (!found || !found.lesson.prerequisites) return [];

  return found.lesson.prerequisites
    .map((prereqId) => findLessonById(prereqId))
    .filter((p) => p !== null);
}
