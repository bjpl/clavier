/**
 * useAudioEngine Hook
 * React hook for managing the audio engine lifecycle
 */

import { useEffect, useState, useRef } from 'react'
import { AudioEngine, getGlobalAudioEngine } from '@/lib/audio/audio-engine'
import { AudioEngineConfig } from '@/lib/audio/types'

interface UseAudioEngineReturn {
  engine: AudioEngine | null
  isReady: boolean
  isLoading: boolean
  error: Error | null
  initialize: () => Promise<void>
}

/**
 * Hook for managing audio engine initialization and state
 */
export function useAudioEngine(config?: Partial<AudioEngineConfig>): UseAudioEngineReturn {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const engineRef = useRef<AudioEngine | null>(null)
  const initializingRef = useRef(false)

  // Initialize engine instance
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = getGlobalAudioEngine(config)
    }

    return () => {
      // Don't dispose on unmount - keep global instance alive
      // Only dispose when page is closed
    }
  }, [config])

  /**
   * Initialize the audio engine
   * This should be called after user interaction to comply with browser autoplay policies
   */
  const initialize = async (): Promise<void> => {
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
      setIsReady(true)
      return
    }

    try {
      initializingRef.current = true
      setIsLoading(true)
      setError(null)

      console.log('Initializing audio engine...')
      await engineRef.current.initialize()

      setIsReady(true)
      console.log('Audio engine initialized successfully')
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error during initialization')
      setError(error)
      console.error('Failed to initialize audio engine:', error)
      throw error
    } finally {
      setIsLoading(false)
      initializingRef.current = false
    }
  }

  // Auto-initialize on mount (will be suspended until user interaction)
  useEffect(() => {
    const autoInit = async () => {
      try {
        await initialize()
      } catch (err) {
        // Expected to fail before user interaction
        console.log('Auto-initialization pending user interaction')
      }
    }

    autoInit()
  }, [])

  return {
    engine: engineRef.current,
    isReady,
    isLoading,
    error,
    initialize
  }
}

/**
 * Hook variant that automatically initializes on first user interaction
 */
export function useAutoInitAudioEngine(config?: Partial<AudioEngineConfig>): UseAudioEngineReturn {
  const result = useAudioEngine(config)
  const hasInteractedRef = useRef(false)

  useEffect(() => {
    if (hasInteractedRef.current || result.isReady) return

    const handleInteraction = async () => {
      if (hasInteractedRef.current) return

      hasInteractedRef.current = true
      console.log('User interaction detected, initializing audio...')

      try {
        await result.initialize()
      } catch (err) {
        console.error('Failed to auto-initialize audio:', err)
      }

      // Remove listeners after first interaction
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }

    // Listen for any user interaction
    document.addEventListener('click', handleInteraction)
    document.addEventListener('keydown', handleInteraction)
    document.addEventListener('touchstart', handleInteraction)

    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
  }, [result.isReady])

  return result
}
