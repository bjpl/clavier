/**
 * Unit Tests: MIDI Player
 * Tests MIDI playback controls, tempo, looping, and event scheduling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MIDIPlayer } from '@/lib/audio/midi-player'
import { AudioEngine } from '@/lib/audio/audio-engine'
import type { MIDIData, MIDIEvent } from '@/lib/audio/types'

// Create mock audio engine
function createMockAudioEngine(): AudioEngine {
  const mockEngine = {
    isReady: true,
    playNote: vi.fn(),
    triggerAttack: vi.fn(),
    triggerRelease: vi.fn(),
    stopNote: vi.fn(),
    stopAllNotes: vi.fn(),
    resume: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn(),
  } as unknown as AudioEngine

  return mockEngine
}

// Create mock MIDI data
function createMockMIDIData(overrides?: Partial<MIDIData>): MIDIData {
  const noteOnEvents: MIDIEvent[] = [
    { type: 'noteOn', time: 0, data: { midiNote: 60, velocity: 80 } },
    { type: 'noteOff', time: 0.5, data: { midiNote: 60, velocity: 0 } },
    { type: 'noteOn', time: 0.5, data: { midiNote: 64, velocity: 80 } },
    { type: 'noteOff', time: 1.0, data: { midiNote: 64, velocity: 0 } },
    { type: 'noteOn', time: 1.0, data: { midiNote: 67, velocity: 80 } },
    { type: 'noteOff', time: 1.5, data: { midiNote: 67, velocity: 0 } },
    { type: 'noteOn', time: 1.5, data: { midiNote: 72, velocity: 80 } },
    { type: 'noteOff', time: 2.0, data: { midiNote: 72, velocity: 0 } },
  ]

  return {
    name: 'Test MIDI',
    tempo: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    events: noteOnEvents,
    duration: 4.0,
    measures: 4,
    ...overrides,
  }
}

describe('MIDIPlayer', () => {
  let player: MIDIPlayer
  let mockEngine: AudioEngine

  beforeEach(() => {
    mockEngine = createMockAudioEngine()
    player = new MIDIPlayer(mockEngine)
    vi.clearAllMocks()
  })

  afterEach(() => {
    player.dispose()
  })

  describe('Initialization', () => {
    it('should create player with default config', () => {
      expect(player).toBeDefined()
      expect(player.state).toBe('stopped')
    })

    it('should accept custom configuration', () => {
      const customPlayer = new MIDIPlayer(mockEngine, {
        lookahead: 0.2,
        updateInterval: 100,
        autoStop: false,
      })

      expect(customPlayer).toBeDefined()
      customPlayer.dispose()
    })

    it('should initialize with null MIDI data', () => {
      expect(player.getMIDIData()).toBeNull()
    })
  })

  describe('Loading MIDI', () => {
    it('should load MIDI data correctly', () => {
      const midiData = createMockMIDIData()
      player.loadMIDI(midiData)

      expect(player.getMIDIData()).toBe(midiData)
    })

    it('should reset position when loading new MIDI', () => {
      const midiData = createMockMIDIData()
      player.loadMIDI(midiData)

      expect(player.position.measure).toBe(1)
      expect(player.position.beat).toBe(1)
    })

    it('should stop playback when loading new MIDI', () => {
      const midiData = createMockMIDIData()
      player.loadMIDI(midiData)
      player.play()

      const newData = createMockMIDIData({ name: 'New MIDI' })
      player.loadMIDI(newData)

      expect(player.state).toBe('stopped')
    })

    it('should set base tempo from MIDI data', () => {
      const midiData = createMockMIDIData({ tempo: 90 })
      player.loadMIDI(midiData)

      expect(player.getEffectiveTempo()).toBe(90)
    })

    it('should report duration from MIDI data', () => {
      const midiData = createMockMIDIData({ duration: 10.5 })
      player.loadMIDI(midiData)

      expect(player.duration).toBe(10.5)
    })

    it('should report total measures from MIDI data', () => {
      const midiData = createMockMIDIData({ measures: 16 })
      player.loadMIDI(midiData)

      expect(player.totalMeasures).toBe(16)
    })
  })

  describe('Playback Controls', () => {
    beforeEach(() => {
      player.loadMIDI(createMockMIDIData())
    })

    it('should start playback when play is called', () => {
      player.play()
      expect(player.state).toBe('playing')
    })

    it('should pause playback', () => {
      player.play()
      player.pause()

      expect(player.state).toBe('paused')
    })

    it('should stop playback and reset position', () => {
      player.play()
      player.stop()

      expect(player.state).toBe('stopped')
      expect(player.position.measure).toBe(1)
      expect(player.position.beat).toBe(1)
    })

    it('should not play if MIDI data not loaded', () => {
      const emptyPlayer = new MIDIPlayer(mockEngine)
      emptyPlayer.play()

      expect(emptyPlayer.state).toBe('stopped')
      emptyPlayer.dispose()
    })

    it('should not play if engine not ready', () => {
      const notReadyEngine = { ...mockEngine, isReady: false } as unknown as AudioEngine
      const notReadyPlayer = new MIDIPlayer(notReadyEngine)
      notReadyPlayer.loadMIDI(createMockMIDIData())
      notReadyPlayer.play()

      expect(notReadyPlayer.state).toBe('stopped')
      notReadyPlayer.dispose()
    })

    it('should ignore play when already playing', () => {
      player.play()
      expect(player.state).toBe('playing')

      player.play() // Should not change state
      expect(player.state).toBe('playing')
    })

    it('should resume from paused position', () => {
      player.play()
      player.pause()
      const pausedState = player.state

      player.play()

      expect(pausedState).toBe('paused')
      expect(player.state).toBe('playing')
    })
  })

  describe('Tempo Controls', () => {
    beforeEach(() => {
      player.loadMIDI(createMockMIDIData({ tempo: 120 }))
    })

    it('should set tempo within valid range', () => {
      player.setTempo(100)
      expect(player.getEffectiveTempo()).toBe(100)
    })

    it('should clamp tempo to minimum (20)', () => {
      player.setTempo(10)
      expect(player.getEffectiveTempo()).toBe(20)
    })

    it('should clamp tempo to maximum (300)', () => {
      player.setTempo(400)
      expect(player.getEffectiveTempo()).toBe(300)
    })

    it('should set tempo multiplier', () => {
      player.setTempoMultiplier(0.5)
      expect(player.getTempoMultiplier()).toBe(0.5)
    })

    it('should clamp tempo multiplier to minimum (0.25)', () => {
      player.setTempoMultiplier(0.1)
      expect(player.getTempoMultiplier()).toBe(0.25)
    })

    it('should clamp tempo multiplier to maximum (2.0)', () => {
      player.setTempoMultiplier(3.0)
      expect(player.getTempoMultiplier()).toBe(2.0)
    })

    it('should calculate effective tempo correctly', () => {
      player.setTempo(120)
      player.setTempoMultiplier(0.5)

      expect(player.getEffectiveTempo()).toBe(60)
    })

    it('should calculate effective tempo with multiplier > 1', () => {
      player.setTempo(100)
      player.setTempoMultiplier(1.5)

      expect(player.getEffectiveTempo()).toBe(150)
    })
  })

  describe('Seek Operations', () => {
    beforeEach(() => {
      player.loadMIDI(createMockMIDIData({ measures: 16 }))
    })

    it('should seek to specific measure', () => {
      player.seekToMeasure(5)

      expect(player.position.measure).toBe(5)
    })

    it('should seek to specific measure and beat', () => {
      player.seekToMeasure(3, 2)

      expect(player.position.measure).toBe(3)
      expect(player.position.beat).toBe(2)
    })

    it('should seek to time in seconds', () => {
      // At 120 BPM, 4 beats/measure, 2 seconds = 4 beats = 1 measure
      player.seekToTime(2)

      expect(player.position.measure).toBeGreaterThanOrEqual(1)
    })

    it('should maintain playing state during seek', () => {
      player.play()
      player.seekToMeasure(5)

      expect(player.state).toBe('playing')
    })

    it('should default beat to 1 when not specified', () => {
      player.seekToMeasure(3)

      expect(player.position.beat).toBe(1)
    })
  })

  describe('Loop Controls', () => {
    beforeEach(() => {
      player.loadMIDI(createMockMIDIData({ measures: 16 }))
    })

    it('should set loop region', () => {
      player.setLoop({ measure: 2, beat: 1 }, { measure: 6, beat: 1 })

      expect(player.isLooping).toBe(true)
      expect(player.getLoopRegion()).toEqual({
        start: { measure: 2, beat: 1 },
        end: { measure: 6, beat: 1 },
        enabled: true,
      })
    })

    it('should clear loop region', () => {
      player.setLoop({ measure: 2, beat: 1 }, { measure: 6, beat: 1 })
      player.clearLoop()

      expect(player.isLooping).toBe(false)
      expect(player.getLoopRegion()).toBeNull()
    })

    it('should default to not looping', () => {
      expect(player.isLooping).toBe(false)
    })

    it('should not throw when clearing non-existent loop', () => {
      expect(() => player.clearLoop()).not.toThrow()
    })
  })

  describe('Callback Registration', () => {
    let noteOnCallback: ReturnType<typeof vi.fn>
    let noteOffCallback: ReturnType<typeof vi.fn>
    let measureCallback: ReturnType<typeof vi.fn>
    let beatCallback: ReturnType<typeof vi.fn>
    let startCallback: ReturnType<typeof vi.fn>
    let pauseCallback: ReturnType<typeof vi.fn>
    let endCallback: ReturnType<typeof vi.fn>

    beforeEach(() => {
      noteOnCallback = vi.fn()
      noteOffCallback = vi.fn()
      measureCallback = vi.fn()
      beatCallback = vi.fn()
      startCallback = vi.fn()
      pauseCallback = vi.fn()
      endCallback = vi.fn()

      // Cast mocks to expected callback types to satisfy TypeScript
      player.onNoteOn(noteOnCallback as unknown as (note: import('@/lib/audio/types').NoteEvent) => void)
      player.onNoteOff(noteOffCallback as unknown as (note: import('@/lib/audio/types').NoteEvent) => void)
      player.onMeasureChange(measureCallback as unknown as (measure: number) => void)
      player.onBeatChange(beatCallback as unknown as (beat: number) => void)
      player.onPlaybackStart(startCallback as unknown as () => void)
      player.onPlaybackPause(pauseCallback as unknown as () => void)
      player.onPlaybackEnd(endCallback as unknown as () => void)

      player.loadMIDI(createMockMIDIData())
    })

    it('should fire playback start callback', () => {
      player.play()
      expect(startCallback).toHaveBeenCalled()
    })

    it('should fire playback pause callback', () => {
      player.play()
      player.pause()

      expect(pauseCallback).toHaveBeenCalled()
    })

    it('should not fire callbacks when not playing', () => {
      player.pause() // Called when not playing

      expect(pauseCallback).not.toHaveBeenCalled()
    })
  })

  describe('State Getters', () => {
    beforeEach(() => {
      player.loadMIDI(createMockMIDIData({ duration: 5.0, measures: 5 }))
    })

    it('should return correct playback state', () => {
      expect(player.state).toBe('stopped')

      player.play()
      expect(player.state).toBe('playing')

      player.pause()
      expect(player.state).toBe('paused')

      player.stop()
      expect(player.state).toBe('stopped')
    })

    it('should return correct position', () => {
      player.seekToMeasure(3, 2)

      expect(player.position).toEqual({ measure: 3, beat: 2 })
    })

    it('should return correct duration', () => {
      expect(player.duration).toBe(5.0)
    })

    it('should return correct total measures', () => {
      expect(player.totalMeasures).toBe(5)
    })

    it('should track currently playing notes', () => {
      const activeNotes = player.currentlyPlayingNotes
      expect(activeNotes).toBeInstanceOf(Set)
    })
  })

  describe('Resource Cleanup', () => {
    it('should dispose all resources', () => {
      player.loadMIDI(createMockMIDIData())
      player.play()
      player.dispose()

      expect(player.getMIDIData()).toBeNull()
      expect(player.state).toBe('stopped')
    })

    it('should handle multiple dispose calls', () => {
      player.loadMIDI(createMockMIDIData())
      player.dispose()

      expect(() => player.dispose()).not.toThrow()
    })

    it('should stop playback on dispose', () => {
      player.loadMIDI(createMockMIDIData())
      player.play()
      player.dispose()

      expect(player.state).toBe('stopped')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty MIDI data', () => {
      const emptyMIDI: MIDIData = {
        name: 'Empty',
        tempo: 120,
        timeSignature: { numerator: 4, denominator: 4 },
        events: [],
        duration: 0,
        measures: 0,
      }

      expect(() => player.loadMIDI(emptyMIDI)).not.toThrow()
      expect(player.getMIDIData()).toBe(emptyMIDI)
    })

    it('should handle MIDI with only one note', () => {
      const singleNoteMIDI: MIDIData = {
        name: 'Single Note',
        tempo: 120,
        timeSignature: { numerator: 4, denominator: 4 },
        events: [
          { type: 'noteOn', time: 0, data: { midiNote: 60, velocity: 80 } },
          { type: 'noteOff', time: 1.0, data: { midiNote: 60, velocity: 0 } },
        ],
        duration: 1.0,
        measures: 1,
      }

      expect(() => player.loadMIDI(singleNoteMIDI)).not.toThrow()
    })

    it('should handle very high tempo', () => {
      player.loadMIDI(createMockMIDIData({ tempo: 300 }))
      expect(player.getEffectiveTempo()).toBe(300)
    })

    it('should handle very low tempo', () => {
      player.loadMIDI(createMockMIDIData({ tempo: 20 }))
      expect(player.getEffectiveTempo()).toBe(20)
    })

    it('should handle different time signatures', () => {
      const waltzMIDI = createMockMIDIData({
        timeSignature: { numerator: 3, denominator: 4 },
      })

      expect(() => player.loadMIDI(waltzMIDI)).not.toThrow()
    })
  })
})
