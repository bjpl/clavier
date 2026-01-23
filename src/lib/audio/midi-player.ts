/**
 * MIDI Player
 * Controls playback of MIDI data with tempo, looping, and event callbacks
 *
 * Features:
 * - Precise event scheduling with Tone.js Transport
 * - Tempo control with multiplier
 * - Loop region support
 * - Measure and beat tracking
 * - Note on/off callbacks for visualization
 */

import * as Tone from 'tone'
import { AudioEngine } from './audio-engine'
import {
  MIDIData,
  MIDIEvent,
  NoteMIDIEvent,
  NoteEvent,
  MeasureBeat,
  PlaybackCallbacks,
  LoopRegion,
  PlaybackState
} from './types'

/**
 * Extended note event with voice information
 */
export interface ExtendedNoteEvent extends NoteEvent {
  voice?: string
  eventId?: number
}

/**
 * MIDI player configuration
 */
export interface MIDIPlayerConfig {
  /** Lookahead time for scheduling (seconds) */
  lookahead?: number
  /** Position update interval (ms) */
  updateInterval?: number
  /** Auto-stop after playback ends */
  autoStop?: boolean
}

const DEFAULT_CONFIG: MIDIPlayerConfig = {
  lookahead: 0.1,
  updateInterval: 50,
  autoStop: true
}

/**
 * MIDI playback controller with transport synchronization
 */
export class MIDIPlayer {
  private engine: AudioEngine
  private config: MIDIPlayerConfig
  private events: MIDIEvent[] = []
  private midiData: MIDIData | null = null
  private playbackState: PlaybackState = 'stopped'
  private callbacks: PlaybackCallbacks = {}
  private scheduledEventIds: number[] = []
  private loopRegion: LoopRegion | null = null
  private tempoMultiplier = 1.0
  private baseTempo = 120
  private currentMeasure = 1
  private currentBeat = 1
  private updateIntervalId: number | null = null
  private activeNotes = new Map<number, ExtendedNoteEvent>()
  private startPosition = 0 // Starting position in seconds when play was called
  private pausePosition = 0 // Position when paused
  private boundHandleLoopEvent: (() => void) | null = null // Bound handler for loop events

  constructor(engine: AudioEngine, config?: Partial<MIDIPlayerConfig>) {
    this.engine = engine
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.setupTransport()
  }

  /**
   * Setup transport with initial configuration
   */
  private setupTransport(): void {
    // Configure transport
    Tone.Transport.bpm.value = this.baseTempo
  }

  /**
   * Load MIDI data for playback
   */
  loadMIDI(data: MIDIData): void {
    this.stop()
    this.midiData = data
    this.events = [...data.events].sort((a, b) => a.time - b.time)
    this.baseTempo = data.tempo

    // Apply tempo multiplier
    this.updateEffectiveTempo()

    // Reset position
    this.currentMeasure = 1
    this.currentBeat = 1
    this.pausePosition = 0
    this.startPosition = 0

    console.log(`Loaded MIDI: ${data.name || 'Untitled'}, ${data.measures} measures, ${this.events.length} events, ${data.tempo} BPM`)
  }

  /**
   * Get loaded MIDI data
   */
  getMIDIData(): MIDIData | null {
    return this.midiData
  }

