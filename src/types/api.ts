/**
 * API request and response type definitions for Clavier
 *
 * Defines types for all API interactions including data fetching,
 * updates, and server communication.
 */

import { Piece } from './music';
import { Annotation } from './annotation';
import { Domain, Lesson, LessonProgress } from './curriculum';
import { Feature, FeatureInstance, SearchResult } from './feature';
import { PieceMetadata } from './state';

/**
 * API response wrapper with metadata
 */
export interface ApiResponse<T> {
  /** Whether the request succeeded */
  success: boolean;

  /** Response data (if successful) */
  data?: T;

  /** Error message (if failed) */
  error?: string;

  /** HTTP status code */
  statusCode: number;

  /** Request timestamp */
  timestamp: string;

  /** Pagination metadata (if applicable) */
  pagination?: PaginationMetadata;
}

/**
 * Pagination metadata
 */
export interface PaginationMetadata {
  /** Current page number */
  page: number;

  /** Items per page */
  pageSize: number;

  /** Total number of items */
  totalItems: number;

  /** Total number of pages */
  totalPages: number;

  /** Whether there are more pages */
  hasMore: boolean;
}

/**
 * Request for piece list
 */
export interface PieceListRequest {
  /** Filter by piece type */
  type?: 'PRELUDE' | 'FUGUE';

  /** Filter by book */
  book?: 1 | 2;

  /** Filter by key */
  key?: string;

  /** Filter by mode */
  mode?: 'MAJOR' | 'MINOR';

  /** Search query */
  search?: string;

  /** Pagination */
  page?: number;
  pageSize?: number;

  /** Sort options */
  sortBy?: 'number' | 'title' | 'key' | 'bwv';
  sortDirection?: 'asc' | 'desc';
}

/**
 * Response containing list of pieces
 */
export interface PieceListResponse {
  /** Array of piece metadata */
  pieces: PieceMetadata[];

  /** Total count */
  total: number;

  /** Pagination info */
  pagination: PaginationMetadata;
}

/**
 * Request for detailed piece data
 */
export interface PieceDetailRequest {
  /** Piece ID */
  pieceId: string;

  /** Whether to include full measure data */
  includeMeasures?: boolean;

  /** Whether to include harmonic analysis */
  includeAnalysis?: boolean;

  /** Whether to include annotations */
  includeAnnotations?: boolean;
}

/**
 * Response containing full piece details
 */
export interface PieceDetailResponse {
  /** Complete piece data */
  piece: Piece;

  /** Associated annotations */
  annotations?: Annotation[];
}

/**
 * Request for measure commentary
 */
export interface MeasureCommentaryRequest {
  /** Piece ID */
  pieceId: string;

  /** Measure number */
  measureNumber: number;

  /** Type of commentary requested */
  commentaryType?: 'harmony' | 'form' | 'technique' | 'all';
}

/**
 * Response containing measure commentary
 */
export interface MeasureCommentaryResponse {
  /** Piece ID */
  pieceId: string;

  /** Measure number */
  measureNumber: number;

  /** Commentary text */
  commentary: string;

  /** Relevant annotations for this measure */
  annotations: Annotation[];

  /** Key analytical points */
  keyPoints?: string[];

  /** Related measures */
  relatedMeasures?: number[];
}

/**
 * Request for lesson content
 */
export interface LessonContentRequest {
  /** Lesson ID */
  lessonId: string;

  /** Whether to include assessment questions */
  includeAssessment?: boolean;

  /** Whether to include resources */
  includeResources?: boolean;
}

/**
 * Response containing lesson content
 */
export interface LessonContentResponse {
  /** Complete lesson data */
  lesson: Lesson;

  /** User's progress on this lesson */
  progress?: LessonProgress;
}

/**
 * Request for curriculum structure
 */
export interface CurriculumRequest {
  /** Whether to include lessons */
  includeLessons?: boolean;

  /** Filter by domain ID */
  domainId?: string;

  /** Filter by unit ID */
  unitId?: string;
}

/**
 * Response containing curriculum structure
 */
export interface CurriculumResponse {
  /** All domains */
  domains: Domain[];

  /** Curriculum metadata */
  metadata: {
    version: string;
    lastUpdated: string;
    totalLessons: number;
  };
}

/**
 * Request for feature search
 */
export interface FeatureSearchRequest {
  /** Search query */
  query: string;

  /** Filter by categories */
  categories?: string[];

  /** Filter by difficulty */
  difficulty?: string[];

  /** Pagination */
  page?: number;
  pageSize?: number;

  /** Whether to include instances */
  includeInstances?: boolean;
}

/**
 * Response containing feature search results
 */
