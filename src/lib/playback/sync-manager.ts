/**
 * Sync Manager
 * Central synchronization manager that bridges MIDI playback, score display,
 * and keyboard visualization into a unified system.
 *
 * This manager:
 * - Connects MIDI player events to the playback coordinator
 * - Maps MIDI time/ticks to measure numbers with tempo support
 * - Provides smooth cursor animation between beats
 * - Handles seeking from score clicks to audio position
 * - Manages tempo changes mid-piece
 */

import { MIDIPlayer } from '@/lib/audio/midi-player'
import { MIDIData, NoteEvent, TempoEvent } from '@/lib/audio/types'
import { PlaybackCoordinator, getPlaybackCoordinator } from './playback-coordinator'
import { UseScoreRendererReturn } from '@/hooks/use-score-renderer'

/**
 * Time mapping entry for measure positions
 */
export interface MeasureTimeMap {
  /** Measure number (1-indexed) */
  measure: number
  /** Start time in seconds */
  startTime: number
  /** End time in seconds */
  endTime: number
  /** Tempo at this measure (BPM) */
  tempo: number
  /** Beats in this measure */
  beatsPerMeasure: number
  /** Beat duration in seconds */
  beatDuration: number
}

/**
 * Beat position information
 */
export interface BeatPosition {
  measure: number
  beat: number
  /** Progress within the beat (0-1) */
  beatProgress: number
  /** Absolute time in seconds */
  time: number
}

/**
 * Sync manager configuration
 */
export interface SyncManagerConfig {
  /** Update interval for position tracking (ms) */
  positionUpdateInterval: number
  /** Enable smooth cursor animation */
  smoothCursor: boolean
  /** Cursor lookahead time (seconds) - for scroll preparation */
  cursorLookahead: number
  /** Auto-scroll to current measure */
  autoScroll: boolean
  /** Scroll behavior */
  scrollBehavior: 'smooth' | 'instant' | 'center'
}

const DEFAULT_CONFIG: SyncManagerConfig = {
  positionUpdateInterval: 16, // ~60fps
  smoothCursor: true,
  cursorLookahead: 0.5,
  autoScroll: true,
  scrollBehavior: 'smooth'
}

/**
 * Sync Manager - bridges audio playback with visual score representation
 */
export class SyncManager {
  private config: SyncManagerConfig
  private player: MIDIPlayer | null = null
  private coordinator: PlaybackCoordinator
  private scoreRenderer: UseScoreRendererReturn | null = null

  // Timing state
  private measureTimeMap: MeasureTimeMap[] = []
  private baseTempo = 120
  private beatsPerMeasure = 4
  private tempoChanges: Array<{ time: number; tempo: number }> = []

  // Position tracking
  private positionUpdateId: number | null = null
  private lastMeasure = 0
  private lastBeat = 0

  // Animation state
  private animationFrameId: number | null = null

  constructor(config: Partial<SyncManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.coordinator = getPlaybackCoordinator()
  }

  /**
   * Connect to MIDI player
   */
  connectPlayer(player: MIDIPlayer): void {
    this.player = player
    this.setupPlayerCallbacks()

    // Build time map if MIDI is already loaded
    const midiData = player.getMIDIData()
    if (midiData) {
      this.buildTimeMap(midiData)
    }
  }

  /**
   * Connect to score renderer
   */
  connectScoreRenderer(renderer: UseScoreRendererReturn): void {
    this.scoreRenderer = renderer
  }

  /**
   * Disconnect from MIDI player
   */
  disconnectPlayer(): void {
    this.stopPositionTracking()
    this.player = null
  }

  /**
   * Disconnect from score renderer
   */
  disconnectScoreRenderer(): void {
    this.scoreRenderer = null
  }

  /**
   * Load MIDI data and build timing maps
   */
  loadMIDI(data: MIDIData): void {
    this.buildTimeMap(data)
    this.coordinator.initialize(data.timeSignature.numerator)
  }

  /**
   * Build measure-to-time mapping from MIDI data
   */
  private buildTimeMap(data: MIDIData): void {
    this.baseTempo = data.tempo
    this.beatsPerMeasure = data.timeSignature.numerator
    this.measureTimeMap = []
    this.tempoChanges = []

    // Extract tempo changes from events
    const tempoEvents = data.events.filter(
      (e): e is TempoEvent => e.type === 'tempo'
    )

    tempoEvents.forEach(event => {
      this.tempoChanges.push({
        time: event.time,
        tempo: event.data.bpm
      })
    })

    // Sort tempo changes by time
    this.tempoChanges.sort((a, b) => a.time - b.time)

    // Build measure map
    let currentTime = 0
    let currentTempo = this.baseTempo

    for (let measure = 1; measure <= data.measures; measure++) {
      // Check for tempo changes before this measure
      const tempoChange = this.tempoChanges.find(
        tc => tc.time >= currentTime && tc.time < currentTime + this.getMeasureDuration(currentTempo)
      )

      if (tempoChange) {
        currentTempo = tempoChange.tempo
      }

      const beatDuration = 60 / currentTempo
      const measureDuration = beatDuration * this.beatsPerMeasure

      this.measureTimeMap.push({
        measure,
        startTime: currentTime,
        endTime: currentTime + measureDuration,
        tempo: currentTempo,
        beatsPerMeasure: this.beatsPerMeasure,
        beatDuration
      })

      currentTime += measureDuration
    }
  }

