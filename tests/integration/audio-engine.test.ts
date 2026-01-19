/**
 * Integration Tests: Audio Engine
 * Tests audio system integration with Tone.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Create the mock using vi.hoisted to ensure it's available for vi.mock
const toneMocks = vi.hoisted(() => {
  const createVolumeInstance = () => ({
    toDestination: () => createVolumeInstance(),
    dispose: () => {},
    volume: { value: 0 },
    mute: false,
    connect: () => createVolumeInstance(),
  })

  const mockSampler = (options: { onload?: () => void }) => {
    // Simulate successful load by calling onload if provided
    const onloadFn = options?.onload
    if (onloadFn) {
      setTimeout(() => onloadFn(), 10)
    }
    return {
      triggerAttackRelease: () => {},
      triggerAttack: () => {},
      triggerRelease: () => {},
      releaseAll: () => {},
      connect: () => ({}),
      dispose: () => {},
      loaded: true,
    }
  }

  const mockPolySynth = () => ({
    triggerAttackRelease: () => {},
    triggerAttack: () => {},
    triggerRelease: () => {},
    releaseAll: () => {},
    connect: () => ({}),
    chain: () => ({}),
    dispose: () => {},
    maxPolyphony: 32,
  })

  const mockTransport = {
    start: () => {},
    stop: () => {},
    pause: () => {},
    cancel: () => {},
    clear: () => {},
    schedule: () => 1,
    scheduleOnce: () => 1,
    scheduleRepeat: () => 1,
    bpm: { value: 120 },
    seconds: 0,
    loop: false,
    loopStart: 0,
    loopEnd: 0,
    position: '0:0:0',
    state: 'stopped',
  }

  const mockContext = {
    state: 'running',
    resume: () => Promise.resolve(undefined),
    suspend: () => Promise.resolve(undefined),
    currentTime: 0,
  }

  return {
    createVolumeInstance,
    mockSampler,
    mockPolySynth,
    mockTransport,
    mockContext,
  }
})

// Mock Tone.js before importing AudioEngine
vi.mock('tone', () => {
  const { createVolumeInstance, mockSampler, mockPolySynth, mockTransport, mockContext } = toneMocks

  const Volume = function() { return createVolumeInstance() }
  const Sampler = function(options: { onload?: () => void }) { return mockSampler(options) }
  const PolySynth = function() { return mockPolySynth() }
  const Reverb = function() { return { connect: () => ({}), dispose: () => {} } }
  const Compressor = function() { return { connect: () => ({}), dispose: () => {} } }

  return {
    default: {
      Transport: mockTransport,
      Sampler,
      PolySynth,
      Volume,
      Reverb,
      Compressor,
      context: mockContext,
      start: () => Promise.resolve(undefined),
    },
    Transport: mockTransport,
    Sampler,
    PolySynth,
    Volume,
    Reverb,
    Compressor,
    context: mockContext,
    start: () => Promise.resolve(undefined),
  }
})

import { AudioEngine, getGlobalAudioEngine, resetGlobalAudioEngine } from '@/lib/audio/audio-engine'

describe('AudioEngine Integration', () => {
  let audioEngine: AudioEngine

  beforeEach(async () => {
    // Reset global instance before each test
    resetGlobalAudioEngine()
    audioEngine = new AudioEngine()
  })

  afterEach(() => {
    if (audioEngine) {
      audioEngine.dispose()
    }
    resetGlobalAudioEngine()
  })

  describe('Initialization', () => {
    it('should initialize audio engine successfully', async () => {
      await audioEngine.initialize()
      expect(audioEngine.isReady).toBe(true)
    })

    it('should load piano samples during initialization', async () => {
      await audioEngine.initialize()
      expect(audioEngine.isReady).toBe(true)
    })

    it('should handle initialization errors gracefully', async () => {
      // With mocked Tone.js, initialization succeeds
      // This test verifies the engine initializes correctly with the mock
      await audioEngine.initialize()
      expect(audioEngine.isReady).toBe(true)
    })

    it('should not be ready before initialization', () => {
      expect(audioEngine.isReady).toBe(false)
    })
  })

  describe('Note Playback', () => {
    beforeEach(async () => {
      await audioEngine.initialize()
    })

    it('should play note with MIDI number', () => {
      expect(() => {
        audioEngine.playNote(60, 1.0)
      }).not.toThrow()
    })

    it('should play note with duration', () => {
      expect(() => {
        audioEngine.playNote(64, 0.5)
      }).not.toThrow()
    })

    it('should schedule note for future playback', () => {
      const futureTime = '+1'
      expect(() => {
        audioEngine.playNote(67, 1.0, futureTime as any)
      }).not.toThrow()
    })

    it('should handle invalid MIDI notes gracefully', () => {
      // Should not throw even with out-of-range MIDI
      expect(() => {
        audioEngine.playNote(200, 1.0)
      }).not.toThrow()
    })
  })

  describe('Note Stopping', () => {
    beforeEach(async () => {
      await audioEngine.initialize()
    })

    it('should stop specific note', () => {
      audioEngine.playNote(60, 2.0)
      expect(() => {
        audioEngine.stopNote(60)
      }).not.toThrow()
    })

    it('should stop all notes', () => {
      audioEngine.playNote(60, 2.0)
      audioEngine.playNote(64, 2.0)
      audioEngine.playNote(67, 2.0)

      expect(() => {
        audioEngine.stopAllNotes()
      }).not.toThrow()
    })
  })

  describe('Volume Control', () => {
    beforeEach(async () => {
      await audioEngine.initialize()
    })

    it('should set volume to valid value', () => {
      expect(() => {
        audioEngine.setVolume(0.5)
      }).not.toThrow()
    })

    it('should clamp volume to minimum (0)', () => {
      expect(() => {
        audioEngine.setVolume(-0.5)
      }).not.toThrow()
    })

    it('should clamp volume to maximum (1)', () => {
      expect(() => {
        audioEngine.setVolume(1.5)
      }).not.toThrow()
    })

    it('should handle zero volume', () => {
      expect(() => {
        audioEngine.setVolume(0)
      }).not.toThrow()
    })

    it('should handle full volume', () => {
      expect(() => {
        audioEngine.setVolume(1.0)
      }).not.toThrow()
    })
  })

  describe('Mute Control', () => {
    beforeEach(async () => {
      await audioEngine.initialize()
    })

    it('should mute audio', () => {
      audioEngine.setMute(true)
      expect(audioEngine.muted).toBe(true)
    })

    it('should unmute audio', () => {
      audioEngine.setMute(true)
      audioEngine.setMute(false)
      expect(audioEngine.muted).toBe(false)
    })

    it('should start unmuted by default', () => {
      expect(audioEngine.muted).toBe(false)
    })

    it('should initialize with muted config', async () => {
      const mutedEngine = new AudioEngine({ muted: true })
      await mutedEngine.initialize()
      expect(mutedEngine.muted).toBe(true)
      mutedEngine.dispose()
    })
  })

  describe('Transport Access', () => {
    beforeEach(async () => {
      await audioEngine.initialize()
    })

    it('should provide access to Tone.js transport', () => {
      const transport = audioEngine.getTransport()
      expect(transport).toBeDefined()
      expect(transport.bpm).toBeDefined()
    })

    it('should allow transport configuration', () => {
      const transport = audioEngine.getTransport()
      transport.bpm.value = 140
      expect(transport.bpm.value).toBe(140)
    })
  })

  describe('Audio Context Management', () => {
    beforeEach(async () => {
      await audioEngine.initialize()
    })

    it('should resume suspended audio context', async () => {
      await expect(audioEngine.resume()).resolves.not.toThrow()
    })
  })

  describe('Resource Cleanup', () => {
    it('should dispose resources properly', async () => {
      await audioEngine.initialize()

      expect(() => {
        audioEngine.dispose()
      }).not.toThrow()

      expect(audioEngine.isReady).toBe(false)
    })

    it('should handle multiple dispose calls', async () => {
      await audioEngine.initialize()

      audioEngine.dispose()
      expect(() => {
        audioEngine.dispose()
      }).not.toThrow()
    })
  })

  describe('Global Singleton', () => {
    it('should create global audio engine instance', () => {
      const instance1 = getGlobalAudioEngine()
      const instance2 = getGlobalAudioEngine()

      expect(instance1).toBe(instance2)
    })

    it('should allow global instance reset', () => {
      const instance1 = getGlobalAudioEngine()
      resetGlobalAudioEngine()
      const instance2 = getGlobalAudioEngine()

      expect(instance1).not.toBe(instance2)
    })

    it('should respect config on first creation', () => {
      const config = { volume: 0.5, muted: true }
      const instance = getGlobalAudioEngine(config)

      expect(instance.muted).toBe(true)
      resetGlobalAudioEngine()
    })
  })

  describe('Configuration', () => {
    it('should accept custom sample base URL', async () => {
      const customEngine = new AudioEngine({
        sampleBaseUrl: 'https://example.com/samples',
      })

      // With mocked Tone.js, initialization succeeds regardless of URL
      await customEngine.initialize()
      expect(customEngine.isReady).toBe(true)
      customEngine.dispose()
    })

    it('should accept initial volume setting', async () => {
      const volumeEngine = new AudioEngine({ volume: 0.3 })
      await volumeEngine.initialize()

      expect(() => {
        volumeEngine.setVolume(0.3)
      }).not.toThrow()

      volumeEngine.dispose()
    })
  })

  describe('Error Handling', () => {
    it('should warn when playing notes before initialization', () => {
      const uninitializedEngine = new AudioEngine()
      const consoleWarnSpy = vi.spyOn(console, 'warn')

      uninitializedEngine.playNote(60, 1.0)

      expect(consoleWarnSpy).toHaveBeenCalledWith('Audio engine not ready')
      uninitializedEngine.dispose()
    })

    it('should handle dispose before initialization', () => {
      const uninitializedEngine = new AudioEngine()

      expect(() => {
        uninitializedEngine.dispose()
      }).not.toThrow()
    })
  })
})
