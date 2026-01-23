'use client'

import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useScoreRenderer, NoteInfo, VoiceColorConfig, DEFAULT_VOICE_COLORS } from '@/hooks/use-score-renderer'
import { cn } from '@/lib/utils'
import { Loader2, ZoomIn, ZoomOut, Maximize2, RotateCcw, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/**
 * Props for the ScoreDisplay component
 */
export interface ScoreDisplayProps {
  /** MusicXML content as a string */
  musicXML?: string
  /** URL to fetch MusicXML from */
  scoreUrl?: string
  /** Current measure for cursor position */
  currentMeasure?: number
  /** Current beat within measure */
  currentBeat?: number
  /** Measures to highlight */
  highlightedMeasures?: number[]
  /** Highlight color for measures */
  highlightColor?: string
  /** Enable voice coloring */
  voiceColors?: boolean
  /** Custom voice color configuration */
  voiceColorConfig?: Partial<VoiceColorConfig>
  /** Initial zoom level (0.3-3.0) */
  zoom?: number
  /** Compact mode for thumbnails */
  compact?: boolean
  /** Show zoom controls */
  showControls?: boolean
  /** Show status bar */
  showStatusBar?: boolean
  /** Enable auto-scroll to current measure */
  enableAutoScroll?: boolean
  /** Enable cursor display */
  enableCursor?: boolean
  /** Called when a measure is clicked */
  onMeasureClick?: (measure: number) => void
  /** Called when a note is clicked */
  onNoteClick?: (note: NoteInfo) => void
  /** Called when score is ready */
  onReady?: (totalMeasures: number) => void
  /** Called on error */
  onError?: (error: Error) => void
  /** Additional class name */
  className?: string
  /** Container height */
  height?: string | number
  /** Drawing mode */
  drawingMode?: 'default' | 'compact' | 'compacttight' | 'preview' | 'thumbnail'
}

/**
 * Exposed methods via ref
 */
export interface ScoreDisplayRef {
  scrollToMeasure: (measure: number) => void
  highlightMeasures: (measures: number[]) => void
  highlightMeasureRange: (start: number, end: number) => void
  clearHighlights: () => void
  setZoom: (zoom: number) => void
  fitToWidth: () => void
  cursorToMeasure: (measure: number) => void
  getNotesAtMeasure: (measure: number) => NoteInfo[]
}

const MIN_ZOOM = 0.3
const MAX_ZOOM = 3.0
const ZOOM_STEP = 0.1

/**
 * ScoreDisplay - A comprehensive music score display component
 *
 * Uses OpenSheetMusicDisplay (OSMD) for high-quality music notation rendering.
 * Supports MusicXML input, measure highlighting, voice coloring, and interactive features.
 */
export const ScoreDisplay = forwardRef<ScoreDisplayRef, ScoreDisplayProps>(
  function ScoreDisplay(
    {
      musicXML,
      scoreUrl,
      currentMeasure,
      currentBeat = 1,
      highlightedMeasures = [],
      highlightColor,
      voiceColors = false,
      voiceColorConfig,
      zoom: initialZoom = 1.0,
      compact = false,
      showControls = true,
      showStatusBar = true,
      enableAutoScroll = true,
      enableCursor = false,
      onMeasureClick,
      onNoteClick: _onNoteClick,
      onReady,
      onError,
      className,
      height,
      drawingMode = 'compact',
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [currentZoom, setCurrentZoom] = useState(initialZoom)

    const {
      isLoading,
      isReady,
      error,
      state,
      loadScore,
      loadScoreFromUrl,
      setZoom,
      fitToWidth,
      scrollToMeasure,
      highlightMeasures: doHighlightMeasures,
      highlightMeasureRange,
      clearHighlights,
      setVoiceColors,
      cursorToMeasure,
      showCursor,
      getNotesAtMeasure,
    } = useScoreRenderer(containerRef, {
      drawingParameters: drawingMode,
      initialZoom,
      enableCursor,
      autoResize: true,
      backend: 'svg',
    })

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      scrollToMeasure,
      highlightMeasures: doHighlightMeasures,
      highlightMeasureRange,
      clearHighlights,
      setZoom: handleSetZoom,
      fitToWidth,
      cursorToMeasure,
      getNotesAtMeasure,
    }), [scrollToMeasure, doHighlightMeasures, highlightMeasureRange, clearHighlights, fitToWidth, cursorToMeasure, getNotesAtMeasure])

    // Load score from MusicXML string
    useEffect(() => {
      if (musicXML && !isLoading && !isReady) {
        loadScore(musicXML)
          .then(() => {
            onReady?.(state.totalMeasures)
          })
          .catch((err) => {
            onError?.(err)
          })
      }
    }, [musicXML, isLoading, isReady, loadScore, state.totalMeasures, onReady, onError])

    // Load score from URL
    useEffect(() => {
      if (scoreUrl && !musicXML && !isLoading && !isReady) {
        loadScoreFromUrl(scoreUrl)
          .then(() => {
            onReady?.(state.totalMeasures)
          })
          .catch((err) => {
            onError?.(err)
          })
      }
    }, [scoreUrl, musicXML, isLoading, isReady, loadScoreFromUrl, state.totalMeasures, onReady, onError])

    // Update highlights when highlightedMeasures changes
    useEffect(() => {
      if (isReady && highlightedMeasures.length > 0) {
        doHighlightMeasures(highlightedMeasures, highlightColor)
      } else if (isReady) {
        clearHighlights()
      }
    }, [isReady, highlightedMeasures, highlightColor, doHighlightMeasures, clearHighlights])

    // Update voice colors when setting changes
    useEffect(() => {
      if (isReady) {
        setVoiceColors(voiceColors, voiceColorConfig)
      }
    }, [isReady, voiceColors, voiceColorConfig, setVoiceColors])

    // Handle cursor and auto-scroll
    useEffect(() => {
      if (isReady && currentMeasure !== undefined) {
        if (enableCursor) {
          showCursor()
          cursorToMeasure(currentMeasure)
        }
        if (enableAutoScroll) {
          scrollToMeasure(currentMeasure)
        }
      }
    }, [isReady, currentMeasure, enableCursor, enableAutoScroll, showCursor, cursorToMeasure, scrollToMeasure])

    // Handle zoom
    const handleSetZoom = useCallback((newZoom: number) => {
      const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom))
      setCurrentZoom(clampedZoom)
      setZoom(clampedZoom)
    }, [setZoom])

    const handleZoomIn = useCallback(() => {
      handleSetZoom(currentZoom + ZOOM_STEP)
    }, [currentZoom, handleSetZoom])

    const handleZoomOut = useCallback(() => {
      handleSetZoom(currentZoom - ZOOM_STEP)
    }, [currentZoom, handleSetZoom])

    const handleResetZoom = useCallback(() => {
      handleSetZoom(1.0)
    }, [handleSetZoom])

    // Handle measure clicks
    useEffect(() => {
      if (!containerRef.current || !onMeasureClick) return

      const handleClick = (event: MouseEvent) => {
        const target = event.target as Element

        // Try to find measure from OSMD's data attributes or SVG structure
        const measureElement = target.closest('[data-measure]')
        if (measureElement) {
          const measure = parseInt(measureElement.getAttribute('data-measure') || '0', 10)
          if (measure > 0) {
            onMeasureClick(measure)
          }
        }
      }

      const container = containerRef.current
      container.addEventListener('click', handleClick)

      return () => {
        container.removeEventListener('click', handleClick)
      }
    }, [onMeasureClick])

    // Report errors
    useEffect(() => {
      if (error) {
        onError?.(error)
      }
    }, [error, onError])

    // Compute container height
    const containerHeight = height
      ? typeof height === 'number' ? `${height}px` : height
      : compact ? '200px' : '400px'

    return (
      <div className={cn('relative flex flex-col', className)}>
        {/* Controls */}
        {showControls && !compact && (
          <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-lg bg-background/90 p-1 shadow-sm backdrop-blur-sm border">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleZoomOut}
                    disabled={currentZoom <= MIN_ZOOM || !isReady}
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom out</TooltipContent>
              </Tooltip>

              <span className="min-w-[3.5rem] text-center text-sm font-medium tabular-nums">
                {Math.round(currentZoom * 100)}%
              </span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleZoomIn}
                    disabled={currentZoom >= MAX_ZOOM || !isReady}
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom in</TooltipContent>
              </Tooltip>

              <div className="mx-1 h-4 w-px bg-border" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => fitToWidth()}
                    disabled={!isReady}
                    aria-label="Fit to width"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Fit to width</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleResetZoom}
                    disabled={!isReady}
                    aria-label="Reset zoom"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset zoom</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Score Container */}
        <div
          ref={containerRef}
          className={cn(
            'score-container relative w-full overflow-auto rounded-lg border bg-white',
            isLoading && 'flex items-center justify-center',
            !isReady && !isLoading && !error && 'flex items-center justify-center',
            onMeasureClick && 'cursor-pointer'
          )}
          style={{ height: containerHeight }}
        >
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Loading score...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <Music className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-destructive">Failed to load score</p>
                <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (musicXML) {
                    loadScore(musicXML).catch(() => {})
                  } else if (scoreUrl) {
                    loadScoreFromUrl(scoreUrl).catch(() => {})
                  }
                }}
              >
                Try again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!musicXML && !scoreUrl && !isLoading && !error && (
            <div className="flex flex-col items-center gap-3 p-8 text-center text-muted-foreground">
              <div className="rounded-full bg-muted p-3">
                <Music className="h-6 w-6" />
              </div>
              <p className="text-sm">No score to display</p>
            </div>
          )}

          {/* Score renders here via OSMD */}
        </div>

        {/* Status Bar */}
        {showStatusBar && !compact && isReady && (
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {currentMeasure !== undefined && (
                <span className="flex items-center gap-1.5">
                  <span className="font-medium">Measure {currentMeasure}</span>
                  {currentBeat > 1 && <span className="text-xs">Beat {currentBeat}</span>}
                </span>
              )}
              {state.totalMeasures > 0 && (
                <span className="text-xs">
                  of {state.totalMeasures} measures
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {highlightedMeasures.length > 0 && (
                <span className="text-xs">
                  {highlightedMeasures.length} measure{highlightedMeasures.length !== 1 ? 's' : ''} highlighted
                </span>
              )}
              {voiceColors && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span>Voices:</span>
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: voiceColorConfig?.soprano || DEFAULT_VOICE_COLORS.soprano }} title="Soprano" />
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: voiceColorConfig?.alto || DEFAULT_VOICE_COLORS.alto }} title="Alto" />
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: voiceColorConfig?.tenor || DEFAULT_VOICE_COLORS.tenor }} title="Tenor" />
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: voiceColorConfig?.bass || DEFAULT_VOICE_COLORS.bass }} title="Bass" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)

