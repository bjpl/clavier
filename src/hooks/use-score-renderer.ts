'use client'

import { useState, useEffect, useCallback, useRef, RefObject, useMemo } from 'react'

/**
 * OSMD Type Definitions
 * OpenSheetMusicDisplay types for TypeScript integration
 */
interface IOSMDOptions {
  autoResize?: boolean
  backend?: 'svg' | 'canvas'
  drawTitle?: boolean
  drawSubtitle?: boolean
  drawComposer?: boolean
  drawLyricist?: boolean
  drawCredits?: boolean
  drawPartNames?: boolean
  drawPartAbbreviations?: boolean
  drawMeasureNumbers?: boolean
  drawMeasureNumbersOnlyAtSystemStart?: boolean
  drawTimeSignatures?: boolean
  drawingParameters?: 'default' | 'compact' | 'compacttight' | 'preview' | 'thumbnail'
  coloringMode?: number
  coloringEnabled?: boolean
  colorStemsLikeNoteheads?: boolean
  disableCursor?: boolean
  followCursor?: boolean
  pageFormat?: string
  pageBackgroundColor?: string
  renderSingleHorizontalStaffline?: boolean
}

interface GraphicalMusicSheet {
  MeasureList: GraphicalMeasure[][]
  findGraphicalMeasure(measureIndex: number, staffIndex?: number): GraphicalMeasure | undefined
}

interface GraphicalMeasure {
  PositionAndShape: BoundingBox
  MeasureNumber: number
  staffEntries?: StaffEntry[]
}

interface StaffEntry {
  graphicalVoiceEntries: GraphicalVoiceEntry[]
}

interface GraphicalVoiceEntry {
  parentVoiceEntry?: {
    ParentVoice?: {
      VoiceId: number
    }
  }
  notes?: GraphicalNote[]
}

interface GraphicalNote {
  PositionAndShape: BoundingBox
  sourceNote?: {
    Pitch?: {
      ToString(): string
      Frequency: number
    }
    Length?: {
      RealValue: number
    }
  }
}

interface BoundingBox {
  AbsolutePosition: { x: number; y: number }
  Size: { width: number; height: number }
  BorderLeft: number
  BorderRight: number
  BorderTop: number
  BorderBottom: number
}

// CursorOptions can be used for future cursor customization
// type CursorOptions = {
//   type?: number
//   color?: string
//   alpha?: number
//   follow?: boolean
// }

interface Cursor {
  show(): void
  hide(): void
  reset(): void
  next(): void
  previous(): void
  iterator: {
    CurrentMeasureIndex: number
    CurrentMeasure?: { MeasureNumber: number }
  }
  cursorElement?: HTMLElement | SVGElement
}

type OSMDInstance = {
  load(content: string | Document): Promise<unknown>
  render(): void
  clear(): void
  zoom: number
  Sheet?: {
    SourceMeasures?: { length: number }[]
  }
  GraphicSheet?: GraphicalMusicSheet
  cursor?: Cursor
  enableOrDisableCursors(enable: boolean): void
  setOptions(options: IOSMDOptions): void
  EngravingRules?: {
    ColoringMode: number
    ColoringEnabled: boolean
    DefaultColorStem: string
    DefaultColorNotehead: string
    DefaultColorLabel: string
    RenderSingleHorizontalStaffline: boolean
    PageFormat?: { width: number; height: number }
  }
}

/**
 * Note information for highlighting and interaction
 */
export interface NoteInfo {
  measure: number
  beat: number
  voice: number
  pitch: string
  duration: number
  position: { x: number; y: number }
  width: number
  height: number
}

/**
 * Measure bounding box information
 */
export interface MeasureBounds {
  measure: number
  x: number
  y: number
  width: number
  height: number
}

/**
 * Voice color configuration
 */
export interface VoiceColorConfig {
  soprano: string
  alto: string
  tenor: string
  bass: string
}

export const DEFAULT_VOICE_COLORS: VoiceColorConfig = {
  soprano: '#2563EB', // Blue
  alto: '#059669',    // Green
  tenor: '#D97706',   // Amber
  bass: '#7C3AED',    // Purple
}

/**
 * Score renderer state
 */