export interface FeatureSearchResponse {
  /** Search results */
  results: SearchResult[];

  /** Total results count */
  total: number;

  /** Search metadata */
  metadata: {
    query: string;
    searchTime: number;
    suggestions?: string[];
  };
}

/**
 * Request for feature instances in a piece
 */
export interface FeatureInstancesRequest {
  /** Piece ID */
  pieceId: string;

  /** Filter by feature IDs */
  featureIds?: string[];

  /** Filter by measure range */
  measureRange?: {
    start: number;
    end: number;
  };
}

/**
 * Response containing feature instances
 */
export interface FeatureInstancesResponse {
  /** Feature instances */
  instances: FeatureInstance[];

  /** Feature definitions */
  features: Feature[];
}

/**
 * Request to update user progress
 */
export interface ProgressUpdateRequest {
  /** Lesson ID */
  lessonId: string;

  /** Section ID completed */
  sectionId?: string;

  /** Assessment results */
  assessmentResults?: Array<{
    questionId: string;
    answer: unknown;
    isCorrect: boolean;
    score: number;
  }>;

  /** Time spent (in seconds) */
  timeSpent?: number;

  /** User notes */
  notes?: string;
}

/**
 * Response after progress update
 */
export interface ProgressUpdateResponse {
  /** Updated lesson progress */
  lessonProgress: LessonProgress;

  /** Whether lesson is now complete */
  lessonCompleted: boolean;

  /** Next recommended lesson */
  nextLesson?: {
    id: string;
    title: string;
  };

  /** Achievements unlocked (if any) */
  achievements?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

/**
 * Request to create/update annotation
 */
export interface AnnotationRequest {
  /** Annotation data */
  annotation: Omit<Annotation, 'id' | 'createdAt' | 'modifiedAt'>;
}

/**
 * Response after annotation operation
 */
export interface AnnotationResponse {
  /** Created/updated annotation */
  annotation: Annotation;
}

/**
 * Request for user profile
 */
export interface UserProfileRequest {
  /** User ID (optional, defaults to current user) */
  userId?: string;
}

/**
 * Response containing user profile
 */
export interface UserProfileResponse {
  /** User profile data */
  profile: {
    id: string;
    displayName: string;
    email?: string;
    avatarUrl?: string;
    createdAt: string;
    role: string;
    subscriptionTier?: string;
  };

  /** User statistics */
  statistics: {
    totalLessonsCompleted: number;
    totalTimeSpent: number;
    currentStreak: number;
    longestStreak: number;
    completionPercentage: number;
  };
}

/**
 * Authentication request
 */
export interface AuthRequest {
  /** Email */
  email: string;

  /** Password */
  password: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  /** Authentication token */
  token: string;

  /** User profile */
  user: {
    id: string;
    email: string;
    displayName: string;
    role: string;
  };

  /** Token expiration */
  expiresAt: string;
}

/**
 * Audio file request
 */
export interface AudioFileRequest {
  /** Piece ID */
  pieceId: string;

  /** Audio format */
  format?: 'mp3' | 'wav' | 'ogg';

  /** Quality preset */
  quality?: 'low' | 'medium' | 'high';
}

/**
 * Audio file response
 */
export interface AudioFileResponse {
  /** Audio file URL */
  url: string;

  /** File size in bytes */
  size: number;

  /** Duration in seconds */
  duration: number;

  /** Format */
  format: string;

  /** Expiration time for URL */
  expiresAt?: string;
}

/**
 * Export request
 */
export interface ExportRequest {
  /** Export type */
  type: 'progress' | 'annotations' | 'bookmarks' | 'all';

  /** Export format */
  format: 'json' | 'csv' | 'pdf';

  /** Date range filter */
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Export response
 */
export interface ExportResponse {
  /** Download URL */
  downloadUrl: string;

  /** File size */
  fileSize: number;

  /** Expiration time */
  expiresAt: string;
}

/**
 * Sync request (for offline-first functionality)
 */
export interface SyncRequest {
  /** Last sync timestamp */
  lastSyncTime?: string;

  /** Local changes to sync */
  changes: {
    annotations?: Annotation[];
    progress?: LessonProgress[];
    bookmarks?: string[];
    notes?: Record<string, string>;
  };
}

/**
 * Sync response
 */
export interface SyncResponse {
  /** Server changes since last sync */
  serverChanges: {
    annotations?: Annotation[];
    progress?: LessonProgress[];
    curriculum?: Domain[];
  };

  /** Conflicts that need resolution */
  conflicts?: Array<{
    type: string;
    localData: unknown;
    serverData: unknown;
  }>;

  /** New sync timestamp */
  syncTimestamp: string;
}
