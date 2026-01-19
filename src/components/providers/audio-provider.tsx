'use client'

/**
 * Audio Provider
 * Provides app-wide audio engine context for MIDI playback and piano sounds
 *
 * Features:
 * - Centralized audio engine initialization
 * - Auto-initialization on first user interaction
 * - Loading state tracking
 * - Error handling and recovery
 * - Volume and mute controls
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef
} from 'react'
import {
  AudioEngine,
  AudioEngineState,
  getGlobalAudioEngine,
  resetGlobalAudioEngine,
  isWebAudioSupported
} from '@/lib/audio/audio-engine'
import { AudioEngineConfig } from '@/lib/audio/types'

/**
 * Audio context value interface
 */
export interface AudioContextValue {
  /** Audio engine instance (null if not initialized) */
  engine: AudioEngine | null
  /** Whether the engine is ready for playback */
  isReady: boolean
  /** Whether the engine is loading samples */
  isLoading: boolean
  /** Current engine state */
  state: AudioEngineState
  /** Whether using synthesizer fallback */
  isUsingSynthesizer: boolean
  /** Any initialization error */
  error: Error | null
  /** Whether Web Audio is supported */
  isSupported: boolean
  /** Current volume (0-1) */
  volume: number
  /** Whether audio is muted */
  isMuted: boolean
  /** Initialize audio (usually auto-called on interaction) */
  initialize: () => Promise<void>
  /** Set volume level (0-1) */
  setVolume: (volume: number) => void
  /** Toggle mute state */
  toggleMute: () => void
  /** Set mute state */
  setMute: (muted: boolean) => void
  /** Resume audio context (after tab becomes visible) */
  resume: () => Promise<void>
  /** Suspend audio context (to save resources) */
  suspend: () => Promise<void>
  /** Reset audio engine completely */
  reset: () => void
}

/**
 * Audio provider props
 */
export interface AudioProviderProps {
  children: React.ReactNode
  /** Audio engine configuration */
  config?: Partial<AudioEngineConfig>
  /** Whether to auto-initialize on first user interaction */
  autoInit?: boolean
  /** Custom initialization trigger (default: any user interaction) */
  initTrigger?: 'click' | 'keydown' | 'any'
}

// Create context with null default
const AudioContext = createContext<AudioContextValue | null>(null)

/**
 * Audio Provider Component
 *
 * Wrap your app with this provider to enable audio functionality throughout.
 *
 * @example
 * ```tsx
 * // In your app layout
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AudioProvider autoInit>
 *           {children}
 *         </AudioProvider>
 *       </body>
 *     </html>
 *   )
 * }
 *
 * // In any component
 * function PlayButton() {
 *   const { engine, isReady } = useAudio()
 *
 *   if (!isReady) return <button disabled>Loading...</button>
 *
 *   return (
 *     <button onClick={() => engine?.playNote(60, 0.5)}>
 *       Play Middle C
 *     </button>
 *   )
 * }
 * ```
 */
