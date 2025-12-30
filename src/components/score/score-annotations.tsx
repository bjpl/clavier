'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export interface Annotation {
  id: string
  measure: number
  beat?: number
  layer: string
  type: 'roman-numeral' | 'form-label' | 'harmonic-function' | 'note' | 'custom'
  content: string
  position?: { x: number; y: number }
  color?: string
}

export interface ScoreAnnotationsProps {
  annotations: Annotation[]
  visibleLayers: string[]
  onAnnotationClick?: (annotation: Annotation) => void
  className?: string
}

const ANNOTATION_COLORS: Record<string, string> = {
  'roman-numeral': 'bg-blue-100 text-blue-900 border-blue-300',
  'form-label': 'bg-purple-100 text-purple-900 border-purple-300',
  'harmonic-function': 'bg-green-100 text-green-900 border-green-300',
  note: 'bg-amber-100 text-amber-900 border-amber-300',
  custom: 'bg-gray-100 text-gray-900 border-gray-300',
}

export function ScoreAnnotations({
  annotations,
  visibleLayers,
  onAnnotationClick,
  className,
}: ScoreAnnotationsProps) {
  const visibleAnnotations = annotations.filter((annotation) =>
    visibleLayers.includes(annotation.layer)
  )

  if (visibleAnnotations.length === 0) {
    return null
  }

  return (
    <div className={cn('pointer-events-none absolute inset-0 z-10', className)}>
      {visibleAnnotations.map((annotation) => (
        <AnnotationLabel
          key={annotation.id}
          annotation={annotation}
          onClick={onAnnotationClick}
        />
      ))}
    </div>
  )
}

interface AnnotationLabelProps {
  annotation: Annotation
  onClick?: (annotation: Annotation) => void
}

function AnnotationLabel({ annotation, onClick }: AnnotationLabelProps) {
  const position = getAnnotationPosition(annotation)
  const colorClass =
    annotation.color || ANNOTATION_COLORS[annotation.type] || ANNOTATION_COLORS.custom

  const handleClick = () => {
    if (onClick) {
      onClick(annotation)
    }
  }

  return (
    <div
      className="pointer-events-auto absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <Badge
        variant="outline"
        className={cn(
          'cursor-pointer select-none transition-all hover:scale-105',
          colorClass,
          onClick && 'hover:shadow-md'
        )}
        onClick={handleClick}
      >
        {annotation.content}
      </Badge>
    </div>
  )
}

function getAnnotationPosition(annotation: Annotation): { x: number; y: number } {
  // If explicit position provided, use it
  if (annotation.position) {
    return annotation.position
  }

  // Otherwise, calculate position from measure and beat
  const measureElement = document.querySelector(
    `[data-measure="${annotation.measure}"]`
  )

  if (!measureElement) {
    return { x: 0, y: 0 }
  }

  const rect = measureElement.getBoundingClientRect()
  const scoreContainer = document.querySelector('.score-container')
  const containerRect = scoreContainer?.getBoundingClientRect()

  if (!containerRect) {
    return { x: 0, y: 0 }
  }

  const x = rect.left - containerRect.left + rect.width / 2
  let y = rect.top - containerRect.top

  // Adjust Y position based on beat if provided
  if (annotation.beat !== undefined) {
    const beatWidth = rect.width / 4 // Assuming 4/4 time
    const beatX = annotation.beat * beatWidth
    y = rect.top - containerRect.top + beatX * 0.1 // Slight vertical offset
  }

  // Offset based on annotation type for layering
  const typeOffsets: Record<string, number> = {
    'roman-numeral': -10,
    'form-label': -30,
    'harmonic-function': -50,
    note: -70,
    custom: -90,
  }

  y += typeOffsets[annotation.type] || 0

  return { x, y }
}

// Layer toggle component
export interface AnnotationLayerToggleProps {
  layers: string[]
  visibleLayers: string[]
  onToggleLayer: (layer: string) => void
  className?: string
}

export function AnnotationLayerToggle({
  layers,
  visibleLayers,
  onToggleLayer,
  className,
}: AnnotationLayerToggleProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {layers.map((layer) => {
        const isVisible = visibleLayers.includes(layer)

        return (
          <Badge
            key={layer}
            variant={isVisible ? 'default' : 'outline'}
            className="cursor-pointer select-none transition-all hover:scale-105"
            onClick={() => onToggleLayer(layer)}
          >
            {layer}
          </Badge>
        )
      })}
    </div>
  )
}
