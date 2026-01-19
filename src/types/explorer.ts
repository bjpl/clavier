import type { Feature, FeatureInstance, FeatureCategory, Piece, PieceType } from './database';

// Search and filter types
export interface ExplorerFilters {
  categories: FeatureCategory[];
  keyFilter: string | null;
  bookFilter: 1 | 2 | null;
  typeFilter: PieceType | null;
}

export type SortOption =
  | 'relevance'
  | 'piece-asc'
  | 'piece-desc'
  | 'measure-asc'
  | 'measure-desc'
  | 'complexity-asc'
  | 'complexity-desc';

// Feature tree types
export interface FeatureCategoryNode {
  category: FeatureCategory;
  features: Feature[];
  count: number;
  subcategories?: FeatureCategoryNode[];
}

// Extended feature types for display
export interface FeatureWithStats extends Feature {
  instanceCount: number;
  keyDistribution: Record<string, number>;
  bookDistribution: Record<string, number>;
  typeDistribution: Record<PieceType, number>;
}

// Related instance with piece context for display
export interface RelatedInstanceWithPiece extends FeatureInstance {
  piece?: Pick<Piece, 'id' | 'bwvNumber' | 'type' | 'keyTonic' | 'keyMode' | 'book'>;
}

export interface FeatureInstanceWithContext extends FeatureInstance {
  feature: Feature;
  piece: Piece;
  relatedInstances?: RelatedInstanceWithPiece[];
  curriculumReferences?: Array<{
    lessonId: string;
    lessonTitle: string;
    unitTitle: string;
  }>;
}

// Search result types
export interface SearchResult {
  instances: FeatureInstanceWithContext[];
  totalCount: number;
  facets: {
    categories: Record<FeatureCategory, number>;
    keys: Record<string, number>;
    books: Record<string, number>;
    types: Record<PieceType, number>;
  };
}

// Props interfaces
export interface ExplorerViewProps {
  features: Feature[];
  categories: FeatureCategory[];
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  suggestions?: string[];
  isLoading?: boolean;
}

export interface FilterPanelProps {
  categories: FeatureCategory[];
  selectedCategories: FeatureCategory[];
  onCategoryChange: (categories: FeatureCategory[]) => void;
  keyFilter: string | null;
  bookFilter: 1 | 2 | null;
  typeFilter: PieceType | null;
  onFilterChange: (filters: Partial<ExplorerFilters>) => void;
  onClearFilters: () => void;
  facets?: SearchResult['facets'];
}

export interface FeatureTreeProps {
  categories: FeatureCategoryNode[];
  selectedCategories: FeatureCategory[];
  onCategorySelect: (category: FeatureCategory) => void;
  onFeatureSelect: (featureId: string) => void;
}

export interface ResultsListProps {
  results: FeatureInstanceWithContext[];
  isLoading: boolean;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  totalCount: number;
}

export interface InstanceCardProps {
  instance: FeatureInstanceWithContext;
  onClick?: () => void;
}

export interface FeatureStatsProps {
  feature: FeatureWithStats;
  instances: FeatureInstance[];
}

export interface InstanceDetailProps {
  instance: FeatureInstanceWithContext;
  onPlayback?: () => void;
  onNavigateToWalkthrough?: () => void;
}

// Utility types
export interface KeyInfo {
  key: string;
  mode: 'MAJOR' | 'MINOR';
  displayName: string;
}

export const WTC_KEYS: KeyInfo[] = [
  { key: 'C', mode: 'MAJOR', displayName: 'C Major' },
  { key: 'C', mode: 'MINOR', displayName: 'C Minor' },
  { key: 'C#', mode: 'MAJOR', displayName: 'C♯ Major' },
  { key: 'C#', mode: 'MINOR', displayName: 'C♯ Minor' },
  { key: 'D', mode: 'MAJOR', displayName: 'D Major' },
  { key: 'D', mode: 'MINOR', displayName: 'D Minor' },
  { key: 'Eb', mode: 'MAJOR', displayName: 'E♭ Major' },
  { key: 'D#', mode: 'MINOR', displayName: 'D♯ Minor' },
  { key: 'E', mode: 'MAJOR', displayName: 'E Major' },
  { key: 'E', mode: 'MINOR', displayName: 'E Minor' },
  { key: 'F', mode: 'MAJOR', displayName: 'F Major' },
  { key: 'F', mode: 'MINOR', displayName: 'F Minor' },
  { key: 'F#', mode: 'MAJOR', displayName: 'F♯ Major' },
  { key: 'F#', mode: 'MINOR', displayName: 'F♯ Minor' },
  { key: 'G', mode: 'MAJOR', displayName: 'G Major' },
  { key: 'G', mode: 'MINOR', displayName: 'G Minor' },
  { key: 'Ab', mode: 'MAJOR', displayName: 'A♭ Major' },
  { key: 'G#', mode: 'MINOR', displayName: 'G♯ Minor' },
  { key: 'A', mode: 'MAJOR', displayName: 'A Major' },
  { key: 'A', mode: 'MINOR', displayName: 'A Minor' },
  { key: 'Bb', mode: 'MAJOR', displayName: 'B♭ Major' },
  { key: 'Bb', mode: 'MINOR', displayName: 'B♭ Minor' },
  { key: 'B', mode: 'MAJOR', displayName: 'B Major' },
  { key: 'B', mode: 'MINOR', displayName: 'B Minor' },
];

export const FEATURE_CATEGORY_LABELS: Record<FeatureCategory, string> = {
  HARMONY: 'Harmony',
  COUNTERPOINT: 'Counterpoint',
  RHYTHM: 'Rhythm',
  MELODY: 'Melody',
  FORM: 'Form',
  TEXTURE: 'Texture',
  FUGUE: 'Fugue',
  PERFORMANCE: 'Performance',
  OTHER: 'Other',
};
