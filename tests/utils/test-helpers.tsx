/**
 * Test Utility Functions
 * Reusable helpers for testing
 */

import { ReactElement } from 'react'
import { render, RenderOptions, screen, within, waitFor as rtlWaitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, expect } from 'vitest'

/**
 * Custom render function with providers
 * Wrap components with necessary providers for testing
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Add providers here as needed (e.g., QueryClientProvider, ThemeProvider)
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Wait for a condition to be true
 * Useful for testing async state changes
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 3000,
  interval = 50
): Promise<void> {
  const startTime = Date.now()

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition')
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
}

/**
 * Create mock MIDI note data
 */
export function createMockNote(note: number, duration: number = 1.0) {
  return {
    midi: note,
    duration,
    time: 0,
    velocity: 0.8,
  }
}

/**
 * Create mock measure data
 */
export function createMockMeasure(number: number) {
  return {
    id: `measure-${number}`,
    pieceId: 'test-piece',
    measureNumber: number,
    timeSignature: '4/4',
    keySignature: 'C',
  }
}

/**
 * Create mock piece data
 */
export function createMockPiece(bwv: string = 'BWV 846') {
  return {
    id: 'test-piece',
    bwv,
    title: 'Test Prelude',
    composer: 'J.S. Bach',
    difficulty: 3,
    measures: 35,
  }
}

/**
 * Simulate user delay (for realistic interactions)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate range of numbers
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * Mock audio context for testing
 */
export function createMockAudioContext() {
  return {
    state: 'running',
    currentTime: 0,
    destination: {},
    sampleRate: 44100,
    createGain: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: { value: 1 },
    })),
    createOscillator: vi.fn(() => ({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 440 },
    })),
  }
}

/**
 * Assert element has CSS class
 */
export function expectToHaveClass(element: Element, className: string) {
  expect(element.classList.contains(className)).toBe(true)
}

/**
 * Assert element does not have CSS class
 */
export function expectNotToHaveClass(element: Element, className: string) {
  expect(element.classList.contains(className)).toBe(false)
}

/**
 * Get element by data-testid
 */
export function getByTestId(testId: string): HTMLElement | null {
  return document.querySelector(`[data-testid="${testId}"]`)
}

/**
 * Create mock keyboard event
 */
export function createKeyboardEvent(
  key: string,
  options: Partial<KeyboardEvent> = {}
): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    key,
    code: key,
    bubbles: true,
    cancelable: true,
    ...options,
  })
}

/**
 * Create mock mouse event
 */
export function createMouseEvent(
  type: string,
  options: Partial<MouseEvent> = {}
): MouseEvent {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  })
}

/**
 * Re-export commonly used testing utilities
 */
export { screen, within, rtlWaitFor, userEvent, vi, expect }
