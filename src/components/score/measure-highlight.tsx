'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface MeasureHighlightProps {
  measures: number[]
  voiceColors?: boolean
  highlightColor?: string
  className?: string
}

const VOICE_COLORS: Record<number, string> = {
  1: 'rgba(37, 99, 235, 0.15)', // Soprano - blue
  2: 'rgba(5, 150, 105, 0.15)', // Alto - green
  3: 'rgba(217, 119, 6, 0.15)', // Tenor - amber
  4: 'rgba(124, 58, 237, 0.15)', // Bass - purple
}

const DEFAULT_HIGHLIGHT_COLOR = 'rgba(37, 99, 235, 0.1)'
const DEFAULT_BORDER_COLOR = '#2563EB'

export function MeasureHighlight({
  measures,
  voiceColors = false,
  highlightColor = DEFAULT_HIGHLIGHT_COLOR,
  className: _className,
}: MeasureHighlightProps) {
  useEffect(() => {
    if (measures.length === 0) return

    const highlightElements: SVGRectElement[] = []

    measures.forEach((measureNumber) => {
      const measureElement = document.querySelector(
        `[data-measure="${measureNumber}"]`
      )

      if (!measureElement) return

      const rect = measureElement.getBoundingClientRect()
      const svgElement = document.querySelector('.score-container svg')

      if (!svgElement) return

      // Create highlight rectangle
      const highlight = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect'
      )

      // Get SVG coordinates
      const svgRect = svgElement.getBoundingClientRect()
      const x = rect.left - svgRect.left
      const y = rect.top - svgRect.top

      highlight.setAttribute('x', String(x))
      highlight.setAttribute('y', String(y))
      highlight.setAttribute('width', String(rect.width))
      highlight.setAttribute('height', String(rect.height))
      highlight.setAttribute('fill', highlightColor)
      highlight.setAttribute('stroke', DEFAULT_BORDER_COLOR)
      highlight.setAttribute('stroke-width', '2')
      highlight.setAttribute('rx', '4')
      highlight.classList.add('measure-highlight')

      // Insert at the beginning so it appears behind notes
      svgElement.insertBefore(highlight, svgElement.firstChild)
      highlightElements.push(highlight)

      // If voice colors enabled, highlight individual voices
      if (voiceColors) {
        const voiceElements = measureElement.querySelectorAll('[data-voice]')

        voiceElements.forEach((voiceElement) => {
          const voice = parseInt(
            voiceElement.getAttribute('data-voice') || '0',
            10
          )
          const voiceRect = voiceElement.getBoundingClientRect()
          const voiceColor = VOICE_COLORS[voice]

          if (!voiceColor) return

          const voiceHighlight = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'rect'
          )

          const voiceX = voiceRect.left - svgRect.left
          const voiceY = voiceRect.top - svgRect.top

          voiceHighlight.setAttribute('x', String(voiceX - 4))
          voiceHighlight.setAttribute('y', String(voiceY - 4))
          voiceHighlight.setAttribute('width', String(voiceRect.width + 8))
          voiceHighlight.setAttribute('height', String(voiceRect.height + 8))
          voiceHighlight.setAttribute('fill', voiceColor)
          voiceHighlight.setAttribute('rx', '2')
          voiceHighlight.classList.add('measure-highlight', 'voice-highlight')

          svgElement.insertBefore(voiceHighlight, svgElement.firstChild)
          highlightElements.push(voiceHighlight)
        })
      }
    })

    // Cleanup function
    return () => {
      highlightElements.forEach((element) => {
        element.remove()
      })
    }
  }, [measures, voiceColors, highlightColor])

  return null
}

// Range highlight component for highlighting consecutive measures
export interface MeasureRangeHighlightProps {
  startMeasure: number
  endMeasure: number
  voiceColors?: boolean
  highlightColor?: string
  className?: string
}

export function MeasureRangeHighlight({
  startMeasure,
  endMeasure,
  voiceColors = false,
  highlightColor = DEFAULT_HIGHLIGHT_COLOR,
  className,
}: MeasureRangeHighlightProps) {
  const measures = Array.from(
    { length: endMeasure - startMeasure + 1 },
    (_, i) => startMeasure + i
  )

  return (
    <MeasureHighlight
      measures={measures}
      voiceColors={voiceColors}
      highlightColor={highlightColor}
      className={className}
    />
  )
}

// Selection highlight component with different styling
export interface MeasureSelectionHighlightProps {
  selectedMeasures: number[]
  className?: string
}

export function MeasureSelectionHighlight({
  selectedMeasures,
  className,
}: MeasureSelectionHighlightProps) {
  return (
    <MeasureHighlight
      measures={selectedMeasures}
      highlightColor="rgba(59, 130, 246, 0.2)"
      className={cn('selection-highlight', className)}
    />
  )
}
