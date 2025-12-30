/**
 * Central type exports for Clavier
 *
 * This file re-exports all types from the various type definition modules,
 * providing a single import point for the entire type system.
 */

// Music types
export type {
  PieceType,
  KeyMode,
  VoiceName,
  PitchClass,
  TimeSignature,
  Note,
  Chord,
  RomanNumeral,
  HarmonicAnalysis,
  Measure,
  Piece,
} from './music';

// Annotation types
export {
  AnnotationType,
} from './annotation';

export type {
  HarmonyContent,
  CadenceContent,
  FormContent,
  TechniqueContent,
  FugueElementContent,
  VoiceLeadingContent,
  ModulationContent,
  CommentaryContent,
  Annotation,
  AnnotationLayer,
  AnnotationSettings,
  AnnotationFilter,
} from './annotation';

// Curriculum types
export type {
  Domain,
  Unit,
  Module,
  Lesson,
  TextSection,
  GuidedExampleSection,
  RecognitionSection,
  PracticeSection,
  SummarySection,
  QuizSection,
  LessonSection,
  RecognitionQuestion,
  AssessmentQuestion,
  Resource,
  LessonProgress,
  UserProgress,
  CurriculumMetadata,
} from './curriculum';

// Feature types
export {
  FeatureCategory,
} from './feature';

export type {
  Feature,
  FeatureInstance,
  SearchResult,
  FilterOptions,
  FeatureStatistics,
  FeatureComparison,
  FeatureLearningPath,
  FeatureExplorerState,
} from './feature';

// Playback types
export type {
  PlaybackState,
  PlaybackMode,
  LoopConfig,
  ActiveNote,
  MetronomeSettings,
  PlaybackEventType,
  PlaybackEvent,
  NoteOnEvent,
  NoteOffEvent,
  MeasureChangeEvent,
  BeatChangeEvent,
  TransportControls,
  AudioEngineConfig,
  VoiceConfig,
  InstrumentType,
  VisualizationSync,
  PracticeModeSettings,
  RecordingState,
} from './playback';

// View types
export type {
  ViewMode,
  ScoreViewOptions,
  KeyboardViewOptions,
  AnalysisPanelOptions,
  WalkthroughState,
  CurriculumViewState,
  ExplorerViewState,
  Theme,
  AccessibilitySettings,
  UserPreferences,
  LayoutConfig,
  PanelState,
  ModalState,
  NotificationState,
  Notification,
  LoadingState,
  ErrorState,
} from './view';

// State types
export type {
  AppState,
  MusicState,
  PieceMetadata,
  AnnotationState,
  CurriculumState,
  FeatureState,
  ProgressState,
  UIState,
  SessionState,
  UserProfile,
  Action,
  StateSelectors,
} from './state';

// API types
export type {
  ApiResponse,
  PaginationMetadata,
  PieceListRequest,
  PieceListResponse,
  PieceDetailRequest,
  PieceDetailResponse,
  MeasureCommentaryRequest,
  MeasureCommentaryResponse,
  LessonContentRequest,
  LessonContentResponse,
  CurriculumRequest,
  CurriculumResponse,
  FeatureSearchRequest,
  FeatureSearchResponse,
  FeatureInstancesRequest,
  FeatureInstancesResponse,
  ProgressUpdateRequest,
  ProgressUpdateResponse,
  AnnotationRequest,
  AnnotationResponse,
  UserProfileRequest,
  UserProfileResponse,
  AuthRequest,
  AuthResponse,
  AudioFileRequest,
  AudioFileResponse,
  ExportRequest,
  ExportResponse,
  SyncRequest,
  SyncResponse,
} from './api';

/**
 * Utility type for making all properties of T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Utility type for making specific properties required
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Utility type for making specific properties optional
 */
export type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type for extracting the type of array elements
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Utility type for function parameters
 */
export type FunctionParams<T> = T extends (...args: infer P) => any ? P : never;

/**
 * Utility type for function return type
 */
export type FunctionReturn<T> = T extends (...args: any[]) => infer R ? R : never;

/**
 * Utility type for promise resolution type
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

/**
 * Strict omit that checks keys exist
 */
export type StrictOmit<T, K extends keyof T> = Omit<T, K>;

/**
 * Strict pick that checks keys exist
 */
export type StrictPick<T, K extends keyof T> = Pick<T, K>;

/**
 * Type guard for checking if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for checking if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for checking if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard for checking if value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard for checking if value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
