/**
 * Annotation type definitions for Clavier
 *
 * Annotations provide educational context and analysis for musical elements.
 * Each annotation type has specific content structures appropriate to its purpose.
 */

import { PitchClass, KeyMode } from './music';

/**
 * Types of annotations available in the application
 */
export enum AnnotationType {
  /** Harmonic analysis (chords, progressions) */
  HARMONY = 'HARMONY',
  /** Cadence identification and analysis */
  CADENCE = 'CADENCE',
  /** Formal structure (phrases, sections, themes) */
  FORM = 'FORM',
  /** Compositional techniques (sequences, imitation, etc.) */
  TECHNIQUE = 'TECHNIQUE',
  /** Fugue-specific elements (subject, answer, episode, etc.) */
  FUGUE_ELEMENT = 'FUGUE_ELEMENT',
  /** Voice leading and counterpoint */
  VOICE_LEADING = 'VOICE_LEADING',
  /** Modulation and key changes */
  MODULATION = 'MODULATION',
  /** General commentary or notes */
  COMMENTARY = 'COMMENTARY',
}

/**
 * Content structure for harmony annotations
 */
export interface HarmonyContent {
  /** Roman numeral representation */
  romanNumeral: string;
  /** Chord quality description */
  quality: string;
  /** Inversion information */
  inversion: number;
  /** Functional role in the key */
  function: 'tonic' | 'dominant' | 'subdominant' | 'mediant' | 'submediant' | 'leading-tone' | 'applied' | 'chromatic';
  /** Non-chord tones present */
  nonChordTones?: Array<{
    type: string;
    description: string;
  }>;
  /** Additional analytical notes */
  notes?: string;
}

/**
 * Content structure for cadence annotations
 */
export interface CadenceContent {
  /** Type of cadence */
  type: 'authentic' | 'half' | 'deceptive' | 'plagal' | 'phrygian';
  /** Whether it's a perfect authentic cadence */
  isPerfect?: boolean;
  /** Scale degree of the bass note */
  bassDegree: number;
  /** Harmonic progression (e.g., "V-I") */
  progression: string;
  /** Explanation of the cadence */
  explanation: string;
}

/**
 * Content structure for form annotations
 */
export interface FormContent {
  /** Formal section type */
  sectionType: 'phrase' | 'period' | 'sentence' | 'exposition' | 'development' | 'recapitulation' | 'coda' | 'episode' | 'theme';
  /** Label for the section (e.g., "A", "B", "Theme 1") */
  label: string;
  /** Start measure number */
  startMeasure: number;
  /** End measure number */
  endMeasure: number;
  /** Description of the section's role */
  description: string;
  /** Related sections (e.g., parallel period) */
  relatedSections?: string[];
}

/**
 * Content structure for technique annotations
 */
export interface TechniqueContent {
  /** Name of the technique */
  name: string;
  /** Category of technique */
  category: 'sequence' | 'imitation' | 'augmentation' | 'diminution' | 'inversion' | 'retrograde' | 'canon' | 'pedal-point' | 'other';
  /** Detailed description */
  description: string;
  /** Measures where technique appears */
  measures: number[];
  /** Voices involved in the technique */
  voices?: string[];
}

/**
 * Content structure for fugue element annotations
 */
export interface FugueElementContent {
  /** Type of fugue element */
  elementType: 'subject' | 'answer' | 'countersubject' | 'episode' | 'stretto' | 'exposition' | 'middle-entry' | 'augmentation' | 'diminution' | 'inversion';
  /** Voice(s) this element appears in */
  voices: string[];
  /** Start measure */
  startMeasure: number;
  /** End measure */
  endMeasure: number;
  /** Description of the element */
  description: string;
  /** Related elements (e.g., subject number for an answer) */
  relatedTo?: string;
  /** Key if different from main key */
  key?: {
    pitchClass: PitchClass;
    mode: KeyMode;
  };
}