  /**
   * Start or resume playback
   */
  play(): void {
    if (!this.midiData || !this.engine.isReady) {
      console.warn('Cannot play: MIDI not loaded or audio engine not ready')
      return
    }

    if (this.playbackState === 'playing') {
      console.log('Already playing')
      return
    }

    // Ensure audio context is running
    this.engine.resume()

    // Clear any previously scheduled events
    this.cancelScheduledEvents()

    // Determine start position
    if (this.playbackState === 'paused') {
      // Resume from pause position
      this.startPosition = this.pausePosition
    } else {
      // Start from beginning or current seek position
      this.startPosition = this.pausePosition
    }

    // Schedule events from current position
    this.scheduleEventsFrom(this.startPosition)

    // Set transport position and start
    Tone.Transport.seconds = this.startPosition
    Tone.Transport.start()

    this.playbackState = 'playing'
    this.startPositionUpdates()
    this.callbacks.onPlaybackStart?.()

    console.log(`Playback started from ${this.startPosition.toFixed(2)}s`)
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (this.playbackState !== 'playing') return

    // Save current position
    this.pausePosition = Tone.Transport.seconds

    // Pause transport
    Tone.Transport.pause()

    // Cancel scheduled events
    this.cancelScheduledEvents()

    // Stop currently playing notes
    this.releaseAllActiveNotes()

    this.playbackState = 'paused'
    this.stopPositionUpdates()
    this.callbacks.onPlaybackPause?.()

    console.log(`Playback paused at ${this.pausePosition.toFixed(2)}s`)
  }

  /**
   * Stop playback and return to start
   */
  stop(): void {
    // Stop transport
    Tone.Transport.stop()
    Tone.Transport.seconds = 0

    // Cancel all scheduled events
    this.cancelScheduledEvents()

    // Stop all playing notes
    this.releaseAllActiveNotes()
    this.engine.stopAllNotes()

    // Reset state
    this.playbackState = 'stopped'
    this.currentMeasure = 1
    this.currentBeat = 1
    this.pausePosition = 0
    this.startPosition = 0
    this.stopPositionUpdates()

    console.log('Playback stopped')
  }

  /**
   * Seek to a specific measure and beat
   */
  seekToMeasure(measure: number, beat = 1): void {
    if (!this.midiData) return

    const wasPlaying = this.playbackState === 'playing'

    // Pause if playing
    if (wasPlaying) {
      Tone.Transport.pause()
      this.cancelScheduledEvents()
      this.releaseAllActiveNotes()
    }

    // Calculate time position from measure and beat
    const timePosition = this.measureBeatToTime({ measure, beat })

    // Update state
    this.pausePosition = timePosition
    this.currentMeasure = measure
    this.currentBeat = beat

    // Update transport position
    Tone.Transport.seconds = timePosition

    // Notify listeners
    this.callbacks.onMeasureChange?.(measure)
    this.callbacks.onBeatChange?.(beat)

    // Resume if was playing
    if (wasPlaying) {
      this.startPosition = timePosition
      this.scheduleEventsFrom(timePosition)
      Tone.Transport.start()
      this.playbackState = 'playing'
    }

    console.log(`Seeked to measure ${measure}, beat ${beat} (${timePosition.toFixed(2)}s)`)
  }

  /**
   * Seek to a specific time in seconds
   */
  seekToTime(timeSeconds: number): void {
    if (!this.midiData) return

    const { measure, beat } = this.timeToMeasureBeat(timeSeconds)
    this.seekToMeasure(measure, beat)
  }

  /**
   * Set base tempo (BPM)
   */
  setTempo(bpm: number): void {
    this.baseTempo = Math.max(20, Math.min(300, bpm))
    this.updateEffectiveTempo()
  }

  /**
   * Set tempo multiplier for practice (0.25 = quarter speed, 2.0 = double speed)
   */
  setTempoMultiplier(multiplier: number): void {
    this.tempoMultiplier = Math.max(0.25, Math.min(2.0, multiplier))
    this.updateEffectiveTempo()
  }

  /**
   * Get current tempo multiplier
   */
  getTempoMultiplier(): number {
    return this.tempoMultiplier
  }

  /**
   * Get effective tempo (base * multiplier)
   */
  getEffectiveTempo(): number {
    return this.baseTempo * this.tempoMultiplier
  }

  /**
   * Update transport BPM based on base tempo and multiplier
   */
  private updateEffectiveTempo(): void {
    const effectiveTempo = this.baseTempo * this.tempoMultiplier
    Tone.Transport.bpm.value = effectiveTempo
  }

