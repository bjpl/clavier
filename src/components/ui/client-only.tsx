'use client'

import { useEffect, useState, type ReactNode } from 'react'

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * ClientOnly wrapper that prevents hydration mismatches by not rendering
 * anything on the server. The children only render after the component
 * has mounted on the client.
 *
 * This is useful for components that depend on browser APIs or have
 * state that differs between server and client (like Zustand persist stores).
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
