/**
 * Clavier API Client
 * Central export for all API functions and hooks
 */

// Export all fetchers
export * from './fetchers';

// Export all query hooks
export * from './queries';

// Export response utilities
export * from './response';

// Re-export commonly used types
export type {
  PieceFilters,
  PiecesResponse,
  MeasuresResponse,
  AnnotationsResponse,
  FeaturesResponse,
  FeatureInstancesResponse,
  SearchResult,
  SearchResponse,
  ProgressSummary,
  ProgressResponse,
} from './fetchers';
