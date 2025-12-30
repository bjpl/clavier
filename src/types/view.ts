/**
 * View and UI state type definitions for Clavier
 *
 * Defines all types related to user interface state, view modes,
 * display preferences, and visual settings.
 */

import { VoiceName } from './music';
import { AnnotationLayer } from './annotation';

/**
 * Top-level view mode of the application
 */
export type ViewMode =
  | 'walkthrough'   // Guided measure-by-measure analysis
  | 'curriculum'    // Structured learning path
  | 'explorer';     // Free exploration and search

/**
 * Score display options
 */
export interface ScoreViewOptions {
  /** Zoom level (0.5 = 50%, 2.0 = 200%) */
  zoom: number;
  /** Whether to show measure numbers */
  showMeasureNumbers: boolean;
  /** Whether to show beat numbers within measures */
  showBeatNumbers: boolean;
  /** Whether to color-code voices */
  colorCodeVoices: boolean;
  /** Colors for each voice */
  voiceColors: {
    [K in VoiceName]: string;
  };
  /** Which annotation layers to display */
  visibleAnnotationLayers: AnnotationLayer[];
  /** Whether to show Roman numeral analysis */
  showRomanNumerals: boolean;
  /** Whether to show figured bass notation */
  showFiguredBass: boolean;
  /** Whether to highlight non-chord tones */
  highlightNonChordTones: boolean;
  /** Layout orientation */
  orientation: 'horizontal' | 'vertical';
  /** Number of measures per line (0 = auto) */
  measuresPerLine: number;
  /** Whether to show keyboard diagram below score */
  showKeyboard: boolean;
  /** Whether to use simplified notation for beginners */
  simplifiedNotation: boolean;
  /** Staff spacing */
  staffSpacing: 'compact' | 'normal' | 'spacious';
}

/**
 * Keyboard/piano roll view options
 */
export interface KeyboardViewOptions {
  /** Whether keyboard is visible */
  visible: boolean;
  /** Number of octaves to display */
  octaveRange: {
    low: number;
    high: number;
  };
  /** Whether to show note names on keys */
  showNoteNames: boolean;
  /** Whether to highlight keys being played */
  highlightPlayedNotes: boolean;
  /** Color scheme for keyboard */
  colorScheme: 'default' | 'rainbow' | 'voice-colors';
  /** Keyboard size */
  size: 'small' | 'medium' | 'large';
  /** Whether to show piano roll view */
  showPianoRoll: boolean;
}

/**
 * Analysis panel options
 */
export interface AnalysisPanelOptions {
  /** Whether analysis panel is visible */
  visible: boolean;
  /** Position of the panel */
  position: 'left' | 'right' | 'bottom';
  /** Width (for left/right) or height (for bottom) as percentage */
  size: number;
  /** Active analysis tab */
  activeTab: 'harmony' | 'form' | 'counterpoint' | 'features' | 'commentary';
  /** Whether to auto-scroll with playback */
  autoScroll: boolean;
  /** Whether to show detailed explanations */
  showExplanations: boolean;
}

/**
 * Walkthrough mode state
 */
export interface WalkthroughState {
  /** Current piece being analyzed */
  pieceId?: string;
  /** Current measure in walkthrough */
  currentMeasure: number;
  /** Current step within measure (if multi-step) */
  currentStep: number;
  /** Total steps for current measure */
  totalSteps: number;
  /** Commentary for current measure */
  commentary?: string;
  /** Focus areas to highlight */
  focusAreas?: Array<{
    type: 'note' | 'chord' | 'measure' | 'voice';
    ids: string[];
    description?: string;
  }>;
  /** Whether to auto-advance after playback */
  autoAdvance: boolean;
  /** Playback settings for walkthrough */
  playbackSettings: {
    playEntireMeasure: boolean;
    loopCurrentMeasure: boolean;
    highlightActiveNotes: boolean;
  };
}

/**
 * Curriculum view state
 */
export interface CurriculumViewState {
  /** Currently selected domain ID */
  selectedDomainId?: string;
  /** Currently selected unit ID */
  selectedUnitId?: string;
  /** Currently selected module ID */
  selectedModuleId?: string;
  /** Currently active lesson ID */
  activeLessonId?: string;
  /** Current section within lesson */
  currentSectionIndex: number;
  /** Whether to show progress indicators */
  showProgress: boolean;
  /** View layout */
  layout: 'tree' | 'cards' | 'list';
  /** Filter options */
  filters: {
    showCompleted: boolean;
    showInProgress: boolean;
    showNotStarted: boolean;
    difficulty?: Array<'beginner' | 'intermediate' | 'advanced' | 'expert'>;
  };
}