  /**
   * Set loop region
   */
  setLoop(start: MeasureBeat, end: MeasureBeat): void {
    if (!this.midiData) return

    const startTime = this.measureBeatToTime(start)
    const endTime = this.measureBeatToTime(end)

    this.loopRegion = {
      start,
      end,
      enabled: true
    }

    // Configure Tone.js transport loop
    Tone.Transport.loopStart = startTime
    Tone.Transport.loopEnd = endTime
    Tone.Transport.loop = true

    // Remove existing loop handler if present
    if (this.boundHandleLoopEvent) {
      Tone.Transport.off('loop', this.boundHandleLoopEvent)
    }

    // Create and store bound handler for loop event
    this.boundHandleLoopEvent = () => this.handleLoopEvent(startTime, endTime)
    Tone.Transport.on('loop', this.boundHandleLoopEvent)

    console.log(`Loop set: M${start.measure}:B${start.beat || 1} to M${end.measure}:B${end.beat || 1}`)
  }

  /**
   * Handle transport loop event - reschedule events when loop restarts
   */
  private handleLoopEvent(loopStart: number, loopEnd: number): void {
    if (this.playbackState !== 'playing' || !this.midiData) return

    // Release any notes that were still active at loop boundary
    this.releaseAllActiveNotes()

    // Cancel all previously scheduled events
    this.cancelScheduledEvents()

    // Reschedule events within the loop region
    this.scheduleEventsInRange(loopStart, loopEnd)

    console.log(`Loop restarted: rescheduled events from ${loopStart.toFixed(2)}s to ${loopEnd.toFixed(2)}s`)
  }

  /**
   * Schedule MIDI events within a specific time range (for loop playback)
   */
  private scheduleEventsInRange(startTime: number, endTime: number): void {
    if (!this.midiData) return

    const transport = Tone.Transport

    // Filter and schedule events within the time range
    this.events.forEach((event, index) => {
      if (event.time < startTime || event.time >= endTime) return

      if (event.type === 'noteOn') {
        const noteEvent = event as NoteMIDIEvent

        // Find corresponding noteOff to calculate duration
        const noteOffEvent = this.findNoteOff(noteEvent, index)
        let duration = noteOffEvent
          ? noteOffEvent.time - event.time
          : 0.5 // Default duration if no noteOff found

        // Clamp duration to not exceed loop end
        if (event.time + duration > endTime) {
          duration = endTime - event.time
        }

        // Schedule note
        const eventId = transport.schedule((time) => {
          this.triggerNoteOn(noteEvent.data.midiNote, noteEvent.data.velocity, duration, time)
        }, event.time)

        this.scheduledEventIds.push(eventId as unknown as number)

        // Schedule noteOff callback (for visualization) - only if within loop range
        if (noteOffEvent && noteOffEvent.time <= endTime) {
          const offEventId = transport.schedule((time) => {
            this.triggerNoteOff(noteEvent.data.midiNote, time)
          }, noteOffEvent.time)

          this.scheduledEventIds.push(offEventId as unknown as number)
        } else if (event.time + duration <= endTime) {
          // Schedule noteOff at the calculated duration end if no noteOff event
          const offEventId = transport.schedule((time) => {
            this.triggerNoteOff(noteEvent.data.midiNote, time)
          }, event.time + duration)

          this.scheduledEventIds.push(offEventId as unknown as number)
        }
      }
    })
  }

  /**
   * Clear loop region
   */
  clearLoop(): void {
    // Remove loop event listener
    if (this.boundHandleLoopEvent) {
      Tone.Transport.off('loop', this.boundHandleLoopEvent)
      this.boundHandleLoopEvent = null
    }

    this.loopRegion = null
    Tone.Transport.loop = false
    console.log('Loop cleared')
  }

  /**
   * Get current loop region
   */
  getLoopRegion(): LoopRegion | null {
    return this.loopRegion
  }

  /**
   * Check if looping is enabled
   */
  get isLooping(): boolean {
    return this.loopRegion?.enabled ?? false
  }

  // ===== Callback Registration =====