/**
 * ScoreThumbnail - A compact score display for previews
 */
export interface ScoreThumbnailProps {
  musicXML?: string
  scoreUrl?: string
  highlightedMeasures?: number[]
  className?: string
  onClick?: () => void
}

export function ScoreThumbnail({
  musicXML,
  scoreUrl,
  highlightedMeasures,
  className,
  onClick,
}: ScoreThumbnailProps) {
  return (
    <div
      className={cn('cursor-pointer transition-shadow hover:shadow-md', className)}
      onClick={onClick}
    >
      <ScoreDisplay
        musicXML={musicXML}
        scoreUrl={scoreUrl}
        highlightedMeasures={highlightedMeasures}
        compact
        showControls={false}
        showStatusBar={false}
        enableAutoScroll={false}
        enableCursor={false}
        zoom={0.5}
        drawingMode="thumbnail"
        height={120}
      />
    </div>
  )
}

/**
 * ScoreExcerpt - Display a specific measure range
 */
export interface ScoreExcerptProps {
  musicXML?: string
  scoreUrl?: string
  startMeasure: number
  endMeasure: number
  highlightColor?: string
  voiceColors?: boolean
  showControls?: boolean
  className?: string
  onMeasureClick?: (measure: number) => void
}

export function ScoreExcerpt({
  musicXML,
  scoreUrl,
  startMeasure,
  endMeasure,
  highlightColor = 'rgba(37, 99, 235, 0.15)',
  voiceColors = false,
  showControls = false,
  className,
  onMeasureClick,
}: ScoreExcerptProps) {
  const measures = Array.from(
    { length: endMeasure - startMeasure + 1 },
    (_, i) => startMeasure + i
  )

  return (
    <ScoreDisplay
      musicXML={musicXML}
      scoreUrl={scoreUrl}
      highlightedMeasures={measures}
      highlightColor={highlightColor}
      voiceColors={voiceColors}
      showControls={showControls}
      showStatusBar={false}
      enableAutoScroll
      currentMeasure={startMeasure}
      zoom={0.8}
      height={250}
      className={className}
      onMeasureClick={onMeasureClick}
    />
  )
}