/**
 * Explorer view state
 */
export interface ExplorerViewState {
  /** Search query */
  searchQuery: string;
  /** Active filters */
  activeFilters: {
    categories: string[];
    pieceTypes: string[];
    keys: string[];
    modes: string[];
  };
  /** Search results view */
  resultsView: 'grid' | 'list' | 'timeline';
  /** Selected piece for detailed view */
  selectedPieceId?: string;
  /** Selected feature for analysis */
  selectedFeatureId?: string;
  /** Comparison mode active */
  comparisonMode: boolean;
  /** Pieces being compared */
  comparedPieceIds: string[];
}

/**
 * Theme configuration
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Accessibility settings
 */
export interface AccessibilitySettings {
  /** High contrast mode */
  highContrast: boolean;
  /** Reduce motion/animations */
  reduceMotion: boolean;
  /** Larger text */
  largeText: boolean;
  /** Screen reader optimizations */
  screenReaderMode: boolean;
  /** Keyboard navigation hints */
  showKeyboardHints: boolean;
  /** Focus indicators enhancement */
  enhancedFocus: boolean;
  /** Color blind friendly mode */
  colorBlindMode?: 'protanopia' | 'deuteranopia' | 'tritanopia';
}

/**
 * User preferences (persisted)
 */
export interface UserPreferences {
  /** Theme preference */
  theme: Theme;
  /** Default view mode when opening app */
  defaultViewMode: ViewMode;
  /** Score display preferences */
  scoreView: ScoreViewOptions;
  /** Keyboard display preferences */
  keyboardView: KeyboardViewOptions;
  /** Analysis panel preferences */
  analysisPanel: AnalysisPanelOptions;
  /** Accessibility settings */
  accessibility: AccessibilitySettings;
  /** Audio preferences */
  audio: {
    defaultTempo: number;
    defaultVolume: number;
    defaultInstrument: string;
    metronomeEnabled: boolean;
  };
  /** Language preference */
  language: string;
  /** Auto-save progress */
  autoSaveProgress: boolean;
}

/**
 * Layout configuration for responsive design
 */
export interface LayoutConfig {
  /** Viewport width */
  viewportWidth: number;
  /** Viewport height */
  viewportHeight: number;
  /** Breakpoint */
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide';
  /** Whether using touch interface */
  isTouchDevice: boolean;
  /** Sidebar collapsed state */
  sidebarCollapsed: boolean;
  /** Panel states */
  panels: {
    navigation: PanelState;
    analysis: PanelState;
    controls: PanelState;
  };
}

/**
 * Panel state
 */
export interface PanelState {
  /** Whether panel is visible */
  visible: boolean;
  /** Whether panel is pinned (always visible) */
  pinned: boolean;
  /** Panel size (width or height depending on position) */
  size: number;
  /** Whether panel is collapsed */
  collapsed: boolean;
}

/**
 * Modal/dialog state
 */
export interface ModalState {
  /** Currently open modal (if any) */
  openModal?: 'settings' | 'help' | 'about' | 'progress' | 'export' | 'share';
  /** Modal-specific data */
  modalData?: unknown;
}

/**
 * Notification state
 */
export interface NotificationState {
  /** Active notifications */
  notifications: Notification[];
  /** Position for notification display */
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  /** Maximum number of visible notifications */
  maxVisible: number;
}

/**
 * Individual notification
 */
export interface Notification {
  /** Unique ID */
  id: string;
  /** Notification type */
  type: 'info' | 'success' | 'warning' | 'error';
  /** Title */
  title?: string;
  /** Message */
  message: string;
  /** Duration in ms (0 = persistent) */
  duration: number;
  /** Timestamp when created */
  timestamp: number;
  /** Optional action button */
  action?: {
    label: string;
    callback: () => void;
  };
}

/**
 * Loading state
 */
export interface LoadingState {
  /** Whether app is in loading state */
  isLoading: boolean;
  /** What is being loaded */
  loadingMessage?: string;
  /** Loading progress (0-100) */
  progress?: number;
  /** Specific resources being loaded */
  loadingResources: Set<string>;
}

/**
 * Error state
 */
export interface ErrorState {
  /** Whether there's an active error */
  hasError: boolean;
  /** Error message */
  errorMessage?: string;
  /** Error details */
  errorDetails?: unknown;
  /** Error type */
  errorType?: 'network' | 'data' | 'audio' | 'permission' | 'unknown';
  /** Whether error is recoverable */
  isRecoverable: boolean;
  /** Recovery action */
  recoveryAction?: () => void;
}
