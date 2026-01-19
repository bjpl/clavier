/**
 * useAudioEngine Hook
 * React hook for managing the audio engine lifecycle
 *
 * Features:
 * - Automatic state synchronization with AudioEngine
 * - User interaction detection for browser autoplay compliance
 * - Loading progress tracking
 * - Error handling and recovery
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  AudioEngine,
  AudioEngineState,
  AudioEngineCallbacks,
  getGlobalAudioEngine,
  resetGlobalAudioEngine,
  isWebAudioSupported
} from '@/lib/audio/audio-engine'
import { AudioEngineConfig } from '@/lib/audio/types'

export interface UseAudioEngineReturn {
  /** The audio engine instance */
  engine: AudioEngine | null
  /** Whether the engine is ready for playback */
  isReady: boolean
  /** Whether the engine is currently loading samples */
  isLoading: boolean
  /** Current engine state */
  state: AudioEngineState
  /** Whether using synthesizer fallback (samples failed to load) */
  isUsingSynthesizer: boolean
  /** Any error that occurred during initialization */
  error: Error | null
  /** Loading progress (0-1) */
  loadProgress: number
  /** Initialize the audio engine (requires user interaction) */
  initialize: () => Promise<void>
  /** Resume audio context if suspended */
  resume: () => Promise<void>
  /** Suspend audio context to save resources */
  suspend: () => Promise<void>
  /** Set master volume (0-1) */
  setVolume: (volume: number) => void
  /** Get current volume (0-1) */
  getVolume: () => number
  /** Toggle mute state */
  toggleMute: () => boolean
  /** Set mute state */
  setMute: (muted: boolean) => void
  /** Check if muted */
  isMuted: boolean
  /** Reset the audio engine completely */
  reset: () => void
  /** Whether Web Audio is supported in this browser */
  isSupported: boolean
}

/**
 * Hook for managing audio engine initialization and state
 *
 * @example
 * ```tsx
 * function AudioControls() {
 *   const {
 *     engine,
 *     isReady,
 *     isLoading,
 *     error,
 *     initialize
 *   } = useAudioEngine()
 *
 *   if (!isReady) {
 *     return (
 *       <button onClick={initialize} disabled={isLoading}>
 *         {isLoading ? 'Loading...' : 'Start Audio'}
 *       </button>
 *     )
 *   }
 *
 *   return <div>Audio ready!</div>
 * }
 * ```
 */
