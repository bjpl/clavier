import { PrismaClient, FeatureCategory } from '@prisma/client';

/**
 * Music theory features taxonomy for the Well-Tempered Clavier
 * Organized by category with hierarchical relationships
 */

interface FeatureData {
  name: string;
  slug: string;
  category: FeatureCategory;
  description: string;
  explanationBeginner?: string;
  explanationIntermediate?: string;
  explanationAdvanced?: string;
  difficultyLevel: number;
  searchKeywords: string[];
  parentSlug?: string;
}

const FEATURES: FeatureData[] = [
  // HARMONY FEATURES
  {
    name: 'Cadence',
    slug: 'cadence',
    category: 'HARMONY',
    description: 'A melodic or harmonic configuration that creates a sense of resolution or repose',
    explanationBeginner: 'A cadence is like a musical punctuation mark - it signals the end of a phrase or section',
    explanationIntermediate: 'Cadences establish tonal centers and create formal structure through harmonic progression',
    explanationAdvanced: 'Cadences function as structural articulations that define phrase boundaries and hierarchical relationships within tonal syntax',
    difficultyLevel: 2,
    searchKeywords: ['cadence', 'resolution', 'phrase ending', 'harmonic progression'],
  },
  {
    name: 'Authentic Cadence',
    slug: 'authentic-cadence',
    category: 'HARMONY',
    parentSlug: 'cadence',
    description: 'V-I progression with a strong sense of finality',
    explanationBeginner: 'The strongest type of ending, moving from the V chord to the I chord',
    explanationIntermediate: 'Perfect authentic cadence (PAC) has both chords in root position with tonic in the soprano; imperfect (IAC) varies these conditions',
    explanationAdvanced: 'The authentic cadence represents the fundamental dominant-tonic progression underlying tonal syntax, with varying degrees of structural weight',
    difficultyLevel: 2,
    searchKeywords: ['PAC', 'perfect authentic', 'IAC', 'imperfect authentic', 'V-I'],
  },
  {
    name: 'Half Cadence',
    slug: 'half-cadence',
    category: 'HARMONY',
    parentSlug: 'cadence',
    description: 'Any cadence ending on V, creating harmonic suspension',
    explanationBeginner: 'Ends on the V chord, creating a feeling of incompleteness that wants to continue',
    explanationIntermediate: 'Creates harmonic tension requiring resolution, often used to propel music forward or articulate phrase structure',
    explanationAdvanced: 'Functions as an open articulation in phrase structure, establishing dominant harmony as a point of repose within hierarchical tonal organization',
    difficultyLevel: 2,
    searchKeywords: ['HC', 'half cadence', 'dominant ending', 'suspension'],
  },
  {
    name: 'Deceptive Cadence',
    slug: 'deceptive-cadence',
    category: 'HARMONY',
    parentSlug: 'cadence',
    description: 'V-vi progression, avoiding expected resolution to I',
    explanationBeginner: 'When the music tricks you by going to vi instead of I after the V chord',
    explanationIntermediate: 'Substitutes vi for the expected tonic, prolonging harmonic motion and delaying final resolution',
    explanationAdvanced: 'A deceptive progression that substitutes a related harmony for the expected tonic, creating structural expansion and延長 of dominant function',
    difficultyLevel: 3,
    searchKeywords: ['deceptive cadence', 'V-vi', 'false cadence', 'interrupted cadence'],
  },
  {
    name: 'Plagal Cadence',
    slug: 'plagal-cadence',
    category: 'HARMONY',
    parentSlug: 'cadence',
    description: 'IV-I progression, often called the "Amen" cadence',
    explanationBeginner: 'A gentle ending using IV-I, like the "Amen" at the end of hymns',
    explanationIntermediate: 'Provides subdominant-to-tonic resolution without dominant function, often used as a closing gesture after an authentic cadence',
    explanationAdvanced: 'A plagal progression that establishes tonic through subdominant preparation rather than dominant resolution, representing an alternative to dominant-tonic syntax',
    difficultyLevel: 2,
    searchKeywords: ['plagal', 'IV-I', 'Amen cadence', 'subdominant'],
  },
  {
    name: 'Modulation',
    slug: 'modulation',
    category: 'HARMONY',
    description: 'Change from one key to another',
    explanationBeginner: 'When the music changes from one key to another key',
    explanationIntermediate: 'A structural shift in tonal center, typically prepared through pivot chords or chromatic voice leading',
    explanationAdvanced: 'The process of establishing a new tonic through harmonic progression, representing a hierarchical shift in tonal organization',
    difficultyLevel: 3,
    searchKeywords: ['modulation', 'key change', 'tonicization', 'tonal shift'],
  },
  {
    name: 'Tonicization',
    slug: 'tonicization',
    category: 'HARMONY',
    parentSlug: 'modulation',
    description: 'Temporary emphasis of a non-tonic chord as if it were tonic',
    explanationBeginner: 'Briefly treating a chord other than the home chord as if it were the main chord',
    explanationIntermediate: 'Applied dominants create temporary tonics without fully modulating, enriching harmonic vocabulary',
    explanationAdvanced: 'Secondary dominant function that temporarily establishes a scale degree as tonic without hierarchical shift in global tonal structure',
    difficultyLevel: 4,
    searchKeywords: ['tonicization', 'applied chord', 'secondary dominant', 'V/V'],
  },
  {
    name: 'Chromaticism',
    slug: 'chromaticism',
    category: 'HARMONY',
    description: 'Use of notes outside the diatonic scale',
    explanationBeginner: 'Using notes that don\'t belong to the current key, adding color and expression',
    explanationIntermediate: 'Chromatic alterations enrich harmonic vocabulary through neighbor tones, passing tones, and altered chords',
    explanationAdvanced: 'Systematic or expressive use of chromatic pitch content that expands diatonic harmony through linear motion or harmonic enrichment',
    difficultyLevel: 3,
    searchKeywords: ['chromatic', 'accidental', 'altered', 'chromatic harmony'],
  },
  {
    name: 'Circle of Fifths Progression',
    slug: 'circle-of-fifths',
    category: 'HARMONY',
    description: 'Harmonic progression following descending fifths',
    explanationBeginner: 'Chords moving down by fifths (or up by fourths), creating strong forward motion',
    explanationIntermediate: 'Sequential harmonic motion exploiting the strength of fifth-related progressions',
    explanationAdvanced: 'Cyclical harmonic progression based on descending perfect fifths, representing a fundamental pattern in tonal syntax',
    difficultyLevel: 3,
    searchKeywords: ['circle of fifths', 'fifth progression', 'descending fifths', 'harmonic sequence'],
  },

  // COUNTERPOINT FEATURES
  {
    name: 'Imitation',
    slug: 'imitation',
    category: 'COUNTERPOINT',
    description: 'One voice echoes a melodic idea from another voice',
    explanationBeginner: 'When one voice copies a melody that another voice just played',
    explanationIntermediate: 'A contrapuntal technique where a melodic idea is repeated in another voice, often at a different pitch level',
    explanationAdvanced: 'Systematic repetition of melodic material across voices, creating structural and motivic coherence in polyphonic texture',
    difficultyLevel: 2,
    searchKeywords: ['imitation', 'echo', 'canon', 'repetition'],
  },
  {
    name: 'Canon',
    slug: 'canon',
    category: 'COUNTERPOINT',
    parentSlug: 'imitation',
    description: 'Strict imitation where the following voice(s) exactly duplicate the leading voice',
    explanationBeginner: 'Like singing "Row, Row, Row Your Boat" - one voice follows exactly what the first voice sang',
    explanationIntermediate: 'A contrapuntal device where one or more voices strictly imitate the leading voice at a fixed time interval',
    explanationAdvanced: 'Strict intervallic imitation at a fixed temporal distance, representing the most rigorous form of contrapuntal structure',
    difficultyLevel: 4,
    searchKeywords: ['canon', 'strict imitation', 'round', 'perpetual canon'],
  },
  {
    name: 'Inversion',
    slug: 'inversion',
    category: 'COUNTERPOINT',
    description: 'Melodic contour reversed: ascending intervals become descending and vice versa',
    explanationBeginner: 'Flipping a melody upside down - ups become downs and downs become ups',
    explanationIntermediate: 'Intervallic transformation where the direction of each interval is inverted around a pivot point',
    explanationAdvanced: 'Systematic intervallic transformation that preserves motivic identity while creating contrapuntal variety through pitch space inversion',
    difficultyLevel: 4,
    searchKeywords: ['inversion', 'melodic inversion', 'contrary motion', 'mirror'],
  },
  {
    name: 'Augmentation',
    slug: 'augmentation',
    category: 'COUNTERPOINT',
    description: 'A melodic idea presented with longer note values',
    explanationBeginner: 'Playing a melody in slower motion, making each note longer',
    explanationIntermediate: 'Rhythmic transformation that proportionally lengthens all durations, typically doubling them',
    explanationAdvanced: 'Systematic temporal expansion of motivic material through proportional duration increase, creating hierarchical temporal relationships',
    difficultyLevel: 4,
    searchKeywords: ['augmentation', 'rhythmic expansion', 'slower', 'temporal transformation'],
  },
  {
    name: 'Diminution',
    slug: 'diminution',
    category: 'COUNTERPOINT',
    description: 'A melodic idea presented with shorter note values',
    explanationBeginner: 'Playing a melody faster, making each note shorter',
    explanationIntermediate: 'Rhythmic transformation that proportionally shortens all durations, typically halving them',
    explanationAdvanced: 'Systematic temporal compression of motivic material through proportional duration decrease, intensifying rhythmic density',
    difficultyLevel: 4,
    searchKeywords: ['diminution', 'rhythmic compression', 'faster', 'temporal transformation'],
  },
  {
    name: 'Stretto',
    slug: 'stretto',
    category: 'COUNTERPOINT',
    description: 'Overlapping entries of a fugue subject at closer time intervals than the exposition',
    explanationBeginner: 'When the imitation in a fugue happens so fast that the voices overlap and pile up',
    explanationIntermediate: 'Compression of imitative entries, creating increased density and climactic intensity',
    explanationAdvanced: 'Temporal compression of fugal entries that intensifies imitative density, typically functioning as a structural climax or closing device',
    difficultyLevel: 5,
    searchKeywords: ['stretto', 'overlapping', 'fugue', 'compression', 'climax'],
  },

  // FUGUE-SPECIFIC FEATURES
  {
    name: 'Fugue Subject',
    slug: 'fugue-subject',
    category: 'FUGUE',
    description: 'The main melodic theme of a fugue',
    explanationBeginner: 'The main melody that gets repeated and developed throughout the fugue',
    explanationIntermediate: 'The principal thematic material that undergoes imitative treatment and provides structural foundation',
    explanationAdvanced: 'The primary thematic element that generates imitative counterpoint and establishes the tonal and motivic framework of the fugue',
    difficultyLevel: 3,
    searchKeywords: ['subject', 'theme', 'fugue subject', 'dux'],
  },
  {
    name: 'Fugue Answer',
    slug: 'fugue-answer',
    category: 'FUGUE',
    description: 'Imitative response to the subject, typically at the dominant',
    explanationBeginner: 'The subject played in a different voice, usually starting on the dominant note',
    explanationIntermediate: 'Tonal or real imitation of the subject at the fifth, establishing dominant-tonic polarity',
    explanationAdvanced: 'Imitative restatement of the subject transposed to the dominant, with tonal adjustments preserving key relationships',
    difficultyLevel: 3,
    searchKeywords: ['answer', 'comes', 'response', 'dominant entry'],
  },
  {
    name: 'Countersubject',
    slug: 'countersubject',
    category: 'FUGUE',
    description: 'A recurring contrapuntal line that accompanies the subject',
    explanationBeginner: 'A secondary melody that plays along with the main theme',
    explanationIntermediate: 'Obligato counterpoint that recurs with subject entries, providing consistent contrapuntal pairing',
    explanationAdvanced: 'Systematically recurring contrapuntal material designed for invertible counterpoint with the subject',
    difficultyLevel: 4,
    searchKeywords: ['countersubject', 'counterpoint', 'secondary theme', 'accompaniment'],
  },
  {
    name: 'Episode',
    slug: 'episode',
    category: 'FUGUE',
    description: 'Non-thematic passage connecting subject entries',
    explanationBeginner: 'Musical passages between the main theme entries that provide variety and connection',
    explanationIntermediate: 'Sequential or modulatory passages derived from subject material, connecting formal sections',
    explanationAdvanced: 'Developmental passages typically employing fragmentation and sequence to modulate between subject entries',
    difficultyLevel: 4,
    searchKeywords: ['episode', 'development', 'sequence', 'modulation', 'transition'],
  },

  // RHYTHM FEATURES
  {
    name: 'Syncopation',
    slug: 'syncopation',
    category: 'RHYTHM',
    description: 'Displacement of rhythmic accent to weak beats or off-beats',
    explanationBeginner: 'When the emphasis falls on unexpected beats, creating rhythmic surprise',
    explanationIntermediate: 'Rhythmic displacement that contradicts metrical hierarchy, creating tension and forward motion',
    explanationAdvanced: 'Systematic displacement of accentuation that conflicts with metrical structure, generating rhythmic complexity',
    difficultyLevel: 3,
    searchKeywords: ['syncopation', 'off-beat', 'accent displacement', 'rhythmic tension'],
  },
  {
    name: 'Hemiola',
    slug: 'hemiola',
    category: 'RHYTHM',
    description: 'Rhythmic pattern superimposing duple meter over triple or vice versa',
    explanationBeginner: 'When the rhythm temporarily shifts from groups of three to groups of two (or the opposite)',
    explanationIntermediate: 'Metrical conflict where three beats are reinterpreted as two, or vice versa, creating rhythmic tension',
    explanationAdvanced: 'Proportional metrical transformation creating hypermetrical ambiguity through 3:2 ratio displacement',
    difficultyLevel: 4,
    searchKeywords: ['hemiola', 'metrical shift', '3:2', 'cross-rhythm'],
  },
  {
    name: 'Rhythmic Sequence',
    slug: 'rhythmic-sequence',
    category: 'RHYTHM',
    description: 'Repetition of a rhythmic pattern at different pitch levels',
    explanationBeginner: 'The same rhythm repeated but with different notes',
    explanationIntermediate: 'Melodic transposition that preserves rhythmic identity while changing pitch content',
    explanationAdvanced: 'Systematic repetition of durational patterns with intervallic transformation, creating motivic coherence',
    difficultyLevel: 2,
    searchKeywords: ['sequence', 'rhythmic pattern', 'repetition', 'transposition'],
  },

  // MELODY FEATURES
  {
    name: 'Melodic Sequence',
    slug: 'melodic-sequence',
    category: 'MELODY',
    description: 'Transposed repetition of a melodic pattern',
    explanationBeginner: 'A melody pattern that repeats at different pitch levels',
    explanationIntermediate: 'Systematic repetition of intervallic patterns at different pitch levels, creating coherence and development',
    explanationAdvanced: 'Intervallic replication at systematic transpositional levels, generating structural expansion through pattern repetition',
    difficultyLevel: 2,
    searchKeywords: ['sequence', 'melodic pattern', 'transposition', 'repetition'],
  },
  {
    name: 'Melodic Inversion',
    slug: 'melodic-inversion',
    category: 'MELODY',
    description: 'Reflection of melodic contour around a central axis',
    explanationBeginner: 'Flipping a melody upside down like a mirror image',
    explanationIntermediate: 'Intervallic transformation reversing ascending and descending motion while preserving interval sizes',
    explanationAdvanced: 'Systematic pitch-class transformation creating contrapuntal variation through spatial inversion around a tonal axis',
    difficultyLevel: 4,
    searchKeywords: ['inversion', 'mirror', 'melodic transformation', 'contour'],
  },
  {
    name: 'Ornamentation',
    slug: 'ornamentation',
    category: 'MELODY',
    description: 'Decorative embellishment of melodic lines',
    explanationBeginner: 'Extra notes that decorate and embellish the main melody',
    explanationIntermediate: 'Surface diminution and embellishment of structural tones through figured ornaments',
    explanationAdvanced: 'Hierarchical elaboration of structural pitches through conventional or improvised diminution patterns',
    difficultyLevel: 3,
    searchKeywords: ['ornament', 'trill', 'mordent', 'turn', 'embellishment', 'decoration'],
  },

  // FORM FEATURES
  {
    name: 'Binary Form',
    slug: 'binary-form',
    category: 'FORM',
    description: 'Two-part structure, typically AB',
    explanationBeginner: 'A piece in two main sections, usually labeled A and B',
    explanationIntermediate: 'Two-part design with tonal motion from tonic to dominant (or relative major) in the first section, returning to tonic in the second',
    explanationAdvanced: 'Bipartite structure articulated by harmonic motion and thematic content, typical of Baroque dance movements',
    difficultyLevel: 2,
    searchKeywords: ['binary', 'two-part', 'AB form', 'rounded binary'],
  },
  {
    name: 'Ternary Form',
    slug: 'ternary-form',
    category: 'FORM',
    description: 'Three-part structure, typically ABA',
    explanationBeginner: 'A piece in three sections where the first and last are the same or similar',
    explanationIntermediate: 'Three-part design featuring statement, contrast, and return, creating balanced symmetry',
    explanationAdvanced: 'Tripartite structure with thematic return creating large-scale tonal and formal closure through recapitulation',
    difficultyLevel: 2,
    searchKeywords: ['ternary', 'ABA', 'three-part', 'da capo'],
  },

  // TEXTURE FEATURES
  {
    name: 'Homophony',
    slug: 'homophony',
    category: 'TEXTURE',
    description: 'Texture with one dominant melodic line accompanied by chords',
    explanationBeginner: 'One main melody with chordal accompaniment underneath',
    explanationIntermediate: 'Hierarchical texture prioritizing a single melodic strand supported by harmonic accompaniment',
    explanationAdvanced: 'Stratified texture with functional differentiation between melodic and harmonic layers',
    difficultyLevel: 1,
    searchKeywords: ['homophony', 'melody and accompaniment', 'chordal texture'],
  },
  {
    name: 'Polyphony',
    slug: 'polyphony',
    category: 'TEXTURE',
    description: 'Texture with multiple independent melodic lines',
    explanationBeginner: 'Multiple melodies happening at the same time, each with equal importance',
    explanationIntermediate: 'Multi-voiced texture where each line maintains melodic independence and harmonic integrity',
    explanationAdvanced: 'Contrapuntal texture featuring multiple simultaneous voices of relatively equal structural significance',
    difficultyLevel: 3,
    searchKeywords: ['polyphony', 'counterpoint', 'multi-voice', 'independent voices'],
  },
  {
    name: 'Monophony',
    slug: 'monophony',
    category: 'TEXTURE',
    description: 'Single unaccompanied melodic line',
    explanationBeginner: 'Just one melody by itself with no accompaniment',
    explanationIntermediate: 'Texture consisting solely of melodic content without harmonic or contrapuntal support',
    explanationAdvanced: 'Linear texture devoid of simultaneity, presenting pure melodic structure',
    difficultyLevel: 1,
    searchKeywords: ['monophony', 'single line', 'unaccompanied', 'solo'],
  },

  // PERFORMANCE FEATURES
  {
    name: 'Articulation',
    slug: 'articulation',
    category: 'PERFORMANCE',
    description: 'Manner in which notes are attacked and released',
    explanationBeginner: 'How to play each note - smoothly, detached, accented, etc.',
    explanationIntermediate: 'Performance indications specifying attack, sustain, and release characteristics',
    explanationAdvanced: 'Nuanced control of temporal and dynamic envelope shaping at the note level',
    difficultyLevel: 2,
    searchKeywords: ['articulation', 'staccato', 'legato', 'attack', 'phrasing'],
  },
  {
    name: 'Dynamics',
    slug: 'dynamics',
    category: 'PERFORMANCE',
    description: 'Variations in loudness',
    explanationBeginner: 'How loud or soft to play the music',
    explanationIntermediate: 'Expressive control of amplitude levels and gradual or sudden changes in volume',
    explanationAdvanced: 'Systematic manipulation of amplitude envelope to articulate structure and expressive content',
    difficultyLevel: 1,
    searchKeywords: ['dynamics', 'volume', 'loud', 'soft', 'forte', 'piano', 'crescendo'],
  },
  {
    name: 'Tempo',
    slug: 'tempo',
    category: 'PERFORMANCE',
    description: 'Speed of the beat',
    explanationBeginner: 'How fast or slow the music should be played',
    explanationIntermediate: 'Rate of beat progression, typically indicated by metronome marking or tempo term',
    explanationAdvanced: 'Temporal pacing of metric pulse, establishing the fundamental time scale for rhythmic organization',
    difficultyLevel: 1,
    searchKeywords: ['tempo', 'speed', 'bpm', 'allegro', 'andante', 'presto'],
  },
];

export async function seedFeatures(prisma: PrismaClient) {
  console.log('Seeding music theory features...');

  // First pass: create features without parent relationships
  const createdFeatures = new Map<string, string>(); // slug -> id mapping

  for (const featureData of FEATURES) {
    const { parentSlug, ...data } = featureData;
    const feature = await prisma.feature.upsert({
      where: { slug: data.slug },
      update: {},
      create: data,
    });
    createdFeatures.set(feature.slug, feature.id);
  }

  // Second pass: establish parent relationships
  for (const featureData of FEATURES.filter(f => f.parentSlug)) {
    const parentId = createdFeatures.get(featureData.parentSlug!);
    if (parentId) {
      await prisma.feature.update({
        where: { slug: featureData.slug },
        data: { parentFeatureId: parentId },
      });
    }
  }

  console.log(`✓ Created ${FEATURES.length} music theory features`);
}
