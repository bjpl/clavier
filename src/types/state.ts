/**
 * Global application state type definitions for Clavier
 *
 * Combines all domain-specific state types into the main AppState interface.
 * This represents the complete application state tree.
 */

import { Piece } from './music';
import { Annotation, AnnotationSettings } from './annotation';
import { Domain, UserProgress } from './curriculum';
import { Feature, FeatureInstance, FeatureExplorerState } from './feature';
import { PlaybackState, RecordingState, PracticeModeSettings } from './playback';
import {
  ViewMode,
  WalkthroughState,
  CurriculumViewState,
  ExplorerViewState,
  UserPreferences,
  LayoutConfig,
  ModalState,
  NotificationState,
  LoadingState,
  ErrorState
} from './view';

/**
 * Complete application state
 */
export interface AppState {
  /** Current view mode */
  viewMode: ViewMode;

  /** View-specific state */
  views: {
    walkthrough: WalkthroughState;
    curriculum: CurriculumViewState;
    explorer: ExplorerViewState;
  };

  /** Music data */
  music: MusicState;

  /** Annotation data */
  annotations: AnnotationState;

  /** Curriculum data */
  curriculum: CurriculumState;

  /** Feature taxonomy data */
  features: FeatureState;

  /** Playback state */
  playback: PlaybackState;

  /** User progress and learning data */
  progress: ProgressState;

  /** UI and view preferences */
  ui: UIState;

  /** Session and authentication */
  session: SessionState;
}

/**
 * Music data state
 */
export interface MusicState {
  /** All loaded pieces indexed by ID */
  pieces: Map<string, Piece>;

  /** Currently loaded piece ID */
  currentPieceId?: string;

  /** Piece metadata cache */
  pieceMetadata: Map<string, PieceMetadata>;

  /** Loading states for pieces */
  loadingPieces: Set<string>;

  /** Errors for failed piece loads */
  pieceErrors: Map<string, string>;
}

/**
 * Piece metadata (lightweight info for lists)
 */
export interface PieceMetadata {
  id: string;
  title: string;
  type: 'PRELUDE' | 'FUGUE';
  book: 1 | 2;
  number: number;
  key: string;
  mode: 'MAJOR' | 'MINOR';
  bwv: number;
  totalMeasures: number;
  totalBeats: number;
  defaultTempo: number;
}

/**
 * Annotation state
 */
export interface AnnotationState {
  /** All annotations indexed by ID */
  annotations: Map<string, Annotation>;

  /** Annotations by piece ID */
  annotationsByPiece: Map<string, string[]>;

  /** User annotation settings */
  settings: AnnotationSettings;

  /** Currently selected annotation */
  selectedAnnotationId?: string;

  /** Currently creating annotation */
  creatingAnnotation?: {
    type: string;
    startMeasure: number;
    endMeasure: number;
  };
}

/**
 * Curriculum state
 */
export interface CurriculumState {
  /** All domains */
  domains: Map<string, Domain>;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error?: string;

  /** Last updated timestamp */
  lastUpdated?: string;

  /** Curriculum version */
  version?: string;
}

/**
 * Feature state
 */
export interface FeatureState {
  /** All features indexed by ID */
  features: Map<string, Feature>;

  /** Feature instances indexed by ID */
  instances: Map<string, FeatureInstance>;

  /** Instances by piece ID */
  instancesByPiece: Map<string, string[]>;

  /** Instances by feature ID */
  instancesByFeature: Map<string, string[]>;

  /** Feature explorer state */
  explorer: FeatureExplorerState;

  /** Loading state */
  isLoading: boolean;
}

/**
 * User progress and learning state
 */
export interface ProgressState {
  /** Overall user progress */
  userProgress: UserProgress;

  /** Practice mode settings */
  practiceMode: PracticeModeSettings;

  /** Recording state (for student practice) */
  recording: RecordingState;

  /** Performance analytics */
  analytics: {
    totalTimeSpent: number;
    lessonsCompleted: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate?: string;
  };

  /** Bookmarked pieces */
  bookmarks: Set<string>;

  /** User notes on pieces */
  pieceNotes: Map<string, string>;

  /** Recently viewed pieces */
  recentPieces: string[];
}

/**
 * UI state
 */
export interface UIState {
  /** User preferences */
  preferences: UserPreferences;

  /** Layout configuration */
  layout: LayoutConfig;

  /** Modal state */
  modal: ModalState;

  /** Notifications */
  notifications: NotificationState;

  /** Loading state */
  loading: LoadingState;

  /** Error state */
  error: ErrorState;

  /** Whether onboarding has been completed */
  onboardingCompleted: boolean;

  /** Active keyboard shortcuts */
  keyboardShortcuts: Map<string, () => void>;
}

/**
 * Session and authentication state
 */
export interface SessionState {
  /** Whether user is authenticated */
  isAuthenticated: boolean;

  /** User ID */
  userId?: string;

  /** User profile */
  userProfile?: UserProfile;

  /** Session ID */
  sessionId?: string;

  /** Session start time */
  sessionStartTime?: string;

  /** Session duration (in seconds) */
  sessionDuration: number;

  /** Whether session data is synced to server */
  isSynced: boolean;

  /** Last sync timestamp */
  lastSyncTime?: string;
}

/**
 * User profile information
 */
export interface UserProfile {
  /** User ID */
  id: string;

  /** Display name */
  displayName: string;

  /** Email */
  email?: string;

  /** Avatar URL */
  avatarUrl?: string;

  /** Account creation date */
  createdAt: string;

  /** User role */
  role: 'student' | 'teacher' | 'admin';

  /** Subscription tier */
  subscriptionTier?: 'free' | 'premium' | 'institution';

  /** Bio or description */
  bio?: string;

  /** Learning goals */
  goals?: string[];
}

/**
 * Redux action types (for state updates)
 */
export type Action =
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'LOAD_PIECE'; payload: string }
  | { type: 'PIECE_LOADED'; payload: Piece }
  | { type: 'PIECE_LOAD_ERROR'; payload: { id: string; error: string } }
  | { type: 'SET_CURRENT_MEASURE'; payload: number }
  | { type: 'TOGGLE_PLAYBACK' }
  | { type: 'UPDATE_PLAYBACK_STATE'; payload: Partial<PlaybackState> }
  | { type: 'ADD_ANNOTATION'; payload: Annotation }
  | { type: 'UPDATE_ANNOTATION'; payload: { id: string; changes: Partial<Annotation> } }
  | { type: 'DELETE_ANNOTATION'; payload: string }
  | { type: 'UPDATE_USER_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'UPDATE_PROGRESS'; payload: Partial<UserProgress> }
  | { type: 'SHOW_NOTIFICATION'; payload: Omit<NotificationState['notifications'][0], 'id' | 'timestamp'> }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Partial<ErrorState> }
  | { type: 'CLEAR_ERROR' };

/**
 * State selector helpers (for derived state)
 */
export interface StateSelectors {
  /** Get current piece */
  getCurrentPiece: (state: AppState) => Piece | undefined;

  /** Get annotations for current piece */
  getCurrentPieceAnnotations: (state: AppState) => Annotation[];

  /** Get current lesson */
  getCurrentLesson: (state: AppState) => any | undefined;

  /** Get user completion percentage */
  getUserCompletionPercentage: (state: AppState) => number;

  /** Get pieces matching filters */
  getFilteredPieces: (state: AppState, filters: any) => Piece[];

  /** Check if piece is bookmarked */
  isPieceBookmarked: (state: AppState, pieceId: string) => boolean;
}