export function AudioProvider({
  children,
  config,
  autoInit = true,
  initTrigger = 'any'
}: AudioProviderProps) {
  // State
  const [state, setState] = useState<AudioEngineState>('uninitialized')
  const [error, setError] = useState<Error | null>(null)
  const [volume, setVolumeState] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isUsingSynthesizer, setIsUsingSynthesizer] = useState(false)

  // Refs
  const engineRef = useRef<AudioEngine | null>(null)
  const initializingRef = useRef(false)
  const hasInteractedRef = useRef(false)
  const configRef = useRef(config)

  // Check Web Audio support
  const isSupported = useMemo(() => isWebAudioSupported(), [])

  // Initialize engine instance (lazy)
  const getEngine = useCallback(() => {
    if (!isSupported) return null

    if (!engineRef.current) {
      engineRef.current = getGlobalAudioEngine(configRef.current)

      // Set up callbacks
      engineRef.current.setCallbacks({
        onStateChange: (newState) => {
          setState(newState)
          if (newState === 'ready') {
            setIsUsingSynthesizer(engineRef.current?.isUsingSynthesizer ?? false)
          }
        },
        onError: (err) => {
          setError(err)
        }
      })

      // Sync initial state
      setState(engineRef.current.getState())
      setIsMuted(engineRef.current.muted)
    }

    return engineRef.current
  }, [isSupported])

  /**
   * Initialize audio engine
   */
  const initialize = useCallback(async () => {
    if (initializingRef.current) {
      console.log('Audio initialization already in progress')
      return
    }

    const engine = getEngine()
    if (!engine) {
      setError(new Error('Web Audio API is not supported'))
      setState('error')
      return
    }

    if (engine.isReady) {
      console.log('Audio engine already initialized')
      setState('ready')
      return
    }

    try {
      initializingRef.current = true
      setError(null)

      console.log('Initializing audio engine...')
      await engine.initialize()

      setIsUsingSynthesizer(engine.isUsingSynthesizer)
      console.log(`Audio engine ready (using ${engine.isUsingSynthesizer ? 'synthesizer' : 'samples'})`)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Audio initialization failed')
      setError(error)
      console.error('Audio initialization error:', error)
    } finally {
      initializingRef.current = false
    }
  }, [getEngine])

  /**
   * Set volume level
   */
  const setVolume = useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clamped)
    engineRef.current?.setVolume(clamped)
  }, [])

  /**
   * Toggle mute state
   */
  const toggleMute = useCallback(() => {
    if (engineRef.current) {
      const newMuted = engineRef.current.toggleMute()
      setIsMuted(newMuted)
    }
  }, [])

  /**
   * Set mute state
   */
  const setMute = useCallback((muted: boolean) => {
    setIsMuted(muted)
    engineRef.current?.setMute(muted)
  }, [])

  /**
   * Resume audio context
   */
  const resume = useCallback(async () => {
    if (engineRef.current) {
      await engineRef.current.resume()
    }
  }, [])

  /**
   * Suspend audio context
   */
  const suspend = useCallback(async () => {
    if (engineRef.current) {
      await engineRef.current.suspend()
    }
  }, [])

  /**
   * Reset audio engine completely
   */
  const reset = useCallback(() => {
    resetGlobalAudioEngine()
    engineRef.current = null
    setState('uninitialized')
    setError(null)
    setIsUsingSynthesizer(false)
    initializingRef.current = false
    hasInteractedRef.current = false
  }, [])

  // Auto-initialize on user interaction
  useEffect(() => {
    if (!autoInit || !isSupported || state === 'ready') return

    const handleInteraction = async () => {
      if (hasInteractedRef.current) return

      hasInteractedRef.current = true
      console.log('User interaction detected, initializing audio...')

      try {
        await initialize()
      } catch {
        // Reset flag to allow retry
        hasInteractedRef.current = false
      }
    }

    const events: Array<keyof DocumentEventMap> = []

    if (initTrigger === 'any') {
      events.push('click', 'keydown', 'touchstart', 'mousedown')
    } else if (initTrigger === 'click') {
      events.push('click', 'touchstart', 'mousedown')
    } else if (initTrigger === 'keydown') {
      events.push('keydown')
    }

    events.forEach(event => {
      document.addEventListener(event, handleInteraction)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction)
      })
    }
  }, [autoInit, isSupported, state, initialize, initTrigger])

  // Handle visibility change (resume when tab becomes visible)
  useEffect(() => {
    if (!isSupported) return

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && state === 'ready') {
        await resume()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isSupported, state, resume])

  // Context value
  const contextValue = useMemo<AudioContextValue>(() => ({
    engine: engineRef.current,
    isReady: state === 'ready',
    isLoading: state === 'loading',
    state,
    isUsingSynthesizer,
    error,
    isSupported,
    volume,
    isMuted,
    initialize,
    setVolume,
    toggleMute,
    setMute,
    resume,
    suspend,
    reset
  }), [
    state,
    isUsingSynthesizer,
    error,
    isSupported,
    volume,
    isMuted,
    initialize,
    setVolume,
    toggleMute,
    setMute,
    resume,
    suspend,
    reset
  ])

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  )
}

/**
 * Hook to access audio context
 *
 * Must be used within an AudioProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { engine, isReady, isLoading, error } = useAudio()
 *
 *   if (error) return <div>Audio error: {error.message}</div>
 *   if (isLoading) return <div>Loading audio...</div>
 *   if (!isReady) return <div>Click anywhere to enable audio</div>
 *
 *   return <div>Audio ready!</div>
 * }
 * ```
 */
export function useAudio(): AudioContextValue {
  const context = useContext(AudioContext)

  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }

  return context
}

/**
 * Hook that returns the audio engine only when ready
 * Returns null if not ready, loading, or error
 */
export function useAudioEngine(): AudioEngine | null {
  const { engine, isReady } = useAudio()
  return isReady ? engine : null
}

/**
 * Hook for audio readiness state only
 */
export function useAudioReady(): boolean {
  const { isReady } = useAudio()
  return isReady
}

/**
 * Hook for audio loading state
 */
export function useAudioLoading(): { isLoading: boolean; error: Error | null } {
  const { isLoading, error } = useAudio()
  return { isLoading, error }
}

/**
 * Hook for volume controls
 */
export function useAudioVolume(): {
  volume: number
  isMuted: boolean
  setVolume: (volume: number) => void
  toggleMute: () => void
  setMute: (muted: boolean) => void
} {
  const { volume, isMuted, setVolume, toggleMute, setMute } = useAudio()
  return { volume, isMuted, setVolume, toggleMute, setMute }
}
