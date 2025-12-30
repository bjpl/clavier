/**
 * MIDI Player
 * Controls playback of MIDI data with tempo, looping, and event callbacks
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
 * MIDI playback controller with transport synchronization
 */
export class MIDIPlayer {
  private engine: AudioEngine
  private events: MIDIEvent[] = []
  private midiData: MIDIData | null = null
  private playbackState: PlaybackState = 'stopped'
  private callbacks: PlaybackCallbacks = {}
  private scheduledEvents: number[] = []
  private loopRegion: LoopRegion | null = null
  private tempoMultiplier = 1.0
  private currentMeasure = 1
  private currentBeat = 1
  private updateInterval: number | null = null
  private activeNotes = new Set<number>()

  constructor(engine: AudioEngine) {
    this.engine = engine
    this.setupTransportCallbacks()
  }

  /**
   * Load MIDI data for playback
   */
  loadMIDI(data: MIDIData): void {
    this.stop()
    this.midiData = data
    this.events = [...data.events].sort((a, b) => a.time - b.time)

    // Set initial tempo
    this.setTempo(data.tempo)

    // Reset position
    this.currentMeasure = 1
    this.currentBeat = 1

    console.log(`Loaded MIDI: ${data.name || 'Untitled'}, ${data.measures} measures, ${this.events.length} events`)
  }

  /**
   * Start or resume playback
   */
  play(): void {
    if (!this.midiData || !this.engine.isReady) {
      console.warn('Cannot play: MIDI not loaded or audio engine not ready')
      return
    }

    if (this.playbackState === 'playing') return

    // Schedule all events
    this.scheduleEvents()

    // Start transport
    Tone.Transport.start()

    this.playbackState = 'playing'
    this.startPositionUpdates()
    this.callbacks.onPlaybackStart?.()

    console.log('Playback started')
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (this.playbackState !== 'playing') return

    Tone.Transport.pause()
    this.playbackState = 'paused'
    this.stopPositionUpdates()
    this.callbacks.onPlaybackPause?.()

    console.log('Playback paused')
  }

  /**
   * Stop playback and return to start
   */
  stop(): void {
    // Stop transport
    Tone.Transport.stop()
    Tone.Transport.position = 0

    // Cancel all scheduled events
    this.cancelScheduledEvents()

    // Stop all playing notes
    this.engine.stopAllNotes()
    this.activeNotes.clear()

    // Reset state
    this.playbackState = 'stopped'
    this.currentMeasure = 1
    this.currentBeat = 1
    this.stopPositionUpdates()

    console.log('Playback stopped')
  }

  /**
   * Seek to a specific measure and beat
   */
  seekToMeasure(measure: number, beat = 1): void {
    if (!this.midiData) return

    const wasPlaying = this.playbackState === 'playing'

    // Stop current playback
    if (wasPlaying) {
      this.pause()
    }

    // Calculate time position from measure and beat
    const beatsPerMeasure = this.midiData.timeSignature.numerator
    const beatNumber = (measure - 1) * beatsPerMeasure + (beat - 1)
    const secondsPerBeat = 60 / (this.midiData.tempo * this.tempoMultiplier)
    const timePosition = beatNumber * secondsPerBeat

    // Update transport position
    Tone.Transport.position = timePosition

    // Update current position
    this.currentMeasure = measure
    this.currentBeat = beat

    // Resume if was playing
    if (wasPlaying) {
      this.cancelScheduledEvents()
      this.scheduleEvents()
      this.play()
    }

    this.callbacks.onMeasureChange?.(measure)
    this.callbacks.onBeatChange?.(beat)
  }

  /**
   * Set playback tempo
   */
  setTempo(bpm: number): void {
    const effectiveTempo = bpm * this.tempoMultiplier
    Tone.Transport.bpm.value = effectiveTempo
  }

  /**
   * Set tempo multiplier for practice (0.5 = half speed, 2.0 = double speed)
   */
  setTempoMultiplier(multiplier: number): void {
    this.tempoMultiplier = Math.max(0.25, Math.min(2.0, multiplier))
    if (this.midiData) {
      this.setTempo(this.midiData.tempo)
    }
  }

  /**
   * Set loop region
   */
  setLoop(start: MeasureBeat, end: MeasureBeat): void {
    this.loopRegion = {
      start,
      end,
      enabled: true
    }

    // Configure Tone.js transport loop
    if (this.midiData) {
      const startTime = this.measureBeatToTime(start)
      const endTime = this.measureBeatToTime(end)

      Tone.Transport.loopStart = startTime
      Tone.Transport.loopEnd = endTime
      Tone.Transport.loop = true
    }
  }

