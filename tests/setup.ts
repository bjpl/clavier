/**
 * Global Test Setup
 * Runs before all test suites
 */

import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Tone.js (audio library)
vi.mock('tone', () => {
  // Create a fresh mock instance each time
  const createVolumeInstance = () => {
    const instance = {
      toDestination: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
      volume: { value: 0 },
      mute: false,
      connect: vi.fn().mockReturnThis(),
    }
    // Make toDestination return the instance itself for chaining
    instance.toDestination = vi.fn(() => instance)
    return instance
  }

  const mockVolume = vi.fn().mockImplementation(() => createVolumeInstance())

  const mockSampler = vi.fn().mockImplementation((options) => {
    // Simulate successful load by calling onload if provided
    if (options?.onload) {
      setTimeout(() => options.onload(), 10)
    }
    return {
      triggerAttackRelease: vi.fn(),
      triggerAttack: vi.fn(),
      triggerRelease: vi.fn(),
      releaseAll: vi.fn(),
      connect: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
      loaded: true,
    }
  })

  const mockSynth = vi.fn().mockImplementation(() => ({
    triggerAttackRelease: vi.fn(),
    triggerAttack: vi.fn(),
    triggerRelease: vi.fn(),
    releaseAll: vi.fn(),
    connect: vi.fn().mockReturnThis(),
    chain: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
  }))

  const mockPolySynth = vi.fn().mockImplementation(() => ({
    triggerAttackRelease: vi.fn(),
    triggerAttack: vi.fn(),
    triggerRelease: vi.fn(),
    releaseAll: vi.fn(),
    connect: vi.fn().mockReturnThis(),
    chain: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
    maxPolyphony: 32,
  }))

  const mockReverb = vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
  }))

  const mockCompressor = vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
  }))

  const mockTransport = {
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    cancel: vi.fn(),
    clear: vi.fn(),
    schedule: vi.fn().mockReturnValue(1),
    scheduleOnce: vi.fn().mockReturnValue(1),
    scheduleRepeat: vi.fn().mockReturnValue(1),
    on: vi.fn(),
    off: vi.fn(),
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
    resume: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    currentTime: 0,
  }

  return {
    default: {
      Transport: mockTransport,
      Sampler: mockSampler,
      Synth: mockSynth,
      PolySynth: mockPolySynth,
      Volume: mockVolume,
      Reverb: mockReverb,
      Compressor: mockCompressor,
      context: mockContext,
      start: vi.fn().mockResolvedValue(undefined),
    },
    Transport: mockTransport,
    Sampler: mockSampler,
    Synth: mockSynth,
    PolySynth: mockPolySynth,
    Volume: mockVolume,
    Reverb: mockReverb,
    Compressor: mockCompressor,
    context: mockContext,
    start: vi.fn().mockResolvedValue(undefined),
  }
})

// Mock OpenSheetMusicDisplay
vi.mock('opensheetmusicdisplay', () => ({
  OpenSheetMusicDisplay: vi.fn(() => ({
    load: vi.fn(),
    render: vi.fn(),
    cursor: {
      show: vi.fn(),
      hide: vi.fn(),
      update: vi.fn(),
    },
    dispose: vi.fn(),
  })),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      }
    }
  },
})
