'use client'

import { useState, useEffect, useCallback, RefObject } from 'react'

// Dynamic import type for OpenSheetMusicDisplay
type OpenSheetMusicDisplay = any

export interface NoteInfo {
  measure: number
  voice: number
  pitch: string
  duration: number
  position: { x: number; y: number }
}

export interface UseScoreRendererReturn {
  osmd: OpenSheetMusicDisplay | null
  isLoading: boolean
  error: Error | null
  loadScore: (musicXML: string) => Promise<void>
  setZoom: (zoom: number) => void
  scrollToMeasure: (measure: number) => void
  highlightNotes: (notes: NoteInfo[]) => void
  clearHighlights: () => void
  destroy: () => void
}

export function useScoreRenderer(
  containerRef: RefObject<HTMLDivElement>
): UseScoreRendererReturn {
  const [osmd, setOsmd] = useState<OpenSheetMusicDisplay | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Initialize OSMD when container is ready
  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') {
      return
    }

    let mounted = true

    const initializeOSMD = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Dynamic import for browser-only library
        const { OpenSheetMusicDisplay } = await import('opensheetmusicdisplay')

        if (!mounted || !containerRef.current) return

        const osmdInstance = new OpenSheetMusicDisplay(containerRef.current, {
          autoResize: true,
          drawTitle: false,
          drawSubtitle: false,
          drawComposer: false,
          drawLyricist: false,
          drawCredits: false,
          drawPartNames: true,
          followCursor: true,
          backend: 'svg',
          drawingParameters: 'compact',
        })

        setOsmd(osmdInstance)
        setIsLoading(false)
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err : new Error('Failed to initialize OSMD')
          )
          setIsLoading(false)
        }
      }
    }

    initializeOSMD()

    return () => {
      mounted = false
    }
  }, [containerRef])

  // Load MusicXML score
  const loadScore = useCallback(
    async (musicXML: string) => {
      if (!osmd) {
        throw new Error('OSMD not initialized')
      }

      try {
        setIsLoading(true)
        setError(null)

        await osmd.load(musicXML)
        osmd.render()

        setIsLoading(false)
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to load score')
        setError(error)
        setIsLoading(false)
        throw error
      }
    },
    [osmd]
  )

  // Set zoom level
  const setZoom = useCallback(
    (zoom: number) => {
      if (!osmd) return

      osmd.zoom = zoom
      osmd.render()
    },
    [osmd]
  )

  // Scroll to specific measure
  const scrollToMeasure = useCallback(
    (measure: number) => {
      if (!osmd || !containerRef.current) return

      try {
        const measureElement =
          containerRef.current.querySelector(`[data-measure="${measure}"]`)

        if (measureElement) {
          measureElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          })
        }
      } catch (err) {
        console.error('Failed to scroll to measure:', err)
      }
    },
    [osmd, containerRef]
  )

  // Highlight specific notes
  const highlightNotes = useCallback(
    (notes: NoteInfo[]) => {
      if (!osmd || !containerRef.current) return

      try {
        // Clear existing highlights
        const highlights = containerRef.current.querySelectorAll('.note-highlight')
        highlights.forEach((el) => el.remove())

        // Add new highlights
        notes.forEach((note) => {
          const highlightElement = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'circle'
          )
          highlightElement.setAttribute('cx', String(note.position.x))
          highlightElement.setAttribute('cy', String(note.position.y))
          highlightElement.setAttribute('r', '8')
          highlightElement.setAttribute('fill', 'rgba(37, 99, 235, 0.2)')
          highlightElement.setAttribute('stroke', '#2563EB')
          highlightElement.setAttribute('stroke-width', '2')
          highlightElement.classList.add('note-highlight')

          const svgElement = containerRef.current?.querySelector('svg')
          if (svgElement) {
            svgElement.appendChild(highlightElement)
          }
        })
      } catch (err) {
        console.error('Failed to highlight notes:', err)
      }
    },
    [osmd, containerRef]
  )

  // Clear all highlights
  const clearHighlights = useCallback(() => {
    if (!containerRef.current) return

    const highlights = containerRef.current.querySelectorAll('.note-highlight')
    highlights.forEach((el) => el.remove())
  }, [containerRef])

  // Cleanup
  const destroy = useCallback(() => {
    if (osmd) {
      try {
        osmd.clear()
      } catch (err) {
        console.error('Error destroying OSMD:', err)
      }
      setOsmd(null)
    }
  }, [osmd])

  useEffect(() => {
    return () => {
      destroy()
    }
  }, [destroy])

  return {
    osmd,
    isLoading,
    error,
    loadScore,
    setZoom,
    scrollToMeasure,
    highlightNotes,
    clearHighlights,
    destroy,
  }
}