  onNoteOn(callback: (note: NoteEvent) => void): void {
    this.callbacks.onNoteOn = callback
  }

  onNoteOff(callback: (note: NoteEvent) => void): void {
    this.callbacks.onNoteOff = callback
  }

  onMeasureChange(callback: (measure: number) => void): void {
    this.callbacks.onMeasureChange = callback
  }

  onBeatChange(callback: (beat: number) => void): void {
    this.callbacks.onBeatChange = callback
  }

  onPlaybackEnd(callback: () => void): void {
    this.callbacks.onPlaybackEnd = callback
  }

  onPlaybackStart(callback: () => void): void {
    this.callbacks.onPlaybackStart = callback
  }

  onPlaybackPause(callback: () => void): void {
    this.callbacks.onPlaybackPause = callback
  }

  // ===== State Getters =====

  get state(): PlaybackState {
    return this.playbackState
  }

  get position(): MeasureBeat {
    return {
      measure: this.currentMeasure,
      beat: this.currentBeat
    }
  }

  get currentTimeSeconds(): number {
    if (this.playbackState === 'playing') {
      return Tone.Transport.seconds
    }
    return this.pausePosition
  }

  get currentlyPlayingNotes(): Set<number> {
    return new Set(this.activeNotes.keys())
  }

  get duration(): number {
    return this.midiData?.duration || 0
  }

  get totalMeasures(): number {
    return this.midiData?.measures || 0
  }

  // ===== Private Methods =====

  /**
   * Schedule all MIDI events from a given time position
   */
  private scheduleEventsFrom(startTime: number): void {
    if (!this.midiData) return

    const transport = Tone.Transport

    // Filter and schedule events that occur after startTime
    this.events.forEach((event, index) => {
      if (event.time < startTime) return

      if (event.type === 'noteOn') {
        const noteEvent = event as NoteMIDIEvent

        // Find corresponding noteOff to calculate duration
        const noteOffEvent = this.findNoteOff(noteEvent, index)
        const duration = noteOffEvent
          ? noteOffEvent.time - event.time
          : 0.5 // Default duration if no noteOff found

        // Schedule note
        const eventId = transport.schedule((time) => {
          this.triggerNoteOn(noteEvent.data.midiNote, noteEvent.data.velocity, duration, time)
        }, event.time)

        this.scheduledEventIds.push(eventId as unknown as number)

        // Schedule noteOff callback (for visualization)
        if (noteOffEvent) {
          const offEventId = transport.schedule((time) => {
            this.triggerNoteOff(noteEvent.data.midiNote, time)
          }, noteOffEvent.time)

          this.scheduledEventIds.push(offEventId as unknown as number)
        }
      }
    })

    // Schedule end-of-playback event
    if (this.midiData.duration > startTime && !Tone.Transport.loop) {
      const endEventId = transport.schedule(() => {
        this.handlePlaybackEnd()
      }, this.midiData.duration)

      this.scheduledEventIds.push(endEventId as unknown as number)
    }
  }

  /**
   * Find matching noteOff event for a noteOn
   */
  private findNoteOff(noteOn: NoteMIDIEvent, startIndex: number): NoteMIDIEvent | undefined {
    for (let i = startIndex + 1; i < this.events.length; i++) {
      const event = this.events[i]
      if (
        event.type === 'noteOff' &&
        (event as NoteMIDIEvent).data.midiNote === noteOn.data.midiNote
      ) {
        return event as NoteMIDIEvent
      }
    }
    return undefined
  }

  /**
   * Trigger note on with audio and callbacks
   */
  private triggerNoteOn(midiNote: number, velocity: number, duration: number, time: number): void {
    // Normalize velocity to 0-1 range
    const normalizedVelocity = velocity / 127

    // Play the note
    this.engine.playNote(midiNote, duration, time, normalizedVelocity)

    // Track active note
    const noteEvent: ExtendedNoteEvent = {
      midiNote,
      velocity: normalizedVelocity,
      duration,
      time
    }
    this.activeNotes.set(midiNote, noteEvent)

    // Fire callback
    this.callbacks.onNoteOn?.(noteEvent)
  }