  /**
   * Clear loop region
   */
  clearLoop(): void {
    this.loopRegion = null
    Tone.Transport.loop = false
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

  /**
   * Register callback for note on events
   */
  onNoteOn(callback: (note: NoteEvent) => void): void {
    this.callbacks.onNoteOn = callback
  }

  /**
   * Register callback for note off events
   */
  onNoteOff(callback: (note: NoteEvent) => void): void {
    this.callbacks.onNoteOff = callback
  }

  /**
   * Register callback for measure changes
   */
  onMeasureChange(callback: (measure: number) => void): void {
    this.callbacks.onMeasureChange = callback
  }

  /**
   * Register callback for beat changes
   */
  onBeatChange(callback: (beat: number) => void): void {
    this.callbacks.onBeatChange = callback
  }

  /**
   * Register callback for playback end
   */
  onPlaybackEnd(callback: () => void): void {
    this.callbacks.onPlaybackEnd = callback
  }

  /**
   * Get current playback state
   */
  get state(): PlaybackState {
    return this.playbackState
  }

  /**
   * Get current playback position
   */
  get position(): MeasureBeat {
    return {
      measure: this.currentMeasure,
      beat: this.currentBeat
    }
  }

  /**
   * Get set of currently active notes
   */
  get currentlyPlayingNotes(): Set<number> {
    return new Set(this.activeNotes)
  }

  /**
   * Schedule all MIDI events
   */
  private scheduleEvents(): void {
    if (!this.midiData) return

    this.events.forEach(event => {
      if (event.type === 'noteOn') {
        const noteEvent = event as NoteMIDIEvent
        const scheduleTime = event.time

        // Find corresponding noteOff to calculate duration
        const noteOffEvent = this.events.find(
          e => e.type === 'noteOff' &&
               e.time > event.time &&
               (e as NoteMIDIEvent).data.midiNote === noteEvent.data.midiNote
        ) as NoteMIDIEvent | undefined

        const duration = noteOffEvent
          ? noteOffEvent.time - event.time
          : 0.5 // Default duration if no noteOff found

        // Schedule note with Tone.js
        const eventId = Tone.Transport.schedule((time) => {
          this.handleNoteOn(noteEvent.data.midiNote, noteEvent.data.velocity, duration, time)
        }, scheduleTime)

        this.scheduledEvents.push(eventId as unknown as number)

        // Schedule noteOff callback
        if (noteOffEvent) {
          const offEventId = Tone.Transport.schedule((time) => {
            this.handleNoteOff(noteEvent.data.midiNote, time)
          }, noteOffEvent.time)

          this.scheduledEvents.push(offEventId as unknown as number)
        }
      }
    })
  }

  /**
   * Cancel all scheduled events
   */
  private cancelScheduledEvents(): void {
    this.scheduledEvents.forEach(id => {
      Tone.Transport.clear(id)
    })
    this.scheduledEvents = []
  }

  /**
   * Handle note on event
   */
  private handleNoteOn(midiNote: number, velocity: number, duration: number, time: number): void {
    this.activeNotes.add(midiNote)
    this.engine.playNote(midiNote, duration, time)

    const noteEvent: NoteEvent = {
      midiNote,
      velocity,
      duration,
      time
    }

    this.callbacks.onNoteOn?.(noteEvent)
  }

  /**
   * Handle note off event
   */
  private handleNoteOff(midiNote: number, time: number): void {
    this.activeNotes.delete(midiNote)

    const noteEvent: NoteEvent = {
      midiNote,
      velocity: 0,
      duration: 0,
      time
    }

    this.callbacks.onNoteOff?.(noteEvent)
  }

  /**
   * Setup transport callbacks for position tracking
   */
  private setupTransportCallbacks(): void {
    // Transport will handle looping automatically
    // We just need to track position changes
  }

  /**
   * Start position update interval
   */
  private startPositionUpdates(): void {
    this.updateInterval = window.setInterval(() => {
      this.updatePosition()
    }, 50) // Update every 50ms
  }

  /**
   * Stop position update interval
   */
  private stopPositionUpdates(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  /**
   * Update current position from transport
   */
  private updatePosition(): void {
    if (!this.midiData) return

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

    // Check if reached end
    if (currentTime >= this.midiData.duration && !Tone.Transport.loop) {
      this.stop()
      this.callbacks.onPlaybackEnd?.()
    }
  }

  /**
   * Convert measure and beat to time in seconds
   */
  private measureBeatToTime(position: MeasureBeat): number {
    if (!this.midiData) return 0

    const beatsPerMeasure = this.midiData.timeSignature.numerator
    const beatNumber = (position.measure - 1) * beatsPerMeasure + ((position.beat || 1) - 1)
    const secondsPerBeat = 60 / (this.midiData.tempo * this.tempoMultiplier)

    return beatNumber * secondsPerBeat
  }

  /**
   * Convert time in seconds to measure and beat
   */
  private timeToMeasureBeat(time: number): MeasureBeat {
    if (!this.midiData) return { measure: 1, beat: 1 }

    const secondsPerBeat = 60 / (this.midiData.tempo * this.tempoMultiplier)
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
    this.callbacks = {}
    this.events = []
    this.midiData = null
  }
}
