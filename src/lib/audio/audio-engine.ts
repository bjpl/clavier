/**
 * Audio Engine
 * Core audio synthesis engine using Tone.js for piano playback
 *
 * Features:
 * - Piano sampler with high-quality samples
 * - Fallback synthesizer when samples fail to load
 * - Volume control with mute support
 * - Transport control for MIDI playback
 * - Mobile browser compatibility
 */

import * as Tone from 'tone'
import { AudioEngineConfig, PIANO_NOTES, midiToNoteName } from './types'

/**
 * Sample URL providers for different quality levels
 */
const SAMPLE_PROVIDERS = {
  // Salamander Grand Piano - High quality, larger files
  salamander: {
    baseUrl: 'https://nbrosowsky.github.io/tonern/Salamander',
    notes: ['A0', 'C1', 'D#1', 'F#1', 'A1', 'C2', 'D#2', 'F#2', 'A2', 'C3', 'D#3', 'F#3', 'A3', 'C4', 'D#4', 'F#4', 'A4', 'C5', 'D#5', 'F#5', 'A5', 'C6', 'D#6', 'F#6', 'A6', 'C7', 'D#7', 'F#7', 'A7', 'C8'],
    extension: 'mp3'
  },
  // FluidR3 GM - Lighter weight, good quality
  fluidR3: {
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3',
    notes: PIANO_NOTES,
    extension: 'mp3'
  }
}

/**
 * Audio engine loading state
 */
export type AudioEngineState = 'uninitialized' | 'loading' | 'ready' | 'error'

/**
 * Audio engine event callbacks
 */
export interface AudioEngineCallbacks {
  onStateChange?: (state: AudioEngineState) => void
  onLoadProgress?: (progress: number) => void
  onError?: (error: Error) => void
}

/**
 * Core audio engine for MIDI synthesis
 * Manages Tone.js sampler and audio context
 */
export class AudioEngine {
  private sampler: Tone.Sampler | null = null
  private synth: Tone.PolySynth | null = null
  private transport: typeof Tone.Transport = Tone.Transport
  private isLoaded = false
  private usingSynth = false
  private isMuted = false
  private volume: Tone.Volume
  private config: AudioEngineConfig
  private callbacks: AudioEngineCallbacks = {}
  private state: AudioEngineState = 'uninitialized'
  private activeNotes = new Set<string>()
  // Reserved for future retry logic
  // private loadRetries = 0
  // private maxLoadRetries = 2

  constructor(config?: Partial<AudioEngineConfig>) {
    this.config = {
      sampleBaseUrl: SAMPLE_PROVIDERS.fluidR3.baseUrl,
      volume: 0.8,
      muted: false,
      ...config
    }

    // Create volume node
    this.volume = new Tone.Volume(this.dbFromLinear(this.config.volume || 0.8))
    this.volume.toDestination()

    if (this.config.muted) {
      this.setMute(true)
    }
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: AudioEngineCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * Get current engine state
   */
  getState(): AudioEngineState {
    return this.state
  }

  /**
   * Update engine state and notify listeners
   */
  private setState(state: AudioEngineState): void {
    this.state = state
    this.callbacks.onStateChange?.(state)
  }

  /**
   * Initialize the audio engine
   * Must be called after user interaction to comply with browser autoplay policies
   */
  async initialize(): Promise<void> {
    if (this.state === 'loading') {
      console.log('Audio engine initialization already in progress')
      return
    }

    if (this.isReady) {
      console.log('Audio engine already initialized')
      return
    }

    this.setState('loading')

    try {
      // Start audio context (required for user interaction)
      if (Tone.context.state === 'suspended') {
        await Tone.start()
      }

      // Ensure audio context is running
      if (Tone.context.state !== 'running') {
        throw new Error('Failed to start audio context. Please try again after clicking.')
      }

      // Try to load piano samples with fallback
      await this.loadPianoSamples()

      this.isLoaded = true
      this.setState('ready')
      console.log(`Audio engine initialized successfully (using ${this.usingSynth ? 'synthesizer' : 'samples'})`)
    } catch (error) {
      console.error('Failed to initialize audio engine:', error)
      this.setState('error')
      this.callbacks.onError?.(error instanceof Error ? error : new Error('Audio initialization failed'))
      throw error
    }
  }

  /**
   * Load piano samples with retry and fallback to synthesizer
   */
  private async loadPianoSamples(): Promise<void> {
    try {
      await this.tryLoadSamples()
    } catch (sampleError) {
      console.warn('Failed to load piano samples, using synthesizer fallback:', sampleError)
      this.createFallbackSynth()
    }
  }

  /**
   * Attempt to load samples from the configured provider
   */
  private async tryLoadSamples(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Sample loading timed out'))
      }, 30000) // 30 second timeout