export function useAudioEngine(config?: Partial<AudioEngineConfig>): UseAudioEngineReturn {
  const [state, setState] = useState<AudioEngineState>('uninitialized')
  const [error, setError] = useState<Error | null>(null)
  const [loadProgress, setLoadProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isUsingSynthesizer, setIsUsingSynthesizer] = useState(false)

  const engineRef = useRef<AudioEngine | null>(null)
  const initializingRef = useRef(false)
  const configRef = useRef(config)

  // Check Web Audio support
  const isSupported = isWebAudioSupported()

  // Initialize engine instance
  useEffect(() => {
    if (!isSupported) {
      setError(new Error('Web Audio API is not supported in this browser'))
      setState('error')
      return
    }

    if (!engineRef.current) {
      engineRef.current = getGlobalAudioEngine(configRef.current)

      // Set up callbacks for state changes
      const callbacks: AudioEngineCallbacks = {
        onStateChange: (newState) => {
          setState(newState)
          if (newState === 'ready') {
            setIsUsingSynthesizer(engineRef.current?.isUsingSynthesizer ?? false)
          }
        },
        onLoadProgress: (progress) => {
          setLoadProgress(progress)
        },
        onError: (err) => {
          setError(err)
        }
      }

      engineRef.current.setCallbacks(callbacks)

      // Sync initial state
      setState(engineRef.current.getState())
      setIsMuted(engineRef.current.muted)
    }

    return () => {
      // Don't dispose on unmount - keep global instance alive
      // Only dispose when explicitly reset or page is closed
    }
  }, [isSupported])

  /**
   * Initialize the audio engine
   * This should be called after user interaction to comply with browser autoplay policies
   */
  const initialize = useCallback(async (): Promise<void> => {
    // Prevent multiple simultaneous initializations
    if (initializingRef.current) {
      console.log('Audio engine initialization already in progress')
      return
    }

    if (!engineRef.current) {
      const err = new Error('Audio engine not created')
      setError(err)
      throw err
    }

    if (engineRef.current.isReady) {
      console.log('Audio engine already initialized')
      setState('ready')
      return
    }

    try {
      initializingRef.current = true
      setError(null)
      setLoadProgress(0)

      console.log('Initializing audio engine...')
      await engineRef.current.initialize()

      setIsUsingSynthesizer(engineRef.current.isUsingSynthesizer)
      console.log('Audio engine initialized successfully')
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error during initialization')
      setError(error)
      console.error('Failed to initialize audio engine:', error)
      throw error
    } finally {
      initializingRef.current = false
    }
  }, [])

  /**
   * Resume audio context if suspended
   */
  const resume = useCallback(async (): Promise<void> => {
    if (engineRef.current) {
      await engineRef.current.resume()
    }
  }, [])

  /**
   * Suspend audio context to save resources
   */
  const suspend = useCallback(async (): Promise<void> => {
    if (engineRef.current) {
      await engineRef.current.suspend()
    }
  }, [])

  /**
   * Set master volume (0-1)
   */
  const setVolume = useCallback((volume: number): void => {
    if (engineRef.current) {
      engineRef.current.setVolume(volume)
    }
  }, [])

  /**
   * Get current volume (0-1)
   */
  const getVolume = useCallback((): number => {
    return engineRef.current?.getVolume() ?? 0.8
  }, [])

  /**
   * Toggle mute state
   */
  const toggleMute = useCallback((): boolean => {
    if (engineRef.current) {
      const newMuted = engineRef.current.toggleMute()
      setIsMuted(newMuted)
      return newMuted
    }
    return false
  }, [])

  /**
   * Set mute state
   */
  const setMute = useCallback((muted: boolean): void => {
    if (engineRef.current) {
      engineRef.current.setMute(muted)
      setIsMuted(muted)
    }
  }, [])

  /**
   * Reset the audio engine completely
   */
  const reset = useCallback((): void => {
    resetGlobalAudioEngine()
    engineRef.current = null
    setState('uninitialized')
    setError(null)
    setLoadProgress(0)
    setIsMuted(false)
    setIsUsingSynthesizer(false)
    initializingRef.current = false
  }, [])

  return {
    engine: engineRef.current,
    isReady: state === 'ready',
    isLoading: state === 'loading',
    state,
    isUsingSynthesizer,
    error,
    loadProgress,
    initialize,
    resume,
    suspend,
    setVolume,
    getVolume,
    toggleMute,
    setMute,
    isMuted,
    reset,
    isSupported
  }
}

/**
 * Hook variant that automatically initializes on first user interaction
 *
 * @example
 * ```tsx
 * function App() {
 *   const { isReady, isLoading } = useAutoInitAudioEngine()
 *
 *   return (
 *     <div>
 *       {!isReady && <div>Click anywhere to enable audio</div>}
 *       {isLoading && <div>Loading samples...</div>}
 *       <YourAppContent />
 *     </div>
 *   )
 * }
 * ```
 */
export function useAutoInitAudioEngine(config?: Partial<AudioEngineConfig>): UseAudioEngineReturn {
  const result = useAudioEngine(config)
  const hasInteractedRef = useRef(false)

  useEffect(() => {
    if (hasInteractedRef.current || result.isReady || !result.isSupported) return

    const handleInteraction = async () => {
      if (hasInteractedRef.current) return

      hasInteractedRef.current = true
      console.log('User interaction detected, initializing audio...')

      try {
        await result.initialize()
      } catch (err) {
        console.error('Failed to auto-initialize audio:', err)
        // Reset flag to allow retry
        hasInteractedRef.current = false
      }

      // Remove listeners after first successful interaction
      if (result.isReady) {
        removeListeners()
      }
    }

    const removeListeners = () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('mousedown', handleInteraction)
    }

    // Listen for any user interaction
    document.addEventListener('click', handleInteraction)
    document.addEventListener('keydown', handleInteraction)
    document.addEventListener('touchstart', handleInteraction)
    document.addEventListener('mousedown', handleInteraction)

    return removeListeners
  }, [result.isReady, result.isSupported, result.initialize])

  return result
}

/**
 * Hook for checking audio engine readiness without creating an instance
 * Useful for conditional rendering
 */
export function useAudioEngineReady(): boolean {
  const { isReady } = useAudioEngine()
  return isReady
}