export interface ScoreRendererState {
  isLoading: boolean
  isReady: boolean
  error: Error | null
  totalMeasures: number
  currentMeasure: number
  zoom: number
}

/**
 * Score renderer return interface
 */
export interface UseScoreRendererReturn {
  // State
  osmd: OSMDInstance | null
  state: ScoreRendererState
  isLoading: boolean
  isReady: boolean
  error: Error | null

  // Score operations
  loadScore: (source: string | Document) => Promise<void>
  loadScoreFromUrl: (url: string) => Promise<void>
  clearScore: () => void

  // Display control
  setZoom: (zoom: number) => void
  fitToWidth: () => void
  fitToPage: () => void

  // Navigation
  scrollToMeasure: (measure: number) => void
  getMeasureBounds: (measure: number) => MeasureBounds | null
  getAllMeasureBounds: () => MeasureBounds[]

  // Cursor
  showCursor: () => void
  hideCursor: () => void
  cursorToMeasure: (measure: number) => void
  cursorNext: () => void
  cursorPrevious: () => void

  // Highlighting
  highlightMeasures: (measures: number[], color?: string) => void
  highlightMeasureRange: (start: number, end: number, color?: string) => void
  highlightNotes: (notes: NoteInfo[], color?: string) => void
  clearHighlights: () => void

  // Voice coloring
  setVoiceColors: (enabled: boolean, colors?: Partial<VoiceColorConfig>) => void

  // Utilities
  getNotesAtMeasure: (measure: number) => NoteInfo[]
  destroy: () => void
}

/**
 * OSMD initialization options
 */
export interface ScoreRendererOptions {
  autoResize?: boolean
  backend?: 'svg' | 'canvas'
  drawTitle?: boolean
  drawMeasureNumbers?: boolean
  drawingParameters?: 'default' | 'compact' | 'compacttight' | 'preview' | 'thumbnail'
  initialZoom?: number
  enableCursor?: boolean
  followCursor?: boolean
  pageBackgroundColor?: string
}

const DEFAULT_OPTIONS: ScoreRendererOptions = {
  autoResize: true,
  backend: 'svg',
  drawTitle: false,
  drawMeasureNumbers: true,
  drawingParameters: 'compact',
  initialZoom: 1.0,
  enableCursor: true,
  followCursor: true,
  pageBackgroundColor: '#ffffff',
}

/**
 * Custom hook for OSMD score rendering
 * Provides comprehensive control over music notation display
 */
