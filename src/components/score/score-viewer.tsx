'use client'

import { useRef, useEffect, useState } from 'react'
import { useScoreRenderer, NoteInfo } from '@/hooks/use-score-renderer'
import { cn } from '@/lib/utils'
import { Loader2, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ScoreViewerProps {
  musicXML: string
  currentMeasure?: number
  currentBeat?: number
  cursorPosition?: number // 0-1 for smooth cursor movement within measure
  highlightedMeasures?: number[]
  voiceColors?: boolean
  zoom?: number
  onMeasureClick?: (measure: number) => void
  onNoteClick?: (note: NoteInfo) => void
  className?: string
  enableAutoScroll?: boolean
}

const DEFAULT_ZOOM = 1.0
const MIN_ZOOM = 0.5
const MAX_ZOOM = 2.0
const ZOOM_STEP = 0.1

export function ScoreViewer({
  musicXML,
  currentMeasure,
  currentBeat = 1,
  cursorPosition = 0,
  highlightedMeasures = [],
  voiceColors = false,
  zoom = DEFAULT_ZOOM,
  onMeasureClick,
  onNoteClick: _onNoteClick,
  className,
  enableAutoScroll = true,
}: ScoreViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentZoom, setCurrentZoom] = useState(zoom)

  const {
    osmd,
    isLoading,
    error,
    loadScore,
    setZoom,
    scrollToMeasure,
    highlightNotes: _highlightNotes,
  } = useScoreRenderer(containerRef)

  // Load score when musicXML changes
  useEffect(() => {
    if (musicXML && osmd) {
      loadScore(musicXML).catch((err) => {
        console.error('Failed to load score:', err)
      })
    }
  }, [musicXML, osmd, loadScore])

  // Update zoom when prop changes
  useEffect(() => {
    if (osmd && currentZoom !== zoom) {
      setCurrentZoom(zoom)
      setZoom(zoom)
    }
  }, [zoom, osmd, setZoom, currentZoom])

  // Scroll to current measure (only if auto-scroll enabled)
  useEffect(() => {
    if (currentMeasure !== undefined && osmd && enableAutoScroll) {
      scrollToMeasure(currentMeasure)
    }
  }, [currentMeasure, osmd, scrollToMeasure, enableAutoScroll])

  // Apply voice colors
  useEffect(() => {
    if (!osmd || !containerRef.current) return

    const svgElement = containerRef.current.querySelector('svg')
    if (!svgElement) return

    if (voiceColors) {
      // Apply voice-specific colors
      const voiceColorMap: Record<number, string> = {
        1: '#2563EB', // Soprano - blue
        2: '#059669', // Alto - green
        3: '#D97706', // Tenor - amber
        4: '#7C3AED', // Bass - purple
      }

      svgElement.querySelectorAll('[data-voice]').forEach((element) => {
        const voice = parseInt(element.getAttribute('data-voice') || '0', 10)
        const color = voiceColorMap[voice]

        if (color) {
          ;(element as SVGElement).style.fill = color
          ;(element as SVGElement).style.stroke = color
        }
      })
    } else {
      // Reset to default colors
      svgElement.querySelectorAll('[data-voice]').forEach((element) => {
        ;(element as SVGElement).style.fill = ''
        ;(element as SVGElement).style.stroke = ''
      })
    }
  }, [voiceColors, osmd, musicXML])

  // Handle zoom controls
  const handleZoomIn = () => {
    const newZoom = Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM)
    setCurrentZoom(newZoom)
    setZoom(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(currentZoom - ZOOM_STEP, MIN_ZOOM)
    setCurrentZoom(newZoom)
    setZoom(newZoom)
  }

  // Handle measure clicks
  useEffect(() => {
    if (!containerRef.current || !onMeasureClick) return

    const handleClick = (event: MouseEvent) => {
      const target = event.target as SVGElement
      const measureElement = target.closest('[data-measure]')

      if (measureElement) {
        const measure = parseInt(
          measureElement.getAttribute('data-measure') || '0',
          10
        )
        onMeasureClick(measure)
      }
    }

    containerRef.current.addEventListener('click', handleClick)

    return () => {
      containerRef.current?.removeEventListener('click', handleClick)
    }
  }, [onMeasureClick])

  return (
    <div className={cn('relative flex flex-col', className)}>
      {/* Zoom Controls */}
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomOut}
          disabled={currentZoom <= MIN_ZOOM}
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomIn}
          disabled={currentZoom >= MAX_ZOOM}
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="flex items-center rounded-md border bg-background px-3 text-sm">
          {Math.round(currentZoom * 100)}%
        </span>
      </div>

      {/* Score Container */}
      <div
        ref={containerRef}
        className={cn(
          'min-h-[400px] w-full overflow-auto rounded-lg border bg-white p-4',
          isLoading && 'flex items-center justify-center'
        )}
      >
        {isLoading && (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading score...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-2 text-destructive">
            <p className="text-sm font-medium">Failed to load score</p>
            <p className="text-xs text-muted-foreground">{error.message}</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {currentMeasure !== undefined && (
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Measure {currentMeasure}, Beat {currentBeat}
            {cursorPosition > 0 && (
              <span className="ml-1 text-xs">
                ({Math.round(cursorPosition * 100)}%)
              </span>
            )}
          </span>
          {highlightedMeasures.length > 0 && (
            <span>
              {highlightedMeasures.length} measure
              {highlightedMeasures.length !== 1 ? 's' : ''} highlighted
            </span>
          )}
        </div>
      )}
    </div>
  )
}