  /**
   * Trigger note off with callbacks
   */
  private triggerNoteOff(midiNote: number, time: number): void {
    const activeNote = this.activeNotes.get(midiNote)

    if (activeNote) {
      this.activeNotes.delete(midiNote)

      const noteEvent: NoteEvent = {
        midiNote,
        velocity: 0,
        duration: 0,
        time
      }

      this.callbacks.onNoteOff?.(noteEvent)
    }
  }

  /**
   * Release all currently active notes
   */
  private releaseAllActiveNotes(): void {
    this.activeNotes.forEach((_note, midiNote) => {
      this.callbacks.onNoteOff?.({
        midiNote,
        velocity: 0,
        duration: 0,
        time: Tone.Transport.seconds
      })
    })
    this.activeNotes.clear()
  }

  /**
   * Handle end of playback
   */
  private handlePlaybackEnd(): void {
    if (this.playbackState !== 'playing') return

    if (this.config.autoStop) {
      this.stop()
    }

    this.callbacks.onPlaybackEnd?.()
    console.log('Playback ended')
  }

  /**
   * Cancel all scheduled events
   */
  private cancelScheduledEvents(): void {
    this.scheduledEventIds.forEach(id => {
      Tone.Transport.clear(id)
    })
    this.scheduledEventIds = []
  }

  /**
   * Start position update interval
   */
  private startPositionUpdates(): void {
    this.stopPositionUpdates() // Clear any existing interval

    this.updateIntervalId = window.setInterval(() => {
      this.updatePosition()
    }, this.config.updateInterval)
  }

  /**
   * Stop position update interval
   */
  private stopPositionUpdates(): void {
    if (this.updateIntervalId !== null) {
      clearInterval(this.updateIntervalId)
      this.updateIntervalId = null
    }
  }

  /**
   * Update current position from transport
   */
  private updatePosition(): void {
    if (!this.midiData || this.playbackState !== 'playing') return

    const currentTime = Tone.Transport.seconds
    const { measure, beat = 1 } = this.timeToMeasureBeat(currentTime)

    // Check if measure changed
    if (measure !== this.currentMeasure) {
      this.currentMeasure = measure
      this.callbacks.onMeasureChange?.(measure)
    }

    // Check if beat changed
    if (beat !== this.currentBeat) {
      this.currentBeat = beat
      this.callbacks.onBeatChange?.(beat)
    }
  }

  /**
   * Convert measure and beat to time in seconds
   */
  private measureBeatToTime(position: MeasureBeat): number {
    if (!this.midiData) return 0

    const beatsPerMeasure = this.midiData.timeSignature.numerator
    const beatNumber = (position.measure - 1) * beatsPerMeasure + ((position.beat || 1) - 1)

    // Calculate based on effective tempo (base * multiplier)
    // Note: Transport handles tempo internally, so we use base tempo for time calculations
    const secondsPerBeat = 60 / this.baseTempo

    return beatNumber * secondsPerBeat
  }

  /**
   * Convert time in seconds to measure and beat
   */
  private timeToMeasureBeat(time: number): MeasureBeat {
    if (!this.midiData) return { measure: 1, beat: 1 }

    const secondsPerBeat = 60 / this.baseTempo
    const totalBeats = time / secondsPerBeat
    const beatsPerMeasure = this.midiData.timeSignature.numerator

    const measure = Math.floor(totalBeats / beatsPerMeasure) + 1
    const beat = Math.floor(totalBeats % beatsPerMeasure) + 1

    return { measure, beat }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop()

    // Clean up loop event listener
    if (this.boundHandleLoopEvent) {
      Tone.Transport.off('loop', this.boundHandleLoopEvent)
      this.boundHandleLoopEvent = null
    }

    this.callbacks = {}
    this.events = []
    this.midiData = null
    this.activeNotes.clear()
  }
}
