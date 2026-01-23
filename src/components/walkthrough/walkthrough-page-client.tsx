'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { WalkthroughView } from './walkthrough-view'

interface PieceData {
  id: string
  title: string
  bwv: number
  key: string
  type: 'prelude' | 'fugue'
  totalMeasures: number
  measures: Array<{ number: number; notes: unknown[]; duration: number }>
  annotations: Array<{ id: string; measureNumber: number; type: string; content: string }>
}

interface WalkthroughPageClientProps {
  bwv: string
  type: string
}

// Fallback data for common BWV numbers
const fallbackPieces: Record<string, { totalMeasures: Record<string, number>; key: string }> = {
  '846': { totalMeasures: { prelude: 35, fugue: 27 }, key: 'C major' },
  '847': { totalMeasures: { prelude: 24, fugue: 29 }, key: 'C minor' },
  '848': { totalMeasures: { prelude: 19, fugue: 29 }, key: 'C# major' },
  '849': { totalMeasures: { prelude: 39, fugue: 115 }, key: 'C# minor' },
  '850': { totalMeasures: { prelude: 35, fugue: 27 }, key: 'D major' },
  '851': { totalMeasures: { prelude: 33, fugue: 27 }, key: 'D minor' },
  '852': { totalMeasures: { prelude: 20, fugue: 21 }, key: 'Eb major' },
  '853': { totalMeasures: { prelude: 41, fugue: 87 }, key: 'Eb minor / D# minor' },
  '854': { totalMeasures: { prelude: 22, fugue: 27 }, key: 'E major' },
  '855': { totalMeasures: { prelude: 23, fugue: 41 }, key: 'E minor' },
  '856': { totalMeasures: { prelude: 19, fugue: 29 }, key: 'F major' },
  '857': { totalMeasures: { prelude: 18, fugue: 41 }, key: 'F minor' },
  '858': { totalMeasures: { prelude: 24, fugue: 34 }, key: 'F# major' },
  '859': { totalMeasures: { prelude: 19, fugue: 27 }, key: 'F# minor' },
  '860': { totalMeasures: { prelude: 19, fugue: 30 }, key: 'G major' },
  '861': { totalMeasures: { prelude: 34, fugue: 34 }, key: 'G minor' },
  '862': { totalMeasures: { prelude: 21, fugue: 15 }, key: 'Ab major' },
  '863': { totalMeasures: { prelude: 39, fugue: 35 }, key: 'G# minor' },
  '864': { totalMeasures: { prelude: 17, fugue: 31 }, key: 'A major' },
  '865': { totalMeasures: { prelude: 24, fugue: 87 }, key: 'A minor' },
  '866': { totalMeasures: { prelude: 18, fugue: 31 }, key: 'Bb major' },
  '867': { totalMeasures: { prelude: 38, fugue: 76 }, key: 'Bb minor' },
  '868': { totalMeasures: { prelude: 29, fugue: 30 }, key: 'B major' },
  '869': { totalMeasures: { prelude: 24, fugue: 76 }, key: 'B minor' },
}

function getFallbackPiece(bwv: string, type: string): PieceData | null {
  const fallback = fallbackPieces[bwv]
  if (!fallback) {
    return null
  }

  const normalizedType = type.toLowerCase() as 'prelude' | 'fugue'
  const totalMeasures = fallback.totalMeasures[normalizedType]

  return {
    id: `fallback-${bwv}-${type}`,
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} in ${fallback.key}`,
    bwv: parseInt(bwv, 10),
    key: fallback.key,
    type: normalizedType,
    totalMeasures,
    measures: Array.from({ length: totalMeasures }, (_, i) => ({
      number: i + 1,
      notes: [],
      duration: 4,
    })),
    annotations: [],
  }
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading walkthrough...</p>
      </div>
    </div>
  )
}

/**
 * Fully client-side walkthrough page component.
 * This prevents any hydration mismatches by not rendering during SSR.
 */
export function WalkthroughPageClient({ bwv, type }: WalkthroughPageClientProps) {
  const [piece, setPiece] = useState<PieceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get fallback data on client side only
    const normalizedType = type.toLowerCase()
    if (normalizedType !== 'prelude' && normalizedType !== 'fugue') {
      setError('Invalid piece type')
      setIsLoading(false)
      return
    }

    const fallbackPiece = getFallbackPiece(bwv, normalizedType)
    if (!fallbackPiece) {
      setError('Piece not found')
      setIsLoading(false)
      return
    }

    setPiece(fallbackPiece)
    setIsLoading(false)
  }, [bwv, type])

  if (isLoading) {
    return <LoadingState />
  }

  if (error || !piece) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Piece Not Found</h1>
          <p className="text-muted-foreground">{error || 'The requested piece could not be found.'}</p>
        </div>
      </div>
    )
  }

  return (
    <WalkthroughView
      piece={piece}
      measures={piece.measures}
      annotations={piece.annotations}
    />
  )
}
