'use client'

/**
 * ScoreViewer - Legacy wrapper for ScoreDisplay
 *
 * This component maintains backward compatibility with the existing API
 * while delegating to the new ScoreDisplay component.
 *
 * @deprecated Use ScoreDisplay directly for new implementations
 */

import { useRef, forwardRef, useImperativeHandle } from 'react'
import { ScoreDisplay, ScoreDisplayRef } from './score-display'
import { NoteInfo } from '@/hooks/use-score-renderer'

export interface ScoreViewerProps {
  musicXML: string
  currentMeasure?: number
  currentBeat?: number
  cursorPosition?: number
  highlightedMeasures?: number[]
  voiceColors?: boolean
  zoom?: number
  onMeasureClick?: (measure: number) => void
  onNoteClick?: (note: NoteInfo) => void
  className?: string
  enableAutoScroll?: boolean
}

export interface ScoreViewerRef {
  scrollToMeasure: (measure: number) => void
  highlightMeasures: (measures: number[]) => void
  clearHighlights: () => void
  setZoom: (zoom: number) => void
}

/**
 * @deprecated Use ScoreDisplay directly
 */
export const ScoreViewer = forwardRef<ScoreViewerRef, ScoreViewerProps>(
  function ScoreViewer(
    {
      musicXML,
      currentMeasure,
      currentBeat = 1,
      cursorPosition: _cursorPosition,
      highlightedMeasures = [],
      voiceColors = false,
      zoom = 1.0,
      onMeasureClick,
      onNoteClick,
      className,
      enableAutoScroll = true,
    },
    ref
  ) {
    const displayRef = useRef<ScoreDisplayRef>(null)

    // Expose legacy methods
    useImperativeHandle(ref, () => ({
      scrollToMeasure: (measure: number) => displayRef.current?.scrollToMeasure(measure),
      highlightMeasures: (measures: number[]) => displayRef.current?.highlightMeasures(measures),
      clearHighlights: () => displayRef.current?.clearHighlights(),
      setZoom: (zoom: number) => displayRef.current?.setZoom(zoom),
    }), [])

    return (
      <ScoreDisplay
        ref={displayRef}
        musicXML={musicXML}
        currentMeasure={currentMeasure}
        currentBeat={currentBeat}
        highlightedMeasures={highlightedMeasures}
        voiceColors={voiceColors}
        zoom={zoom}
        onMeasureClick={onMeasureClick}
        onNoteClick={onNoteClick}
        className={className}
        enableAutoScroll={enableAutoScroll}
        showControls
        showStatusBar
      />
    )
  }
)

// Re-export for convenience
export { ScoreDisplay } from './score-display'
export type { ScoreDisplayProps, ScoreDisplayRef } from './score-display'
