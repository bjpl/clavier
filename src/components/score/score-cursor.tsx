'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface ScoreCursorProps {
  currentMeasure: number
  currentBeat: number
  isPlaying: boolean
  className?: string
}

export function ScoreCursor({
  currentMeasure,
  currentBeat,
  isPlaying,
  className,
}: ScoreCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Calculate cursor position based on current measure and beat
    // This would need to be integrated with OSMD's cursor API
    const measureElement = document.querySelector(
      `[data-measure="${currentMeasure}"]`
    )

    if (measureElement) {
      const rect = measureElement.getBoundingClientRect()
      const scoreContainer = document.querySelector('.score-container')
      const containerRect = scoreContainer?.getBoundingClientRect()

      if (containerRect) {
        // Approximate beat position within measure
        const beatWidth = rect.width / 4 // Assuming 4/4 time
        const x = rect.left - containerRect.left + currentBeat * beatWidth
        const y = rect.top - containerRect.top

        setPosition({ x, y })
        setVisible(true)
      }
    } else {
      setVisible(false)
    }
  }, [currentMeasure, currentBeat])

  if (!visible) return null

  return (
    <div
      className={cn(
        'pointer-events-none absolute z-20 h-full w-0.5 bg-accent/60',
        isPlaying && 'animate-pulse',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        boxShadow: '0 0 8px rgba(37, 99, 235, 0.4)',
      }}
      aria-hidden="true"
    />
  )
}

// Animated cursor component with smoother transitions
export function AnimatedScoreCursor({
  currentMeasure,
  currentBeat,
  isPlaying,
  className,
}: ScoreCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const measureElement = document.querySelector(
      `[data-measure="${currentMeasure}"]`
    )

    if (measureElement) {
      const rect = measureElement.getBoundingClientRect()
      const scoreContainer = document.querySelector('.score-container')
      const containerRect = scoreContainer?.getBoundingClientRect()

      if (containerRect) {
        const beatWidth = rect.width / 4
        const x = rect.left - containerRect.left + currentBeat * beatWidth
        const y = rect.top - containerRect.top

        setPosition({ x, y })
        setVisible(true)
      }
    } else {
      setVisible(false)
    }
  }, [currentMeasure, currentBeat])

  if (!visible) return null

  return (
    <div
      className={cn(
        'pointer-events-none absolute z-20 transition-all duration-100 ease-linear',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '2px',
        height: '100%',
      }}
      aria-hidden="true"
    >
      {/* Cursor line */}
      <div
        className={cn(
          'h-full w-full bg-accent',
          isPlaying && 'animate-pulse'
        )}
        style={{
          boxShadow: '0 0 8px rgba(37, 99, 235, 0.4)',
        }}
      />

      {/* Cursor head (optional decorative element) */}
      <div
        className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-accent"
        style={{
          boxShadow: '0 0 8px rgba(37, 99, 235, 0.6)',
        }}
      />
    </div>
  )
}
