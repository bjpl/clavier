/**
 * Feature taxonomy type definitions for Clavier
 *
 * Defines the hierarchical classification system for musical features
 * and supports search/filtering functionality.
 */

import { PitchClass, KeyMode } from './music';

/**
 * Top-level feature categories
 */
export enum FeatureCategory {
  /** Harmonic features (chords, progressions, cadences) */
  HARMONY = 'HARMONY',
  /** Counterpoint and voice leading features */
  COUNTERPOINT = 'COUNTERPOINT',
  /** Formal structure features */
  FORM = 'FORM',
  /** Texture and orchestration features */
  TEXTURE = 'TEXTURE',
  /** Fugue-specific features */
  FUGUE = 'FUGUE',
  /** Melodic features */
  MELODY = 'MELODY',
  /** Rhythmic features */
  RHYTHM = 'RHYTHM',
  /** Key and modulation features */
  TONALITY = 'TONALITY',
}

/**
 * Feature definition in the taxonomy
 */
export interface Feature {
  /** Unique identifier for the feature */
  id: string;
  /** Feature name */
  name: string;
  /** Category this feature belongs to */
  category: FeatureCategory;
  /** Parent feature ID (for hierarchical organization) */
  parentId?: string;
  /** Short description */
  description: string;
  /** Detailed explanation */
  explanation?: string;
  /** Aliases or alternative names */
  aliases?: string[];
  /** Tags for search and categorization */
  tags: string[];
  /** Examples of this feature (piece IDs and measure ranges) */
  examples?: Array<{
    pieceId: string;
    measureStart: number;
    measureEnd: number;
    description?: string;
  }>;
  /** Related features */
  relatedFeatures?: string[];
  /** Difficulty level */
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  /** Whether this feature appears in the curriculum */
  inCurriculum: boolean;
  /** Curriculum lesson IDs where this is taught */
  curriculumLessons?: string[];
}

/**
 * Instance of a feature appearing in a piece
 */
export interface FeatureInstance {
  /** Unique identifier for this instance */
  id: string;
  /** Feature definition ID */
  featureId: string;
  /** Piece this instance appears in */
  pieceId: string;
  /** Starting measure number */
  measureStart: number;
  /** Ending measure number */
  measureEnd: number;
  /** Optional beat-level precision */
  beatStart?: number;
  /** Optional beat-level precision */
  beatEnd?: number;
  /** Specific notes involved (note IDs) */
  noteIds?: string[];
  /** Voices involved */
  voices?: string[];
  /** Instance-specific details */
  details?: Record<string, unknown>;
  /** Confidence score (0-1) for automatically detected features */
  confidence?: number;
  /** Whether this was manually annotated or automatically detected */
  source: 'manual' | 'automatic';
  /** Notes about this instance */
  notes?: string;
}

/**
 * Search result for feature exploration
 */
export interface SearchResult {
  /** Type of result */
  type: 'feature' | 'instance' | 'piece' | 'lesson';
  /** Result ID */
  id: string;
  /** Display title */
  title: string;
  /** Description or excerpt */
  description: string;
  /** Category for filtering */
  category?: FeatureCategory;
  /** Relevance score (0-1) */
  score: number;
  /** Highlighted matching text */
  highlights?: string[];
  /** Context information */
  context?: {
    pieceId?: string;
    pieceTitle?: string;
    measureRange?: {
      start: number;
      end: number;
    };
    lessonId?: string;
    lessonTitle?: string;
  };
  /** URL or route to navigate to this result */
  url?: string;
}

/**
 * Filter options for feature search and exploration
 */
export interface FilterOptions {
  /** Filter by categories */
  categories?: FeatureCategory[];
  /** Filter by difficulty level */
  difficulty?: Array<'beginner' | 'intermediate' | 'advanced' | 'expert'>;
  /** Filter by piece type */
  pieceTypes?: Array<'PRELUDE' | 'FUGUE'>;
  /** Filter by key */
  keys?: PitchClass[];
  /** Filter by mode */
  modes?: KeyMode[];
  /** Filter by book */
  books?: Array<1 | 2>;
  /** Filter by specific pieces */
  pieceIds?: string[];
  /** Filter to only features in curriculum */
  inCurriculumOnly?: boolean;
  /** Text search query */
  searchQuery?: string;
  /** Sort order */
  sortBy?: 'name' | 'category' | 'difficulty' | 'frequency' | 'relevance';
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Maximum results to return */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Feature statistics
 */
export interface FeatureStatistics {
  /** Feature ID */
  featureId: string;
  /** Total number of instances */
  totalInstances: number;
  /** Number of pieces containing this feature */
  piecesWithFeature: number;
  /** Percentage of all pieces containing this feature */
  piecePercentage: number;
  /** Distribution by piece type */
  byPieceType: {
    PRELUDE: number;
    FUGUE: number;
  };
  /** Distribution by mode */
  byMode: {
    MAJOR: number;
    MINOR: number;
  };
  /** Distribution by book */
  byBook: {
    1: number;
    2: number;
  };
  /** Most common keys this feature appears in */
  commonKeys: Array<{
    key: PitchClass;
    mode: KeyMode;
    count: number;
  }>;
  /** Pieces with the most instances of this feature */
  topPieces: Array<{
    pieceId: string;
    pieceTitle: string;
    instanceCount: number;
  }>;
}

/**
 * Feature comparison result
 */
export interface FeatureComparison {
  /** Features being compared */
  features: string[];
  /** Pieces containing all features */
  piecesWithAll: string[];
  /** Pieces containing any of the features */
  piecesWithAny: string[];
  /** Venn diagram data */
  vennData: Array<{
    sets: string[];
    size: number;
    pieces: string[];
  }>;
  /** Correlation metrics between features */
  correlations?: Array<{
    feature1: string;
    feature2: string;
    correlation: number;
  }>;
}

/**
 * Feature learning path
 */
export interface FeatureLearningPath {
  /** Feature being learned */
  featureId: string;
  /** Prerequisite features that should be learned first */
  prerequisites: string[];
  /** Recommended learning sequence */
  sequence: Array<{
    step: number;
    featureId: string;
    lessonId?: string;
    description: string;
    estimatedTime?: number;
  }>;
  /** Related features to explore after mastering this one */
  nextSteps: string[];
  /** Total estimated time to master (in minutes) */
  totalEstimatedTime?: number;
}

/**
 * Feature explorer state
 */
export interface FeatureExplorerState {
  /** Currently selected feature */
  selectedFeature?: string;
  /** Active filters */
  filters: FilterOptions;
  /** Search results */
  searchResults: SearchResult[];
  /** Currently viewing instances */
  viewingInstances: FeatureInstance[];
  /** Comparison mode active */
  comparisonMode: boolean;
  /** Features being compared */
  comparedFeatures: string[];
  /** Statistics cache */
  statisticsCache: Map<string, FeatureStatistics>;
}