  /**
   * Get measure duration at a given tempo
   */
  private getMeasureDuration(tempo: number): number {
    const beatDuration = 60 / tempo
    return beatDuration * this.beatsPerMeasure
  }

  /**
   * Setup callbacks from MIDI player
   */
  private setupPlayerCallbacks(): void {
    if (!this.player) return

    // Note on callback - forward to coordinator
    this.player.onNoteOn((note: NoteEvent) => {
      this.coordinator.handleNoteOn(note)
    })

    // Note off callback - forward to coordinator
    this.player.onNoteOff((note: NoteEvent) => {
      this.coordinator.handleNoteOff(note.midiNote)
    })

    // Measure change callback
    this.player.onMeasureChange((measure: number) => {
      this.handleMeasureChange(measure)
    })

    // Beat change callback
    this.player.onBeatChange((beat: number) => {
      const currentMeasure = this.player?.position.measure || 1
      this.handleBeatChange(currentMeasure, beat)
    })

    // Playback start
    this.player.onPlaybackStart(() => {
      this.coordinator.startPlayback()
      this.startPositionTracking()
    })

    // Playback pause
    this.player.onPlaybackPause(() => {
      this.coordinator.pausePlayback()
      this.stopPositionTracking()
    })

    // Playback end
    this.player.onPlaybackEnd(() => {
      this.coordinator.stopPlayback()
      this.stopPositionTracking()
    })
  }

  /**
   * Handle measure change
   */
  private handleMeasureChange(measure: number): void {
    if (measure !== this.lastMeasure) {
      this.lastMeasure = measure
      this.coordinator.handleMeasureChange(measure)

      // Update score cursor
      if (this.scoreRenderer && this.config.autoScroll) {
        this.updateScoreCursor(measure)
      }
    }
  }

  /**
   * Handle beat change
   */
  private handleBeatChange(measure: number, beat: number): void {
    if (beat !== this.lastBeat || measure !== this.lastMeasure) {
      this.lastBeat = beat
      this.lastMeasure = measure
      this.coordinator.handleBeatTick(measure, beat)
    }
  }

  /**
   * Start high-frequency position tracking for smooth cursor
   */
  private startPositionTracking(): void {
    this.stopPositionTracking()

    if (this.config.smoothCursor) {
      this.startSmoothCursorAnimation()
    } else {
      this.positionUpdateId = window.setInterval(() => {
        this.updatePosition()
      }, this.config.positionUpdateInterval)
    }
  }

