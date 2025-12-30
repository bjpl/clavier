/**
 * Unit Tests: Playback Store
 * Tests Zustand store state management for playback controls
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePlaybackStore } from '@/lib/stores/playback-store'

describe('PlaybackStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    const { result } = renderHook(() => usePlaybackStore())
    act(() => {
      result.current.reset()
    })
  })

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => usePlaybackStore())

      expect(result.current.isPlaying).toBe(false)
      expect(result.current.currentPieceId).toBe(null)
      expect(result.current.currentMeasure).toBe(0)
      expect(result.current.currentBeat).toBe(0)
      expect(result.current.tempo).toBe(120)
      expect(result.current.tempoMultiplier).toBe(1.0)
      expect(result.current.volume).toBe(75)
      expect(result.current.isMuted).toBe(false)
      expect(result.current.loopEnabled).toBe(false)
      expect(result.current.activeNotes).toEqual([])
    })
  })

  describe('Playback Controls', () => {
    it('should start playback when play is called', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.play()
      })

      expect(result.current.isPlaying).toBe(true)
    })

    it('should pause playback when pause is called', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.play()
        result.current.pause()
      })

      expect(result.current.isPlaying).toBe(false)
    })

    it('should stop playback and reset position when stop is called', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.play()
        result.current.seek(5, 2)
        result.current.stop()
      })

      expect(result.current.isPlaying).toBe(false)
      expect(result.current.currentMeasure).toBe(0)
      expect(result.current.currentBeat).toBe(0)
    })
  })

  describe('Tempo Controls', () => {
    it('should set tempo within valid range', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setTempo(100)
      })

      expect(result.current.tempo).toBe(100)
    })

    it('should clamp tempo to minimum value', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setTempo(20)
      })

      expect(result.current.tempo).toBe(40)
    })

    it('should clamp tempo to maximum value', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setTempo(300)
      })

      expect(result.current.tempo).toBe(240)
    })

    it('should set tempo multiplier within valid range', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setTempoMultiplier(0.5)
      })

      expect(result.current.tempoMultiplier).toBe(0.5)
    })

    it('should clamp tempo multiplier to minimum value', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setTempoMultiplier(0.1)
      })

      expect(result.current.tempoMultiplier).toBe(0.25)
    })

    it('should clamp tempo multiplier to maximum value', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setTempoMultiplier(3.0)
      })

      expect(result.current.tempoMultiplier).toBe(2.0)
    })
  })

  describe('Volume Controls', () => {
    it('should set volume within valid range', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setVolume(50)
      })

      expect(result.current.volume).toBe(50)
    })

    it('should clamp volume to minimum value', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setVolume(-10)
      })

      expect(result.current.volume).toBe(0)
    })

    it('should clamp volume to maximum value', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setVolume(150)
      })

      expect(result.current.volume).toBe(100)
    })

    it('should toggle mute state', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.toggleMute()
      })

      expect(result.current.isMuted).toBe(true)

      act(() => {
        result.current.toggleMute()
      })

      expect(result.current.isMuted).toBe(false)
    })

    it('should set mute state directly', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setMuted(true)
      })

      expect(result.current.isMuted).toBe(true)
    })
  })

  describe('Loop Controls', () => {
    it('should enable loop with start and end points', () => {
      const { result } = renderHook(() => usePlaybackStore())

      const start = { measure: 1, beat: 0 }
      const end = { measure: 4, beat: 0 }

      act(() => {
        result.current.enableLoop(start, end)
      })

      expect(result.current.loopEnabled).toBe(true)
      expect(result.current.loopStart).toEqual(start)
      expect(result.current.loopEnd).toEqual(end)
    })

    it('should disable loop', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.enableLoop({ measure: 1, beat: 0 }, { measure: 4, beat: 0 })
        result.current.disableLoop()
      })

      expect(result.current.loopEnabled).toBe(false)
      expect(result.current.loopStart).toBe(null)
      expect(result.current.loopEnd).toBe(null)
    })

    it('should set loop start point', () => {
      const { result } = renderHook(() => usePlaybackStore())

      const start = { measure: 2, beat: 1 }

      act(() => {
        result.current.setLoopStart(start)
      })

      expect(result.current.loopStart).toEqual(start)
    })

    it('should set loop end point', () => {
      const { result } = renderHook(() => usePlaybackStore())

      const end = { measure: 5, beat: 3 }

      act(() => {
        result.current.setLoopEnd(end)
      })

      expect(result.current.loopEnd).toEqual(end)
    })
  })

  describe('Active Notes', () => {
    it('should add active note', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.addActiveNote(60)
      })

      expect(result.current.activeNotes).toContain(60)
    })

    it('should not add duplicate active notes', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.addActiveNote(60)
        result.current.addActiveNote(60)
      })

      expect(result.current.activeNotes).toEqual([60])
    })

    it('should remove active note', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.addActiveNote(60)
        result.current.addActiveNote(64)
        result.current.removeActiveNote(60)
      })

      expect(result.current.activeNotes).toEqual([64])
    })

    it('should clear all active notes', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.addActiveNote(60)
        result.current.addActiveNote(64)
        result.current.addActiveNote(67)
        result.current.clearActiveNotes()
      })

      expect(result.current.activeNotes).toEqual([])
    })
  })

  describe('Piece Management', () => {
    it('should set current piece and reset position', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.seek(5, 2)
        result.current.play()
        result.current.setPiece('piece-123')
      })

      expect(result.current.currentPieceId).toBe('piece-123')
      expect(result.current.currentMeasure).toBe(0)
      expect(result.current.currentBeat).toBe(0)
      expect(result.current.isPlaying).toBe(false)
    })

    it('should set piece with custom tempo', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setPiece('piece-456', 90)
      })

      expect(result.current.currentPieceId).toBe('piece-456')
      expect(result.current.tempo).toBe(90)
    })
  })

  describe('Seek Position', () => {
    it('should seek to specific measure', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.seek(10)
      })

      expect(result.current.currentMeasure).toBe(10)
      expect(result.current.currentBeat).toBe(0)
    })

    it('should seek to specific measure and beat', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.seek(10, 3)
      })

      expect(result.current.currentMeasure).toBe(10)
      expect(result.current.currentBeat).toBe(3)
    })

    it('should clear active notes when seeking', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.addActiveNote(60)
        result.current.seek(5)
      })

      expect(result.current.activeNotes).toEqual([])
    })
  })

  describe('Reset', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.play()
        result.current.setPiece('test-piece', 100)
        result.current.setVolume(50)
        result.current.setMuted(true)
        result.current.reset()
      })

      expect(result.current.isPlaying).toBe(false)
      expect(result.current.currentPieceId).toBe(null)
      expect(result.current.tempo).toBe(120)
      expect(result.current.volume).toBe(75)
      expect(result.current.isMuted).toBe(false)
    })
  })
})
