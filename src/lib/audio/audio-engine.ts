/**
 * Audio Engine
 * Core audio synthesis engine using Tone.js for piano playback
 */

import * as Tone from 'tone'
import { AudioEngineConfig, PIANO_NOTES, midiToNoteName } from './types'

/**
 * Default Salamander Grand Piano sample URLs
 * Free piano samples from https://github.com/gleitz/midi-js-soundfonts
 */
const DEFAULT_SAMPLE_BASE_URL =
  'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3'

/**
 * Core audio engine for MIDI synthesis
 * Manages Tone.js sampler and audio context
 */
export class AudioEngine {
  private sampler: Tone.Sampler | null = null
  private transport: typeof Tone.Transport = Tone.Transport
  private isLoaded = false
  private isMuted = false
  private volume: Tone.Volume
  private config: AudioEngineConfig

  constructor(config?: Partial<AudioEngineConfig>) {
    this.config = {
      sampleBaseUrl: DEFAULT_SAMPLE_BASE_URL,
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
   * Initialize the audio engine
   * Must be called before any audio playback
   */
  async initialize(): Promise<void> {
    try {
      // Start audio context (required for user interaction)
      if (Tone.context.state === 'suspended') {
        await Tone.start()
      }

      // Load piano samples
      await this.loadPianoSamples()

      this.isLoaded = true
    } catch (error) {
      console.error('Failed to initialize audio engine:', error)
      throw new Error('Audio engine initialization failed')
    }
  }

  /**
   * Load piano samples into Tone.js Sampler
   * Uses Salamander Grand Piano samples by default
   */
  async loadPianoSamples(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create sample map for Tone.js
        // We use a subset of notes and let Tone.js interpolate between them
        const sampleMap: Record<string, string> = {}

        PIANO_NOTES.forEach(note => {
          sampleMap[note] = `${this.config.sampleBaseUrl}/${note}.mp3`
        })

        // Create sampler with the sample map
        this.sampler = new Tone.Sampler({
          urls: sampleMap,
          release: 1,
          onload: () => {
            console.log('Piano samples loaded successfully')
            resolve()
          },
          onerror: (error) => {
            console.error('Failed to load piano samples:', error)
            reject(new Error('Failed to load piano samples'))
          }
        })

        // Connect sampler to volume control
        this.sampler.connect(this.volume)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Play a note with specified duration
   * @param midiNote MIDI note number (0-127)
   * @param duration Duration in seconds
   * @param time Optional time to schedule note (for sequencing)
   */
  playNote(midiNote: number, duration: number, time?: number): void {
    if (!this.isReady) {
      console.warn('Audio engine not ready')
      return
    }

    if (!this.sampler) {
      console.warn('Sampler not initialized')
      return
    }

    const noteName = midiToNoteName(midiNote)
    const velocity = 0.8 // Default velocity

    if (time !== undefined) {
      // Scheduled playback
      this.sampler.triggerAttackRelease(
        noteName,
        duration,
        time,
        velocity
      )
    } else {
      // Immediate playback
      this.sampler.triggerAttackRelease(
        noteName,
        duration,
        undefined,
        velocity
      )
    }
  }

  /**
   * Stop a specific note
   * @param midiNote MIDI note number to stop
   */
  stopNote(midiNote: number): void {
    if (!this.sampler) return

    const noteName = midiToNoteName(midiNote)
    this.sampler.triggerRelease(noteName)
  }

  /**
   * Stop all currently playing notes
   */
  stopAllNotes(): void {
    if (!this.sampler) return
    this.sampler.releaseAll()
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
   * Mute or unmute audio
   * @param muted True to mute, false to unmute
   */
  setMute(muted: boolean): void {
    this.isMuted = muted
    this.volume.mute = muted
  }

  /**
   * Get current mute state
   */
  get muted(): boolean {
    return this.isMuted
  }

  /**
   * Check if audio engine is ready for playback
   */
  get isReady(): boolean {
    return this.isLoaded && this.sampler !== null
  }

  /**
   * Get Tone.js transport for advanced control
   */
  getTransport(): typeof Tone.Transport {
    return this.transport
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
   * Clean up resources
   */
  dispose(): void {
    if (this.sampler) {
      this.sampler.dispose()
      this.sampler = null
    }
    this.volume.dispose()
    this.isLoaded = false
  }

  /**
   * Convert linear volume (0-1) to decibels
   */
  private dbFromLinear(linear: number): number {
    if (linear === 0) return -Infinity
    return 20 * Math.log10(linear)
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
 * Reset global audio engine (useful for testing)
 */
export function resetGlobalAudioEngine(): void {
  if (globalAudioEngine) {
    globalAudioEngine.dispose()
    globalAudioEngine = null
  }
}