export function useScoreRenderer(
  containerRef: RefObject<HTMLDivElement | null>,
  options: ScoreRendererOptions = {}
): UseScoreRendererReturn {
  const mergedOptions = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options])

  const [osmd, setOsmd] = useState<OSMDInstance | null>(null)
  const [state, setState] = useState<ScoreRendererState>({
    isLoading: true,
    isReady: false,
    error: null,
    totalMeasures: 0,
    currentMeasure: 0,
    zoom: mergedOptions.initialZoom || 1.0,
  })

  const highlightLayerRef = useRef<SVGGElement | null>(null)
  const mountedRef = useRef(true)

  // Initialize OSMD when container is ready
  useEffect(() => {
    mountedRef.current = true

    if (!containerRef.current || typeof window === 'undefined') {
      return
    }

    const initializeOSMD = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        // Dynamic import for code splitting - OSMD is heavy
        const { OpenSheetMusicDisplay } = await import('opensheetmusicdisplay')

        if (!mountedRef.current || !containerRef.current) return

        const osmdInstance = new OpenSheetMusicDisplay(containerRef.current, {
          autoResize: mergedOptions.autoResize,
          backend: mergedOptions.backend,
          drawTitle: mergedOptions.drawTitle,
          drawSubtitle: false,
          drawComposer: false,
          drawLyricist: false,
          drawCredits: false,
          drawPartNames: true,
          drawMeasureNumbers: mergedOptions.drawMeasureNumbers,
          drawMeasureNumbersOnlyAtSystemStart: true,
          drawTimeSignatures: true,
          drawingParameters: mergedOptions.drawingParameters,
          disableCursor: !mergedOptions.enableCursor,
          followCursor: mergedOptions.followCursor,
          pageBackgroundColor: mergedOptions.pageBackgroundColor,
          renderSingleHorizontalStaffline: false,
        }) as unknown as OSMDInstance

        if (mountedRef.current) {
          setOsmd(osmdInstance)
          setState(prev => ({
            ...prev,
            isLoading: false,
            isReady: false,
            zoom: mergedOptions.initialZoom || 1.0
          }))
        }
      } catch (err) {
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isReady: false,
            error: err instanceof Error ? err : new Error('Failed to initialize OSMD'),
          }))
        }
      }
    }

    initializeOSMD()

    return () => {
      mountedRef.current = false
    }
  }, [containerRef, mergedOptions])

  /**
   * Load MusicXML score from string or Document
   */
  const loadScore = useCallback(
    async (source: string | Document) => {
      if (!osmd) {
        throw new Error('OSMD not initialized')
      }

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null, isReady: false }))

        await osmd.load(source)
        osmd.render()

        // Count total measures
        const totalMeasures = osmd.Sheet?.SourceMeasures?.length || 0

        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isReady: true,
            totalMeasures,
            currentMeasure: 1,
          }))

          // Initialize highlight layer after rendering
          createHighlightLayer()
        }
      } catch (err) {
        if (mountedRef.current) {
          const error = err instanceof Error ? err : new Error('Failed to load score')
          setState(prev => ({ ...prev, isLoading: false, isReady: false, error }))
          throw error
        }
      }
    },
    [osmd]
  )

  /**
   * Load MusicXML from URL
   */
  const loadScoreFromUrl = useCallback(
    async (url: string) => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to fetch score: ${response.statusText}`)
        }

        const musicXML = await response.text()
        await loadScore(musicXML)
      } catch (err) {
        if (mountedRef.current) {
          const error = err instanceof Error ? err : new Error('Failed to load score from URL')
          setState(prev => ({ ...prev, isLoading: false, error }))
          throw error
        }
      }
    },
    [loadScore]
  )

  /**
   * Clear the current score
   */
  const clearScore = useCallback(() => {
    if (osmd) {
      try {
        osmd.clear()
        clearHighlights()
        setState(prev => ({
          ...prev,
          isReady: false,
          totalMeasures: 0,
          currentMeasure: 0,
        }))
      } catch (err) {
        console.error('Error clearing score:', err)
      }
    }
  }, [osmd])

  /**
   * Set zoom level
   */
  const setZoom = useCallback(
    (zoom: number) => {
      if (!osmd) return

      const clampedZoom = Math.max(0.3, Math.min(3.0, zoom))
      osmd.zoom = clampedZoom
      osmd.render()

      setState(prev => ({ ...prev, zoom: clampedZoom }))
    },
    [osmd]
  )

  /**
   * Fit score to container width
   */
  const fitToWidth = useCallback(() => {
    if (!osmd || !containerRef.current) return

    const containerWidth = containerRef.current.clientWidth
    const svgElement = containerRef.current.querySelector('svg')

    if (svgElement) {
      const currentWidth = svgElement.getBoundingClientRect().width
      const newZoom = (containerWidth / currentWidth) * state.zoom * 0.95 // 5% margin
      setZoom(newZoom)
    }
  }, [osmd, containerRef, state.zoom, setZoom])

  /**
   * Fit score to page
   */
  const fitToPage = useCallback(() => {
    if (!osmd || !containerRef.current) return

    const container = containerRef.current
    const svgElement = container.querySelector('svg')

    if (svgElement) {
      const containerRect = container.getBoundingClientRect()
      const svgRect = svgElement.getBoundingClientRect()

      const widthRatio = containerRect.width / svgRect.width
      const heightRatio = containerRect.height / svgRect.height
      const newZoom = Math.min(widthRatio, heightRatio) * state.zoom * 0.9

      setZoom(newZoom)
    }
  }, [osmd, containerRef, state.zoom, setZoom])

  /**
   * Get bounding box for a specific measure
   */
  const getMeasureBounds = useCallback(
    (measure: number): MeasureBounds | null => {
      if (!osmd?.GraphicSheet) return null

      try {
        const graphicalMeasure = osmd.GraphicSheet.findGraphicalMeasure(measure - 1, 0)

        if (!graphicalMeasure) return null

        const pos = graphicalMeasure.PositionAndShape

        return {
          measure,
          x: pos.AbsolutePosition.x * 10, // OSMD uses units of 10
          y: pos.AbsolutePosition.y * 10,
          width: pos.Size.width * 10,
          height: pos.Size.height * 10,
        }
      } catch {
        return null
      }
    },
    [osmd]
  )

  /**
   * Get all measure bounds
   */
  const getAllMeasureBounds = useCallback((): MeasureBounds[] => {
    const bounds: MeasureBounds[] = []

    for (let i = 1; i <= state.totalMeasures; i++) {
      const measureBounds = getMeasureBounds(i)
      if (measureBounds) {
        bounds.push(measureBounds)
      }
    }

    return bounds
  }, [state.totalMeasures, getMeasureBounds])

  /**
   * Scroll to specific measure
   */
  const scrollToMeasure = useCallback(
    (measure: number) => {
      if (!osmd || !containerRef.current) return

      const bounds = getMeasureBounds(measure)
      if (!bounds) return

      const svgElement = containerRef.current.querySelector('svg')
      if (!svgElement) return

      // Calculate scroll position
      const containerRect = containerRef.current.getBoundingClientRect()
      const svgRect = svgElement.getBoundingClientRect()

      // Scale factor between OSMD units and actual pixels
      const scale = svgRect.width / (svgElement.viewBox.baseVal?.width || svgRect.width)

      const measureX = bounds.x * scale
      const targetScroll = measureX - containerRect.width / 2 + (bounds.width * scale) / 2

      containerRef.current.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      })

      setState(prev => ({ ...prev, currentMeasure: measure }))
    },
    [osmd, containerRef, getMeasureBounds]
  )

  // Cursor methods
  const showCursor = useCallback(() => {
    if (osmd?.cursor) {
      osmd.cursor.show()
    }
  }, [osmd])

  const hideCursor = useCallback(() => {
    if (osmd?.cursor) {
      osmd.cursor.hide()
    }
  }, [osmd])

  const cursorToMeasure = useCallback(
    (measure: number) => {
      if (!osmd?.cursor) return

      // Bounds check
      const totalMeasures = osmd.Sheet?.SourceMeasures?.length || 0
      if (measure < 1 || measure > totalMeasures) {
        console.warn(`cursorToMeasure: measure ${measure} out of range (1-${totalMeasures})`)
        return
      }

      osmd.cursor.reset()

      // Move cursor to target measure with safety guards
      const maxIterations = totalMeasures + 10 // Small buffer for safety
      let iterations = 0
      let lastMeasureIndex = -1

      for (let i = 0; i < measure - 1 && iterations < maxIterations; i++) {
        osmd.cursor.next()
        iterations++

        // Check if cursor actually advanced
        const currentIndex = osmd.cursor.iterator.CurrentMeasureIndex
        if (currentIndex === lastMeasureIndex) {
          console.warn('cursorToMeasure: cursor not advancing, breaking to prevent infinite loop')
          break
        }
        lastMeasureIndex = currentIndex

        if (currentIndex >= measure - 1) break
      }

      setState(prev => ({ ...prev, currentMeasure: measure }))
    },
    [osmd]
  )

  const cursorNext = useCallback(() => {
    if (osmd?.cursor) {
      osmd.cursor.next()
      const currentMeasure = (osmd.cursor.iterator.CurrentMeasure?.MeasureNumber || 0) + 1
      setState(prev => ({ ...prev, currentMeasure }))
    }
  }, [osmd])

  const cursorPrevious = useCallback(() => {
    if (osmd?.cursor) {
      osmd.cursor.previous()
      const currentMeasure = (osmd.cursor.iterator.CurrentMeasure?.MeasureNumber || 0) + 1
      setState(prev => ({ ...prev, currentMeasure }))
    }
  }, [osmd])

  /**
   * Create highlight layer in SVG
   */
  const createHighlightLayer = useCallback(() => {
    if (!containerRef.current) return

    const svgElement = containerRef.current.querySelector('svg')
    if (!svgElement) return

    // Remove existing highlight layer
    const existingLayer = svgElement.querySelector('#osmd-highlight-layer')
    if (existingLayer) {
      existingLayer.remove()
    }

    // Create new highlight layer
    const highlightLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    highlightLayer.setAttribute('id', 'osmd-highlight-layer')

    // Insert at the beginning so highlights appear behind notes
    svgElement.insertBefore(highlightLayer, svgElement.firstChild)
    highlightLayerRef.current = highlightLayer
  }, [containerRef])

  /**
   * Highlight specific measures
   */
  const highlightMeasures = useCallback(
    (measures: number[], color: string = 'rgba(37, 99, 235, 0.15)') => {
      if (!highlightLayerRef.current || !osmd?.GraphicSheet) return

      // Clear existing measure highlights
      const existingHighlights = highlightLayerRef.current.querySelectorAll('.measure-highlight')
      existingHighlights.forEach(el => el.remove())

      measures.forEach(measureNum => {
        const bounds = getMeasureBounds(measureNum)
        if (!bounds) return

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('x', String(bounds.x))
        rect.setAttribute('y', String(bounds.y - 20)) // Offset above staff
        rect.setAttribute('width', String(bounds.width))
        rect.setAttribute('height', String(bounds.height + 40)) // Extra height
        rect.setAttribute('fill', color)
        rect.setAttribute('stroke', color.replace(/[\d.]+\)$/, '0.5)'))
        rect.setAttribute('stroke-width', '2')
        rect.setAttribute('rx', '4')
        rect.setAttribute('data-measure', String(measureNum))
        rect.classList.add('measure-highlight')

        highlightLayerRef.current?.appendChild(rect)
      })
    },
    [osmd, getMeasureBounds]
  )

  /**
   * Highlight measure range
   */
  const highlightMeasureRange = useCallback(
    (start: number, end: number, color?: string) => {
      const measures = Array.from({ length: end - start + 1 }, (_, i) => start + i)
      highlightMeasures(measures, color)
    },
    [highlightMeasures]
  )

  /**
   * Highlight specific notes
   */
  const highlightNotes = useCallback(
    (notes: NoteInfo[], color: string = 'rgba(37, 99, 235, 0.3)') => {
      if (!highlightLayerRef.current) return

      // Clear existing note highlights
      const existingHighlights = highlightLayerRef.current.querySelectorAll('.note-highlight')
      existingHighlights.forEach(el => el.remove())

      notes.forEach(note => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('cx', String(note.position.x))
        circle.setAttribute('cy', String(note.position.y))
        circle.setAttribute('r', '8')
        circle.setAttribute('fill', color)
        circle.setAttribute('stroke', color.replace(/[\d.]+\)$/, '0.8)'))
        circle.setAttribute('stroke-width', '2')
        circle.classList.add('note-highlight')

        highlightLayerRef.current?.appendChild(circle)
      })
    },
    []
  )

  /**
   * Clear all highlights
   */
  const clearHighlights = useCallback(() => {
    if (highlightLayerRef.current) {
      highlightLayerRef.current.innerHTML = ''
    }
  }, [])

  /**
   * Apply voice coloring to notes
   */
  const setVoiceColors = useCallback(
    (enabled: boolean, colors: Partial<VoiceColorConfig> = {}) => {
      if (!osmd || !containerRef.current) return

      const mergedColors = { ...DEFAULT_VOICE_COLORS, ...colors }
      const svgElement = containerRef.current.querySelector('svg')
      if (!svgElement) return

      if (enabled && osmd.EngravingRules) {
        osmd.EngravingRules.ColoringMode = 2 // Voice coloring mode
        osmd.EngravingRules.ColoringEnabled = true

        // OSMD uses voice indices starting from 0
        // We need to set colors through CSS or direct DOM manipulation
        // since OSMD's coloring API is limited

        const styleElement = document.createElement('style')
        styleElement.id = 'osmd-voice-colors'
        styleElement.textContent = `
          [data-voice="1"], .voice-1 { fill: ${mergedColors.soprano}; stroke: ${mergedColors.soprano}; }
          [data-voice="2"], .voice-2 { fill: ${mergedColors.alto}; stroke: ${mergedColors.alto}; }
          [data-voice="3"], .voice-3 { fill: ${mergedColors.tenor}; stroke: ${mergedColors.tenor}; }
          [data-voice="4"], .voice-4 { fill: ${mergedColors.bass}; stroke: ${mergedColors.bass}; }
        `

        // Remove existing style
        const existing = document.getElementById('osmd-voice-colors')
        if (existing) existing.remove()

        document.head.appendChild(styleElement)
        osmd.render()
      } else {
        // Reset coloring
        const existing = document.getElementById('osmd-voice-colors')
        if (existing) existing.remove()

        if (osmd.EngravingRules) {
          osmd.EngravingRules.ColoringEnabled = false
        }
        osmd.render()
      }
    },
    [osmd, containerRef]
  )

  /**
   * Get notes at a specific measure
   */
  const getNotesAtMeasure = useCallback(
    (measure: number): NoteInfo[] => {
      if (!osmd?.GraphicSheet) return []

      const notes: NoteInfo[] = []

      try {
        const measureList = osmd.GraphicSheet.MeasureList
        if (!measureList || measure - 1 >= measureList.length) return notes

        const measureRow = measureList[measure - 1]
        if (!measureRow) return notes

        measureRow.forEach(graphicalMeasure => {
          if (!graphicalMeasure?.staffEntries) return

          graphicalMeasure.staffEntries.forEach((staffEntry) => {
            staffEntry.graphicalVoiceEntries?.forEach((voiceEntry) => {
              const voiceId = voiceEntry.parentVoiceEntry?.ParentVoice?.VoiceId || 1

              voiceEntry.notes?.forEach((graphicalNote) => {
                const pos = graphicalNote.PositionAndShape
                const sourceNote = graphicalNote.sourceNote

                notes.push({
                  measure,
                  beat: 1, // Would need more complex calculation
                  voice: voiceId,
                  pitch: sourceNote?.Pitch?.ToString() || '',
                  duration: sourceNote?.Length?.RealValue || 0,
                  position: {
                    x: pos.AbsolutePosition.x * 10,
                    y: pos.AbsolutePosition.y * 10,
                  },
                  width: pos.Size.width * 10,
                  height: pos.Size.height * 10,
                })
              })
            })
          })
        })
      } catch (err) {
        console.error('Error getting notes at measure:', err)
      }

      return notes
    },
    [osmd]
  )

  /**
   * Cleanup
   */
  const destroy = useCallback(() => {
    if (osmd) {
      try {
        osmd.clear()
      } catch (err) {
        console.error('Error destroying OSMD:', err)
      }
    }

    // Remove voice color styles
    const styleElement = document.getElementById('osmd-voice-colors')
    if (styleElement) styleElement.remove()

    setOsmd(null)
    highlightLayerRef.current = null
  }, [osmd])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroy()
    }
  }, [destroy])

  // CRITICAL: Memoize the return object to prevent infinite re-render loops
  return useMemo(() => ({
    osmd,
    state,
    isLoading: state.isLoading,
    isReady: state.isReady,
    error: state.error,

    loadScore,
    loadScoreFromUrl,
    clearScore,

    setZoom,
    fitToWidth,
    fitToPage,

    scrollToMeasure,
    getMeasureBounds,
    getAllMeasureBounds,

    showCursor,
    hideCursor,
    cursorToMeasure,
    cursorNext,
    cursorPrevious,

    highlightMeasures,
    highlightMeasureRange,
    highlightNotes,
    clearHighlights,

    setVoiceColors,

    getNotesAtMeasure,
    destroy,
  }), [
    osmd,
    state,
    loadScore,
    loadScoreFromUrl,
    clearScore,
    setZoom,
    fitToWidth,
    fitToPage,
    scrollToMeasure,
    getMeasureBounds,
    getAllMeasureBounds,
    showCursor,
    hideCursor,
    cursorToMeasure,
    cursorNext,
    cursorPrevious,
    highlightMeasures,
    highlightMeasureRange,
    highlightNotes,
    clearHighlights,
    setVoiceColors,
    getNotesAtMeasure,
    destroy,
  ])
}
