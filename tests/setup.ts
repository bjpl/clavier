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
  const mockVolume = function() {
    return {
      toDestination: vi.fn(),
      dispose: vi.fn(),
      volume: { value: 0 },
      mute: false,
    }
  }

  const mockSampler = function() {
    return {
      triggerAttackRelease: vi.fn(),
      triggerRelease: vi.fn(),
      releaseAll: vi.fn(),
      connect: vi.fn(),
      dispose: vi.fn(),
    }
  }

  return {
    default: {
      Transport: {
        start: vi.fn(),
        stop: vi.fn(),
        pause: vi.fn(),
        bpm: { value: 120 },
      },
      Sampler: mockSampler,
      Volume: mockVolume,
      context: {
        state: 'running',
      },
      start: vi.fn(),
    },
    Transport: {
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      bpm: { value: 120 },
    },
    Sampler: mockSampler,
    Volume: mockVolume,
    context: {
      state: 'running',
    },
    start: vi.fn(),
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
