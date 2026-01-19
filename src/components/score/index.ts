// Core score display component
export {
  ScoreDisplay,
  ScoreThumbnail,
  ScoreExcerpt,
} from './score-display'
export type {
  ScoreDisplayProps,
  ScoreDisplayRef,
  ScoreThumbnailProps,
  ScoreExcerptProps,
} from './score-display'

// Legacy score viewer (deprecated, use ScoreDisplay)
export { ScoreViewer } from './score-viewer'
export type { ScoreViewerProps, ScoreViewerRef } from './score-viewer'

// Cursor components
export { ScoreCursor, AnimatedScoreCursor } from './score-cursor'
export type { ScoreCursorProps } from './score-cursor'

// Annotation components
export { ScoreAnnotations, AnnotationLayerToggle } from './score-annotations'
export type {
  Annotation,
  ScoreAnnotationsProps,
  AnnotationLayerToggleProps,
} from './score-annotations'

// Measure highlighting
export {
  MeasureHighlight,
  MeasureRangeHighlight,
  MeasureSelectionHighlight,
} from './measure-highlight'
export type {
  MeasureHighlightProps,
  MeasureRangeHighlightProps,
  MeasureSelectionHighlightProps,
} from './measure-highlight'

// Re-export useful types from hook
export type {
  NoteInfo,
  MeasureBounds,
  VoiceColorConfig,
} from '@/hooks/use-score-renderer'
export { DEFAULT_VOICE_COLORS } from '@/hooks/use-score-renderer'