/**
 * Content structure for voice leading annotations
 */
export interface VoiceLeadingContent {
  /** Type of voice leading feature */
  type: 'parallel-motion' | 'contrary-motion' | 'oblique-motion' | 'voice-crossing' | 'leap' | 'step-motion' | 'suspension' | 'resolution';
  /** Voices involved */
  voices: string[];
  /** Interval if applicable */
  interval?: string;
  /** Whether this is a rule violation or special case */
  isException?: boolean;
  /** Explanation */
  explanation: string;
}

/**
 * Content structure for modulation annotations
 */
export interface ModulationContent {
  /** Key being modulated from */
  fromKey: {
    pitchClass: PitchClass;
    mode: KeyMode;
  };
  /** Key being modulated to */
  toKey: {
    pitchClass: PitchClass;
    mode: KeyMode;
  };
  /** Type of modulation */
  modulationType: 'direct' | 'pivot-chord' | 'common-tone' | 'chromatic' | 'sequential';
  /** Pivot chord if applicable */
  pivotChord?: {
    romanNumeralInOldKey: string;
    romanNumeralInNewKey: string;
    measure: number;
  };
  /** Explanation of the modulation process */
  explanation: string;
}

/**
 * Content structure for general commentary annotations
 */
export interface CommentaryContent {
  /** Title or subject of the commentary */
  title?: string;
  /** Main commentary text */
  text: string;
  /** Category for organization */
  category?: 'historical' | 'performance' | 'analytical' | 'pedagogical' | 'general';
  /** References or citations */
  references?: string[];
}

/**
 * Base annotation interface with discriminated union for content
 */
export interface Annotation {
  /** Unique identifier for this annotation */
  id: string;
  /** Type of annotation */
  type: AnnotationType;
  /** Piece this annotation belongs to */
  pieceId: string;
  /** Start measure number */
  startMeasure: number;
  /** End measure number (can be same as start for single-measure annotations) */
  endMeasure: number;
  /** Optional start beat within the start measure */
  startBeat?: number;
  /** Optional end beat within the end measure */
  endBeat?: number;
  /** Type-specific content (discriminated union) */
  content:
    | HarmonyContent
    | CadenceContent
    | FormContent
    | TechniqueContent
    | FugueElementContent
    | VoiceLeadingContent
    | ModulationContent
    | CommentaryContent;
  /** Display layer for UI organization */
  layer: AnnotationLayer;
  /** Whether this annotation is visible */
  visible: boolean;
  /** Color for visual representation */
  color?: string;
  /** User-added notes */
  userNotes?: string;
  /** Creation timestamp */
  createdAt?: string;
  /** Last modified timestamp */
  modifiedAt?: string;
}

/**
 * Annotation layers for organizing display
 */
export type AnnotationLayer =
  | 'harmony'      // Harmonic analysis layer
  | 'form'         // Formal structure layer
  | 'fugue'        // Fugue-specific elements
  | 'technique'    // Compositional techniques
  | 'voice'        // Voice leading analysis
  | 'user'         // User-created annotations
  | 'all';         // Show all layers

/**
 * Annotation visibility settings
 */
export interface AnnotationSettings {
  /** Which layers are currently visible */
  visibleLayers: AnnotationLayer[];
  /** Whether to show annotation tooltips on hover */
  showTooltips: boolean;
  /** Whether to highlight annotated measures */
  highlightMeasures: boolean;
  /** Color scheme for annotations */
  colorScheme: 'default' | 'high-contrast' | 'colorblind-friendly';
}

/**
 * Annotation filter options
 */
export interface AnnotationFilter {
  /** Filter by annotation type */
  types?: AnnotationType[];
  /** Filter by layer */
  layers?: AnnotationLayer[];
  /** Filter by measure range */
  measureRange?: {
    start: number;
    end: number;
  };
  /** Search text in annotation content */
  searchText?: string;
}
