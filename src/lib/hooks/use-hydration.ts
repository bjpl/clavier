/**
 * Hydration hook for Zustand stores with persist middleware
 *
 * This hook prevents hydration mismatches and infinite re-render loops by:
 * 1. Using a global singleton to ensure rehydration happens ONCE
 * 2. All components share the same hydration promise
 * 3. State updates are batched, preventing cascading re-renders
 *
 * Works with stores that have skipHydration: true in their persist config.
 */

import { useEffect, useSyncExternalStore } from 'react'
import { useViewStore } from '@/lib/stores/view-store'
import { useWalkthroughStore } from '@/lib/stores/walkthrough-store'

// Global hydration state - shared across all components
let globalHydrated = false
let hydrationPromise: Promise<void> | null = null
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return globalHydrated
}

function getServerSnapshot() {
  return false // Always false on server
}

// Maximum time to wait for hydration before proceeding anyway
const HYDRATION_TIMEOUT_MS = 5000

/**
 * Trigger hydration once globally
 * Returns a promise that resolves when all stores are hydrated OR timeout is reached
 * This prevents infinite loading if localStorage is corrupted or rehydration hangs
 */
function triggerHydration(): Promise<void> {
  if (hydrationPromise) {
    return hydrationPromise
  }

  if (globalHydrated) {
    return Promise.resolve()
  }

  // Create a timeout promise that resolves (not rejects) after HYDRATION_TIMEOUT_MS
  // This ensures we don't hang forever if rehydration fails
  const timeoutPromise = new Promise<void>((resolve) => {
    setTimeout(() => {
      console.warn(`[useHydrated] Hydration timeout after ${HYDRATION_TIMEOUT_MS}ms, proceeding with defaults`)
      resolve()
    }, HYDRATION_TIMEOUT_MS)
  })

  // Create the actual rehydration promise
  const rehydrationPromise = (async () => {
    try {
      // Rehydrate all stores in parallel
      await Promise.all([
        useViewStore.persist.rehydrate(),
        useWalkthroughStore.persist.rehydrate(),
      ])
    } catch (error) {
      console.error('Store rehydration failed:', error)
      // Don't throw - we'll use default values
    }
  })()

  // Race between rehydration and timeout - whichever finishes first wins
  hydrationPromise = Promise.race([rehydrationPromise, timeoutPromise]).then(() => {
    globalHydrated = true
    // Notify all subscribers
    listeners.forEach((listener) => listener())
  })

  return hydrationPromise
}

/**
 * Returns true only after the component has mounted on the client
 * AND all Zustand stores with persist middleware have been rehydrated.
 *
 * Uses useSyncExternalStore for proper concurrent React support and
 * a global singleton to ensure rehydration happens exactly once.
 */
export function useHydrated(): boolean {
  // Use useSyncExternalStore for concurrent-safe subscription
  const hydrated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    // Trigger hydration on first mount (will be a no-op if already triggered)
    triggerHydration()
  }, [])

  return hydrated
}

/**
 * Returns the store value only after hydration, otherwise returns the fallback.
 * This prevents hydration mismatches when using Zustand persist middleware.
 */
export function useHydratedValue<T>(storeValue: T, fallback: T): T {
  const hydrated = useHydrated()
  return hydrated ? storeValue : fallback
}

/**
 * Reset hydration state (useful for testing)
 */
export function resetHydration(): void {
  globalHydrated = false
  hydrationPromise = null
  listeners.clear()
}
