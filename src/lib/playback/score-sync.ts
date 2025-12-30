/**
 * Score Synchronization
 * Handles score cursor updates, measure highlighting, and auto-scrolling
 * during playback
 */

import { CursorPosition } from './playback-coordinator'

/**
 * Score viewport information for auto-scroll calculations
 */
export interface ScoreViewport {
  /** Visible height in pixels */
  height: number
  /** Current scroll position */
  scrollTop: number
  /** Total scrollable height */
  scrollHeight: number
}

/**
 * Configuration for score synchronization
 */
export interface ScoreSyncConfig {
  /** Auto-scroll behavior */
  autoScroll: boolean
  /** Smooth scroll animation duration (ms) */
  scrollDuration: number
  /** Lead time before auto-scroll (measures) */
  scrollLeadMeasures: number
  /** Whether to highlight current measure */
  highlightMeasure: boolean
  /** Zoom level for auto-adjust */
  autoAdjustZoom: boolean
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ScoreSyncConfig = {
  autoScroll: true,
  scrollDuration: 300,
  scrollLeadMeasures: 1,
  highlightMeasure: true,
  autoAdjustZoom: false
}

/**
 * Score synchronization manager
 */
export class ScoreSync {
  private config: ScoreSyncConfig
  private currentMeasure = 1
  private scrollTarget: HTMLElement | null = null
  private measureElements = new Map<number, HTMLElement>()
  private scrollAnimationId: number | null = null

  constructor(config: Partial<ScoreSyncConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Get current measure position
   */
  get measure(): number {
    return this.currentMeasure
  }

  /**
   * Set the scroll container element
   */
  setScrollContainer(element: HTMLElement | null): void {
    this.scrollTarget = element
  }

  /**
   * Register measure elements for auto-scroll
   * Should be called after score is rendered
   */
  registerMeasureElements(elements: Map<number, HTMLElement>): void {
    this.measureElements = elements
  }

  /**
   * Update cursor position based on playback
   */
  updateCursor(position: CursorPosition): void {
    this.currentMeasure = position.measure

    if (this.config.autoScroll) {
      this.scrollToMeasure(position.measure)
    }
  }

  /**
   * Scroll to specific measure with smooth animation
   */
  scrollToMeasure(measure: number): void {
    if (!this.scrollTarget || !this.measureElements.has(measure)) {
      return
    }

    const measureElement = this.measureElements.get(measure)
    if (!measureElement) return

    // Calculate scroll position
    const containerRect = this.scrollTarget.getBoundingClientRect()
    const measureRect = measureElement.getBoundingClientRect()
    const scrollOffset = this.scrollTarget.scrollTop

    // Calculate target scroll position
    // Center the measure in the viewport, accounting for lead time
    const targetScroll =
      scrollOffset +
      measureRect.top -
      containerRect.top -
      containerRect.height / 2 +
      measureRect.height / 2

    // Perform smooth scroll
    this.smoothScrollTo(targetScroll)
  }

  /**
   * Smooth scroll animation
   */
  private smoothScrollTo(targetPosition: number): void {
    if (!this.scrollTarget) return

    // Cancel any ongoing animation
    if (this.scrollAnimationId !== null) {
      cancelAnimationFrame(this.scrollAnimationId)
    }

    const startPosition = this.scrollTarget.scrollTop
    const distance = targetPosition - startPosition
    const startTime = performance.now()

    const animate = (currentTime: number): void => {
      if (!this.scrollTarget) return

      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / this.config.scrollDuration, 1)

      // Ease-out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      this.scrollTarget.scrollTop = startPosition + distance * easedProgress

      if (progress < 1) {
        this.scrollAnimationId = requestAnimationFrame(animate)
      } else {
        this.scrollAnimationId = null
      }
    }

    this.scrollAnimationId = requestAnimationFrame(animate)
  }

  /**
   * Get measure elements in viewport
   */
  getVisibleMeasures(): number[] {
    if (!this.scrollTarget) return []

    const containerRect = this.scrollTarget.getBoundingClientRect()
    const visibleMeasures: number[] = []

    this.measureElements.forEach((element, measureNumber) => {
      const rect = element.getBoundingClientRect()

      // Check if measure is in viewport
      if (
        rect.bottom >= containerRect.top &&
        rect.top <= containerRect.bottom
      ) {
        visibleMeasures.push(measureNumber)
      }
    })

    return visibleMeasures.sort((a, b) => a - b)
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ScoreSyncConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  getConfig(): ScoreSyncConfig {
    return { ...this.config }
  }

  /**
   * Highlight specific measures (for loop region)
   */
  highlightMeasures(measures: number[]): void {
    // Clear existing highlights
    this.measureElements.forEach((element, measure) => {
      if (!measures.includes(measure)) {
        element.classList.remove('measure-highlighted')
        element.style.backgroundColor = ''
      }
    })

    // Add highlights
    measures.forEach(measure => {
      const element = this.measureElements.get(measure)
      if (element) {
        element.classList.add('measure-highlighted')
        element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)' // Blue highlight
      }
    })
  }

  /**
   * Clear all measure highlights
   */
  clearHighlights(): void {
    this.measureElements.forEach(element => {
      element.classList.remove('measure-highlighted')
      element.style.backgroundColor = ''
    })
  }

  /**
   * Adjust zoom level based on content
   */
  adjustZoom(viewport: ScoreViewport): number {
    if (!this.config.autoAdjustZoom) return 1.0

    // Calculate optimal zoom to fit content
    // This is a simplified implementation
    const contentHeight = viewport.scrollHeight
    const viewportHeight = viewport.height

    if (contentHeight > viewportHeight * 1.5) {
      return 0.8 // Zoom out
    } else if (contentHeight < viewportHeight * 0.7) {
      return 1.2 // Zoom in
    }

    return 1.0
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.scrollAnimationId !== null) {
      cancelAnimationFrame(this.scrollAnimationId)
      this.scrollAnimationId = null
    }

    this.measureElements.clear()
    this.scrollTarget = null
  }
}