  /**
   * Stop position tracking
   */
  private stopPositionTracking(): void {
    if (this.positionUpdateId !== null) {
      clearInterval(this.positionUpdateId)
      this.positionUpdateId = null
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * Start smooth cursor animation using requestAnimationFrame
   */
  private startSmoothCursorAnimation(): void {
    const animate = (): void => {
      if (!this.player || this.player.state !== 'playing') {
        this.animationFrameId = null
        return
      }

      this.updatePosition()
      this.animationFrameId = requestAnimationFrame(animate)
    }

    this.animationFrameId = requestAnimationFrame(animate)
  }

  /**
   * Update current position and notify coordinator
   */
  private updatePosition(): void {
    if (!this.player) return

    const currentTime = this.player.currentTimeSeconds
    const position = this.timeToPosition(currentTime)

    // Update coordinator with smooth progress
    this.coordinator.setCursorPosition({
      measure: position.measure,
      beat: position.beat,
      beatProgress: position.beatProgress
    })

    // Check for measure change
    if (position.measure !== this.lastMeasure) {
      this.handleMeasureChange(position.measure)
    }

    // Check for beat change
    const beatInt = Math.floor(position.beat)
    if (beatInt !== this.lastBeat) {
      this.handleBeatChange(position.measure, beatInt)
    }
  }

  /**
   * Convert time in seconds to measure/beat position
   */
  timeToPosition(timeSeconds: number): BeatPosition {
    // Find the measure containing this time
    const measureInfo = this.measureTimeMap.find(
      m => timeSeconds >= m.startTime && timeSeconds < m.endTime
    )

    if (!measureInfo) {
      // Before first measure or after last
      if (timeSeconds < 0 || this.measureTimeMap.length === 0) {
        return { measure: 1, beat: 1, beatProgress: 0, time: timeSeconds }
      }

      // After last measure - return last measure
      const lastMeasure = this.measureTimeMap[this.measureTimeMap.length - 1]
      return {
        measure: lastMeasure.measure,
        beat: lastMeasure.beatsPerMeasure,
        beatProgress: 1,
        time: timeSeconds
      }
    }

    // Calculate beat position within measure
    const timeInMeasure = timeSeconds - measureInfo.startTime
    const totalBeats = timeInMeasure / measureInfo.beatDuration
    const beat = Math.floor(totalBeats) + 1 // 1-indexed
    const beatProgress = totalBeats - Math.floor(totalBeats)

    return {
      measure: measureInfo.measure,
      beat: Math.min(beat, measureInfo.beatsPerMeasure),
      beatProgress,
      time: timeSeconds
    }
  }

  /**
   * Convert measure/beat position to time in seconds
   */
  positionToTime(measure: number, beat: number = 1, beatProgress: number = 0): number {
    const measureInfo = this.measureTimeMap.find(m => m.measure === measure)

    if (!measureInfo) {
      // Clamp to valid range
      if (measure < 1) return 0
      if (this.measureTimeMap.length === 0) return 0

      const lastMeasure = this.measureTimeMap[this.measureTimeMap.length - 1]
      if (measure > lastMeasure.measure) {
        return lastMeasure.endTime
      }
      return 0
    }

    const beatOffset = (beat - 1 + beatProgress) * measureInfo.beatDuration
    return measureInfo.startTime + beatOffset
  }

  /**
   * Seek to specific measure (called from score click)
   */
  seekToMeasure(measure: number, beat: number = 1): void {
    if (!this.player) {
      console.warn('SyncManager: No player connected')
      return
    }

    this.player.seekToMeasure(measure, beat)

    // Update coordinator immediately for responsive UI
    this.coordinator.setCursorPosition({
      measure,
      beat,
      beatProgress: 0
    })

    // Update score cursor
    if (this.scoreRenderer) {
      this.updateScoreCursor(measure)
    }
  }

  /**
   * Seek to specific time
   */
  seekToTime(timeSeconds: number): void {
    if (!this.player) {
      console.warn('SyncManager: No player connected')
      return
    }

    this.player.seekToTime(timeSeconds)

    // Calculate and update position
    const position = this.timeToPosition(timeSeconds)
    this.coordinator.setCursorPosition({
      measure: position.measure,
      beat: position.beat,
      beatProgress: position.beatProgress
    })

    if (this.scoreRenderer) {
      this.updateScoreCursor(position.measure)
    }
  }

  /**
   * Update score cursor position
   */
  private updateScoreCursor(measure: number): void {
    if (!this.scoreRenderer) return

    try {
      // Move OSMD cursor to measure
      this.scoreRenderer.cursorToMeasure(measure)

      // Auto-scroll to keep cursor visible
      if (this.config.autoScroll) {
        this.scoreRenderer.scrollToMeasure(measure)
      }

      // Highlight current measure
      this.scoreRenderer.highlightMeasures([measure], 'rgba(59, 130, 246, 0.15)')
    } catch (error) {
      console.error('Error updating score cursor:', error)
    }
  }

  /**
   * Get current position
   */
  getCurrentPosition(): BeatPosition | null {
    if (!this.player) return null

    const time = this.player.currentTimeSeconds
    return this.timeToPosition(time)
  }

  /**
   * Get measure info at specific measure number
   */
  getMeasureInfo(measure: number): MeasureTimeMap | null {
    return this.measureTimeMap.find(m => m.measure === measure) || null
  }

  /**
   * Get total measures
   */
  getTotalMeasures(): number {
    return this.measureTimeMap.length
  }

  /**
   * Get tempo at specific time
   */
  getTempoAtTime(timeSeconds: number): number {
    const position = this.timeToPosition(timeSeconds)
    const measureInfo = this.getMeasureInfo(position.measure)
    return measureInfo?.tempo || this.baseTempo
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SyncManagerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  getConfig(): SyncManagerConfig {
    return { ...this.config }
  }

  /**
   * Get coordinator instance
   */
  getCoordinator(): PlaybackCoordinator {
    return this.coordinator
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopPositionTracking()
    this.disconnectPlayer()
    this.disconnectScoreRenderer()
    this.measureTimeMap = []
    this.tempoChanges = []
  }
}

/**
 * Global singleton instance
 */
let syncManagerInstance: SyncManager | null = null

/**
 * Get or create the global sync manager instance
 */
export function getSyncManager(config?: Partial<SyncManagerConfig>): SyncManager {
  if (!syncManagerInstance) {
    syncManagerInstance = new SyncManager(config)
  }
  return syncManagerInstance
}

/**
 * Reset the global sync manager (for testing or cleanup)
 */
export function resetSyncManager(): void {
  if (syncManagerInstance) {
    syncManagerInstance.dispose()
    syncManagerInstance = null
  }
}
