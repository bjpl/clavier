/**
 * Keyboard Synchronization
 * Handles piano keyboard highlighting during playback with voice coloring
 */

import { VoiceName } from '@/types/music'
import { ActiveNoteInfo } from './playback-coordinator'

/**
 * Voice color mapping for keyboard highlights
 */
export const VOICE_COLORS: Record<VoiceName, string> = {
  SOPRANO: '#2563EB', // Blue
  ALTO: '#059669',    // Green
  TENOR: '#D97706',   // Amber
  BASS: '#7C3AED'     // Purple
}

/**
 * Default highlight color when no voice is specified
 */
const DEFAULT_HIGHLIGHT_COLOR = '#3B82F6' // Primary blue

/**
 * Keyboard highlight state for a single note
 */
export interface KeyHighlight {
  /** MIDI note number */
  midiNote: number
  /** Voice color */
  color: string
  /** Voice name */
  voice?: VoiceName
  /** Note velocity (affects opacity) */
  velocity: number
  /** Timestamp when highlight started */
  startTime: number
}

/**
 * Configuration for keyboard synchronization
 */
export interface KeyboardSyncConfig {
  /** Whether to use voice colors */
  voiceColors: boolean
  /** Velocity affects opacity */
  velocityOpacity: boolean
  /** Fade out duration after note off (ms) */
  fadeOutDuration: number
  /** Minimum opacity for highlights */
  minOpacity: number
  /** Maximum opacity for highlights */
  maxOpacity: number
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: KeyboardSyncConfig = {
  voiceColors: true,
  velocityOpacity: true,
  fadeOutDuration: 150,
  minOpacity: 0.4,
  maxOpacity: 0.9
}

/**
 * Keyboard synchronization manager
 */
export class KeyboardSync {
  private config: KeyboardSyncConfig
  private activeHighlights = new Map<number, KeyHighlight>()
  private fadingHighlights = new Map<number, number>() // midiNote -> fadeStartTime
  private animationFrameId: number | null = null

  constructor(config: Partial<KeyboardSyncConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Add note highlight
   */
  addNoteHighlight(note: ActiveNoteInfo): void {
    // Remove from fading if present
    this.fadingHighlights.delete(note.midiNote)

    // Determine color based on voice
    const color = this.getColorForNote(note)

    const highlight: KeyHighlight = {
      midiNote: note.midiNote,
      color,
      voice: note.voice,
      velocity: note.velocity,
      startTime: note.startTime
    }

    this.activeHighlights.set(note.midiNote, highlight)
    this.startFadeAnimation()
  }

  /**
   * Remove note highlight with fade out
   */
  removeNoteHighlight(midiNote: number): void {
    if (this.activeHighlights.has(midiNote)) {
      this.fadingHighlights.set(midiNote, performance.now())
      this.startFadeAnimation()
    }
  }

  /**
   * Clear all highlights immediately
   */
  clearAllHighlights(): void {
    this.activeHighlights.clear()
    this.fadingHighlights.clear()
    this.stopFadeAnimation()
  }

  /**
   * Get all current highlights
   */
  getHighlights(): KeyHighlight[] {
    return Array.from(this.activeHighlights.values())
  }

  /**
   * Get highlight for specific note (with fade calculation)
   */
  getHighlightForNote(midiNote: number): KeyHighlight | null {
    const highlight = this.activeHighlights.get(midiNote)
    if (!highlight) return null

    // Check if fading
    const fadeStartTime = this.fadingHighlights.get(midiNote)
    if (fadeStartTime) {
      const elapsed = performance.now() - fadeStartTime
      if (elapsed >= this.config.fadeOutDuration) {
        // Fade complete, remove highlight
        this.activeHighlights.delete(midiNote)
        this.fadingHighlights.delete(midiNote)
        return null
      }
    }

    return highlight
  }

  /**
   * Calculate opacity for a highlight
   */
  getOpacityForHighlight(highlight: KeyHighlight): number {
    let opacity = this.config.maxOpacity

    // Apply velocity-based opacity
    if (this.config.velocityOpacity) {
      const velocityFactor = highlight.velocity / 127
      opacity = this.config.minOpacity +
        (this.config.maxOpacity - this.config.minOpacity) * velocityFactor
    }

    // Apply fade-out if fading
    const fadeStartTime = this.fadingHighlights.get(highlight.midiNote)
    if (fadeStartTime) {
      const elapsed = performance.now() - fadeStartTime
      const fadeProgress = elapsed / this.config.fadeOutDuration
      opacity *= 1 - fadeProgress
    }

    return Math.max(0, Math.min(1, opacity))
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<KeyboardSyncConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  getConfig(): KeyboardSyncConfig {
    return { ...this.config }
  }

  /**
   * Get color for note based on voice
   */
  private getColorForNote(note: ActiveNoteInfo): string {
    if (this.config.voiceColors && note.voice) {
      return VOICE_COLORS[note.voice]
    }
    return DEFAULT_HIGHLIGHT_COLOR
  }

  /**
   * Start fade animation loop
   */
  private startFadeAnimation(): void {
    if (this.animationFrameId !== null) return

    const animate = (): void => {
      let stillFading = false

      // Check all fading highlights
      this.fadingHighlights.forEach((fadeStartTime, midiNote) => {
        const elapsed = performance.now() - fadeStartTime

        if (elapsed >= this.config.fadeOutDuration) {
          // Fade complete
          this.activeHighlights.delete(midiNote)
          this.fadingHighlights.delete(midiNote)
        } else {
          stillFading = true
        }
      })

      // Continue animation if still fading
      if (stillFading) {
        this.animationFrameId = requestAnimationFrame(animate)
      } else {
        this.animationFrameId = null
      }
    }

    this.animationFrameId = requestAnimationFrame(animate)
  }

  /**
   * Stop fade animation
   */
  private stopFadeAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopFadeAnimation()
    this.activeHighlights.clear()
    this.fadingHighlights.clear()
  }
}
