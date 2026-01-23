'use client'

import { Loader2 } from 'lucide-react'
import { WalkthroughView } from './walkthrough-view'
import { useWalkthroughData } from '@/lib/hooks/use-walkthrough-data'

interface WalkthroughPageClientProps {
  bwv: string
  type: string
}

// Fallback data for when API returns no data
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
 * Client-side walkthrough page component.
 * Uses useWalkthroughData hook to fetch real piece data from the API,
 * with fallback to static data if the API returns nothing.
 */
export function WalkthroughPageClient({ bwv, type }: WalkthroughPageClientProps) {
  const normalizedType = type.toLowerCase() as 'prelude' | 'fugue'

  // Use the comprehensive data hook that fetches from API
  const {
    pieceId,
    piece: apiPiece,
    totalMeasures,
    isLoading,
    error,
  } = useWalkthroughData(bwv, normalizedType)

  // Show loading state while fetching
  if (isLoading) {
    return <LoadingState />
  }

  // Build piece data for WalkthroughView
  // Use API data if available, otherwise fall back to static data
  const fallback = fallbackPieces[bwv]
  const fallbackTotalMeasures = fallback?.totalMeasures[normalizedType] || 35

  const pieceData = {
    // Use real piece ID from API if available (enables MIDI, score, commentary)
    // Otherwise use a fallback ID (disables API features but shows basic UI)
    id: pieceId || `fallback-${bwv}-${normalizedType}`,
    title: apiPiece
      ? `${normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1)} in ${apiPiece.keyTonic} ${apiPiece.keyMode.toLowerCase()}`
      : `${normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1)} in ${fallback?.key || 'Unknown'}`,
    bwv: parseInt(bwv, 10),
    key: apiPiece
      ? `${apiPiece.keyTonic} ${apiPiece.keyMode.toLowerCase()}`
      : fallback?.key || 'Unknown',
    type: normalizedType,
    totalMeasures: totalMeasures || fallbackTotalMeasures,
    measures: Array.from({ length: totalMeasures || fallbackTotalMeasures }, (_, i) => ({
      number: i + 1,
      notes: [],
      duration: 4,
    })),
    annotations: [],
  }

  // Show error state only if both API failed AND no fallback exists
  if (error && !fallback) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Piece Not Found</h1>
          <p className="text-muted-foreground">
            BWV {bwv} {normalizedType} could not be loaded.
          </p>
        </div>
      </div>
    )
  }

  return (
    <WalkthroughView
      piece={pieceData}
      measures={pieceData.measures}
      annotations={pieceData.annotations}
    />
  )
}