      try {
        // Build sample URLs
        const sampleMap: Record<string, string> = {}
        const provider = SAMPLE_PROVIDERS.fluidR3

        provider.notes.forEach(note => {
          // FluidR3 format: {baseUrl}/{note}.mp3
          sampleMap[note] = `${provider.baseUrl}/${note}.${provider.extension}`
        })

        // Reserved for future progress tracking
        // let loadedCount = 0
        // const totalSamples = provider.notes.length

        // Create sampler
        this.sampler = new Tone.Sampler({
          urls: sampleMap,
          release: 1.2,
          baseUrl: '',
          onload: () => {
            clearTimeout(timeout)
            this.usingSynth = false
            console.log('Piano samples loaded successfully')
            resolve()
          },
          onerror: (error) => {
            clearTimeout(timeout)
            console.error('Sampler error:', error)
            reject(new Error('Failed to load piano samples'))
          }
        })

        // Connect sampler to volume control
        this.sampler.connect(this.volume)
      } catch (error) {
        clearTimeout(timeout)
        reject(error)
      }
    })
  }

  /**
   * Create a synthesizer as fallback when samples fail to load
   */
  private createFallbackSynth(): void {
    console.log('Creating fallback synthesizer...')

    // Create a piano-like synthesizer
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle8'
      },
      envelope: {
        attack: 0.005,
        decay: 0.3,
        sustain: 0.4,
        release: 1.2
      }
    })

    // Add some effects for a more piano-like sound
    const reverb = new Tone.Reverb({
      decay: 2,
      wet: 0.3
    })

    const compressor = new Tone.Compressor({
      threshold: -20,
      ratio: 4,
      attack: 0.003,
      release: 0.25
    })

    // Connect: synth -> compressor -> reverb -> volume -> destination
    this.synth.chain(compressor, reverb, this.volume)

    this.usingSynth = true
    console.log('Fallback synthesizer created')
  }

  /**
   * Play a note with specified duration
   * @param midiNote MIDI note number (0-127)
   * @param duration Duration in seconds
   * @param time Optional time to schedule note (for sequencing)
   * @param velocity Optional velocity (0-1)
   */
  playNote(midiNote: number, duration: number, time?: number, velocity: number = 0.8): void {
    if (!this.isReady) {
      console.warn('Audio engine not ready')
      return
    }

    const noteName = midiToNoteName(midiNote)
    const clampedVelocity = Math.max(0, Math.min(1, velocity))

    try {
      if (this.sampler && !this.usingSynth) {
        if (time !== undefined) {
          this.sampler.triggerAttackRelease(noteName, duration, time, clampedVelocity)
        } else {
          this.sampler.triggerAttackRelease(noteName, duration, undefined, clampedVelocity)
        }
      } else if (this.synth) {
        if (time !== undefined) {
          this.synth.triggerAttackRelease(noteName, duration, time, clampedVelocity)
        } else {
          this.synth.triggerAttackRelease(noteName, duration, undefined, clampedVelocity)
        }
      }

      this.activeNotes.add(noteName)
    } catch (error) {
      console.error(`Error playing note ${noteName}:`, error)
    }
  }

  /**
   * Start a note (attack only, no scheduled release)
   * Use for interactive keyboard where duration is unknown
   */
  triggerAttack(midiNote: number, velocity: number = 0.8, time?: number): void {
    if (!this.isReady) {
      console.warn('Audio engine not ready')
      return
    }

    const noteName = midiToNoteName(midiNote)
    const clampedVelocity = Math.max(0, Math.min(1, velocity))

    try {
      if (this.sampler && !this.usingSynth) {
        this.sampler.triggerAttack(noteName, time, clampedVelocity)
      } else if (this.synth) {
        this.synth.triggerAttack(noteName, time, clampedVelocity)
      }

      this.activeNotes.add(noteName)
    } catch (error) {
      console.error(`Error triggering attack for ${noteName}:`, error)
    }
  }

  /**
   * Release a note (trigger release envelope)
   */
  triggerRelease(midiNote: number, time?: number): void {
    if (!this.isReady) return

    const noteName = midiToNoteName(midiNote)

    try {
      if (this.sampler && !this.usingSynth) {
        this.sampler.triggerRelease(noteName, time)
      } else if (this.synth) {
        this.synth.triggerRelease(noteName, time)
      }

      this.activeNotes.delete(noteName)
    } catch (error) {
      console.error(`Error releasing note ${noteName}:`, error)
    }
  }

  /**
   * Stop a specific note (alias for triggerRelease for backwards compatibility)
   */
  stopNote(midiNote: number): void {
    this.triggerRelease(midiNote)
  }

  /**
   * Stop all currently playing notes
   */
  stopAllNotes(): void {
    if (this.sampler && !this.usingSynth) {
      this.sampler.releaseAll()
    } else if (this.synth) {
      this.synth.releaseAll()
    }

    this.activeNotes.clear()
  }

  /**
   * Get currently active notes
   */
  getActiveNotes(): string[] {
    return Array.from(this.activeNotes)
  }

  /**
   * Set master volume
   * @param value Volume level (0-1)
   */
  setVolume(value: number): void {
    const clampedValue = Math.max(0, Math.min(1, value))
    this.volume.volume.value = this.dbFromLinear(clampedValue)
  }

  /**
   * Get current volume level (0-1)
   */
  getVolume(): number {
    return this.linearFromDb(this.volume.volume.value)
  }

  /**
   * Mute or unmute audio
   */
  setMute(muted: boolean): void {
    this.isMuted = muted
    this.volume.mute = muted
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.setMute(!this.isMuted)
    return this.isMuted
  }

  /**
   * Get current mute state
   */
  get muted(): boolean {
    return this.isMuted
  }

  /**
   * Check if using fallback synthesizer
   */
  get isUsingSynthesizer(): boolean {
    return this.usingSynth
  }

  /**
   * Check if audio engine is ready for playback
   */
  get isReady(): boolean {
    return this.isLoaded && (this.sampler !== null || this.synth !== null)
  }

  /**
   * Get Tone.js transport for advanced control
   */
  getTransport(): typeof Tone.Transport {
    return this.transport
  }

  /**
   * Get current Tone.js context state
   */
  getContextState(): AudioContextState {
    return Tone.context.state
  }

  /**
   * Resume audio context (needed after user interaction)
   */
  async resume(): Promise<void> {
    if (Tone.context.state === 'suspended') {
      await Tone.start()
    }
  }

  /**
   * Suspend audio context (save resources when not in use)
   */
  async suspend(): Promise<void> {
    if (Tone.context.state === 'running') {
      // Cast to AudioContext since BaseContext type doesn't include suspend
      await (Tone.context as unknown as AudioContext).suspend()
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopAllNotes()

    if (this.sampler) {
      this.sampler.dispose()
      this.sampler = null
    }

    if (this.synth) {
      this.synth.dispose()
      this.synth = null
    }

    this.volume.dispose()
    this.isLoaded = false
    this.usingSynth = false
    this.setState('uninitialized')
  }

  /**
   * Convert linear volume (0-1) to decibels
   */
  private dbFromLinear(linear: number): number {
    if (linear <= 0) return -Infinity
    if (linear >= 1) return 0
    return 20 * Math.log10(linear)
  }

  /**
   * Convert decibels to linear volume (0-1)
   */
  private linearFromDb(db: number): number {
    if (db === -Infinity) return 0
    return Math.pow(10, db / 20)
  }
}

/**
 * Singleton instance for global access
 */
let globalAudioEngine: AudioEngine | null = null

/**
 * Get or create global audio engine instance
 */
export function getGlobalAudioEngine(config?: Partial<AudioEngineConfig>): AudioEngine {
  if (!globalAudioEngine) {
    globalAudioEngine = new AudioEngine(config)
  }
  return globalAudioEngine
}

/**
 * Reset global audio engine (useful for testing or cleanup)
 */
export function resetGlobalAudioEngine(): void {
  if (globalAudioEngine) {
    globalAudioEngine.dispose()
    globalAudioEngine = null
  }
}

/**
 * Check if Web Audio API is supported in this environment
 */
export function isWebAudioSupported(): boolean {
  return typeof window !== 'undefined' &&
    (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined')
}
