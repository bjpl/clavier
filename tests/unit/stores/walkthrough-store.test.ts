/**
 * Unit Tests: Walkthrough Store
 * Tests Zustand store state management for walkthrough mode
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWalkthroughStore } from '@/lib/stores/walkthrough-store'

// Mock zustand persist middleware to avoid localStorage issues in tests
vi.mock('zustand/middleware', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>
  return {
    ...actual,
    persist: (config: unknown) => config,
  }
})

describe('WalkthroughStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    const { result } = renderHook(() => useWalkthroughStore())
    act(() => {
      result.current.reset()
    })
  })

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      expect(result.current.currentPieceId).toBe(null)
      expect(result.current.currentMeasure).toBe(0)
      expect(result.current.autoAdvance).toBe(false)
      expect(result.current.narrationEnabled).toBe(true)
      expect(result.current.narrationAutoPlay).toBe(true)
      expect(result.current.visitedMeasures).toEqual([])
    })
  })

  describe('Piece Management', () => {
    it('should set piece and reset position', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('bwv-846')
      })

      expect(result.current.currentPieceId).toBe('bwv-846')
      expect(result.current.currentMeasure).toBe(0)
      expect(result.current.visitedMeasures).toContain(0)
    })

    it('should reset visited measures when setting new piece', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('bwv-846')
        result.current.setMeasure(5)
        result.current.setMeasure(10)
        result.current.setPiece('bwv-847') // New piece
      })

      expect(result.current.currentPieceId).toBe('bwv-847')
      expect(result.current.visitedMeasures).toEqual([0])
    })
  })

  describe('Measure Navigation', () => {
    it('should set measure and mark as visited', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('test-piece')
        result.current.setMeasure(5)
      })

      expect(result.current.currentMeasure).toBe(5)
      expect(result.current.visitedMeasures).toContain(5)
    })

    it('should go to next measure', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('test-piece')
        result.current.nextMeasure()
      })

      expect(result.current.currentMeasure).toBe(1)
      expect(result.current.visitedMeasures).toContain(1)
    })

    it('should go to previous measure', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('test-piece')
        result.current.setMeasure(5)
        result.current.prevMeasure()
      })

      expect(result.current.currentMeasure).toBe(4)
    })

    it('should not go below measure 0', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('test-piece')
        result.current.prevMeasure()
      })

      expect(result.current.currentMeasure).toBe(0)
    })

    it('should keep visited measures sorted', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('test-piece')
        result.current.setMeasure(5)
        result.current.setMeasure(2)
        result.current.setMeasure(8)
        result.current.setMeasure(3)
      })

      const visited = result.current.visitedMeasures
      const sortedVisited = [...visited].sort((a, b) => a - b)
      expect(visited).toEqual(sortedVisited)
    })

    it('should not duplicate visited measures', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('test-piece')
        result.current.setMeasure(5)
        result.current.setMeasure(5) // Same measure
        result.current.setMeasure(5) // Again
      })

      const fiveCount = result.current.visitedMeasures.filter(m => m === 5).length
      expect(fiveCount).toBe(1)
    })
  })

  describe('Visited Measures', () => {
    it('should mark measure as visited', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.markVisited(10)
      })

      expect(result.current.visitedMeasures).toContain(10)
    })

    it('should not duplicate when marking already visited measure', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.markVisited(5)
        result.current.markVisited(5)
      })

      const fiveCount = result.current.visitedMeasures.filter(m => m === 5).length
      expect(fiveCount).toBe(1)
    })

    it('should clear visited measures', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('test-piece')
        result.current.setMeasure(5)
        result.current.setMeasure(10)
        result.current.clearVisited()
      })

      expect(result.current.visitedMeasures).toEqual([])
    })
  })

  describe('Auto Advance Settings', () => {
    it('should toggle auto advance', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      expect(result.current.autoAdvance).toBe(false)

      act(() => {
        result.current.toggleAutoAdvance()
      })

      expect(result.current.autoAdvance).toBe(true)

      act(() => {
        result.current.toggleAutoAdvance()
      })

      expect(result.current.autoAdvance).toBe(false)
    })

    it('should set auto advance directly', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setAutoAdvance(true)
      })

      expect(result.current.autoAdvance).toBe(true)

      act(() => {
        result.current.setAutoAdvance(false)
      })

      expect(result.current.autoAdvance).toBe(false)
    })
  })

  describe('Narration Settings', () => {
    it('should toggle narration enabled', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      expect(result.current.narrationEnabled).toBe(true)

      act(() => {
        result.current.toggleNarration()
      })

      expect(result.current.narrationEnabled).toBe(false)
    })

    it('should set narration enabled directly', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setNarration(false)
      })

      expect(result.current.narrationEnabled).toBe(false)

      act(() => {
        result.current.setNarration(true)
      })

      expect(result.current.narrationEnabled).toBe(true)
    })

    it('should toggle narration auto play', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      expect(result.current.narrationAutoPlay).toBe(true)

      act(() => {
        result.current.toggleNarrationAutoPlay()
      })

      expect(result.current.narrationAutoPlay).toBe(false)
    })

    it('should set narration auto play directly', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setNarrationAutoPlay(false)
      })

      expect(result.current.narrationAutoPlay).toBe(false)
    })
  })

  describe('Reset Functions', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('test-piece')
        result.current.setMeasure(10)
        result.current.setAutoAdvance(true)
        result.current.setNarration(false)
        result.current.reset()
      })

      expect(result.current.currentPieceId).toBe(null)
      expect(result.current.currentMeasure).toBe(0)
      expect(result.current.autoAdvance).toBe(false)
      expect(result.current.narrationEnabled).toBe(true)
      expect(result.current.narrationAutoPlay).toBe(true)
      expect(result.current.visitedMeasures).toEqual([])
    })

    it('should reset piece position only', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('test-piece')
        result.current.setMeasure(10)
        result.current.setMeasure(15)
        result.current.setAutoAdvance(true)
        result.current.resetPiece()
      })

      // Position should reset
      expect(result.current.currentMeasure).toBe(0)
      expect(result.current.visitedMeasures).toEqual([0])

      // Settings should remain
      expect(result.current.autoAdvance).toBe(true)
      expect(result.current.currentPieceId).toBe('test-piece')
    })
  })

  describe('Selectors', () => {
    it('should select current position', async () => {
      const { useWalkthroughStore, selectCurrentPosition } = await import('@/lib/stores/walkthrough-store')
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('test-piece')
        result.current.setMeasure(7)
      })

      const position = selectCurrentPosition(result.current)
      expect(position).toEqual({
        pieceId: 'test-piece',
        measure: 7,
      })
    })

    it('should select settings', async () => {
      const { useWalkthroughStore, selectSettings } = await import('@/lib/stores/walkthrough-store')
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setAutoAdvance(true)
        result.current.setNarration(false)
        result.current.setNarrationAutoPlay(false)
      })

      const settings = selectSettings(result.current)
      expect(settings).toEqual({
        autoAdvance: true,
        narrationEnabled: false,
        narrationAutoPlay: false,
      })
    })

    it('should select progress', async () => {
      const { useWalkthroughStore, selectProgress } = await import('@/lib/stores/walkthrough-store')
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('test-piece')
        result.current.setMeasure(3)
        result.current.setMeasure(5)
        result.current.setMeasure(7)
      })

      const progress = selectProgress(result.current)
      expect(progress.visitedMeasures).toContain(0)
      expect(progress.visitedMeasures).toContain(3)
      expect(progress.visitedMeasures).toContain(5)
      expect(progress.visitedMeasures).toContain(7)
      expect(progress.totalVisited).toBe(4)
    })

    it('should check if measure has been visited', async () => {
      const { useWalkthroughStore, selectHasVisited } = await import('@/lib/stores/walkthrough-store')
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('test-piece')
        result.current.setMeasure(5)
      })

      const hasVisited5 = selectHasVisited(5)(result.current)
      const hasVisited10 = selectHasVisited(10)(result.current)

      expect(hasVisited5).toBe(true)
      expect(hasVisited10).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid measure changes', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('test-piece')
        for (let i = 0; i < 100; i++) {
          result.current.setMeasure(i)
        }
      })

      expect(result.current.currentMeasure).toBe(99)
      expect(result.current.visitedMeasures.length).toBe(100)
    })

    it('should handle setting same piece multiple times', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('test-piece')
        result.current.setMeasure(10)
        result.current.setPiece('test-piece') // Same piece
      })

      expect(result.current.currentMeasure).toBe(0)
      expect(result.current.visitedMeasures).toEqual([0])
    })

    it('should handle empty piece id', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('')
      })

      expect(result.current.currentPieceId).toBe('')
    })

    it('should handle very large measure numbers', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('test-piece')
        result.current.setMeasure(999999)
      })

      expect(result.current.currentMeasure).toBe(999999)
    })

    it('should handle negative measure input (via prevMeasure)', () => {
      const { result } = renderHook(() => useWalkthroughStore())

      act(() => {
        result.current.setPiece('test-piece')
        // Try to go below 0 multiple times
        result.current.prevMeasure()
        result.current.prevMeasure()
        result.current.prevMeasure()
      })

      expect(result.current.currentMeasure).toBe(0)
    })
  })
})
