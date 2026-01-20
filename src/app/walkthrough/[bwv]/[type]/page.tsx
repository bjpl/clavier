import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { db } from '@/lib/db'
import { WalkthroughView } from '@/components/walkthrough/walkthrough-view'
import { Loader2 } from 'lucide-react'

/**
 * Fetch piece data from the database by BWV number and type
 */
async function getPieceData(bwv: string, type: string) {
  const bwvNumber = parseInt(bwv, 10)
  const pieceType = type.toUpperCase() as 'PRELUDE' | 'FUGUE'

  if (isNaN(bwvNumber)) {
    return null
  }

  try {
    // Find the piece by BWV number and type
    const piece = await db.piece.findFirst({
      where: {
        bwvNumber,
        type: pieceType,
      },
      include: {
        measures: {
          orderBy: { measureNumber: 'asc' },
          select: {
            measureNumber: true,
            beatCount: true,
          },
        },
        annotations: {
          orderBy: [{ measureStart: 'asc' }, { layer: 'asc' }],
          select: {
            id: true,
            annotationType: true,
            displayText: true,
            measureStart: true,
            measureEnd: true,
            layer: true,
          },
        },
      },
    })

    if (!piece) {
      return null
    }

    // Transform to the format expected by WalkthroughView
    const keyDescription = `${piece.keyTonic} ${piece.keyMode.toLowerCase()}`

    return {
      id: piece.id,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} in ${keyDescription}`,
      bwv: piece.bwvNumber,
      key: keyDescription,
      type: type as 'prelude' | 'fugue',
      totalMeasures: piece.totalMeasures || piece.measures.length,
      measures: piece.measures.map((m) => ({
        number: m.measureNumber,
        notes: [], // Notes are fetched per-measure as needed
        duration: m.beatCount,
      })),
      annotations: piece.annotations.map((a) => ({
        id: a.id,
        measureNumber: a.measureStart,
        type: a.annotationType,
        content: a.displayText,
      })),
    }
  } catch (error) {
    console.error('Error fetching piece data:', error)
    return null
  }
}

/**
 * Generate a fallback piece if database is not seeded
 * This allows development without database data
 */
function getFallbackPiece(bwv: string, type: string) {
  // Fallback data for common BWV numbers
  const fallbackPieces: Record<string, { totalMeasures: number; key: string }> = {
    '846': { totalMeasures: type === 'prelude' ? 35 : 27, key: 'C major' },
    '847': { totalMeasures: type === 'prelude' ? 24 : 29, key: 'C minor' },
    '848': { totalMeasures: type === 'prelude' ? 19 : 29, key: 'C# major' },
    '849': { totalMeasures: type === 'prelude' ? 39 : 115, key: 'C# minor' },
    '850': { totalMeasures: type === 'prelude' ? 35 : 27, key: 'D major' },
    '851': { totalMeasures: type === 'prelude' ? 33 : 27, key: 'D minor' },
    '852': { totalMeasures: type === 'prelude' ? 20 : 21, key: 'Eb major' },
    '853': { totalMeasures: type === 'prelude' ? 41 : 87, key: 'Eb minor / D# minor' },
    '854': { totalMeasures: type === 'prelude' ? 22 : 27, key: 'E major' },
    '855': { totalMeasures: type === 'prelude' ? 23 : 41, key: 'E minor' },
    '856': { totalMeasures: type === 'prelude' ? 19 : 29, key: 'F major' },
    '857': { totalMeasures: type === 'prelude' ? 18 : 41, key: 'F minor' },
    '858': { totalMeasures: type === 'prelude' ? 24 : 34, key: 'F# major' },
    '859': { totalMeasures: type === 'prelude' ? 19 : 27, key: 'F# minor' },
    '860': { totalMeasures: type === 'prelude' ? 19 : 30, key: 'G major' },
    '861': { totalMeasures: type === 'prelude' ? 34 : 34, key: 'G minor' },
    '862': { totalMeasures: type === 'prelude' ? 21 : 15, key: 'Ab major' },
    '863': { totalMeasures: type === 'prelude' ? 39 : 35, key: 'G# minor' },
    '864': { totalMeasures: type === 'prelude' ? 17 : 31, key: 'A major' },
    '865': { totalMeasures: type === 'prelude' ? 24 : 87, key: 'A minor' },
    '866': { totalMeasures: type === 'prelude' ? 18 : 31, key: 'Bb major' },
    '867': { totalMeasures: type === 'prelude' ? 38 : 76, key: 'Bb minor' },
    '868': { totalMeasures: type === 'prelude' ? 29 : 30, key: 'B major' },
    '869': { totalMeasures: type === 'prelude' ? 24 : 76, key: 'B minor' },
  }

  const fallback = fallbackPieces[bwv]
  if (!fallback) {
    return null
  }

  return {
    id: `fallback-${bwv}-${type}`, // Fallback ID for pieces without database entry
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} in ${fallback.key}`,
    bwv: parseInt(bwv, 10),
    key: fallback.key,
    type: type as 'prelude' | 'fugue',
    totalMeasures: fallback.totalMeasures,
    measures: Array.from({ length: fallback.totalMeasures }, (_, i) => ({
      number: i + 1,
      notes: [],
      duration: 4,
    })),
    annotations: [],
  }
}

interface PageProps {
  params: { bwv: string; type: string }
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

export default async function WalkthroughPiecePage({ params }: PageProps) {
  const { bwv, type } = params

  // Validate type parameter
  const normalizedType = type.toLowerCase()
  if (normalizedType !== 'prelude' && normalizedType !== 'fugue') {
    notFound()
  }

  // Try to fetch from database first
  let piece = await getPieceData(bwv, normalizedType)

  // Fall back to static data if database piece not found
  if (!piece) {
    piece = getFallbackPiece(bwv, normalizedType)
  }

  if (!piece) {
    notFound()
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <WalkthroughView
        piece={piece}
        measures={piece.measures}
        annotations={piece.annotations}
      />
    </Suspense>
  )
}

/**
 * Generate static params for all 48 preludes and fugues of WTC Book 1
 */
export async function generateStaticParams() {
  // Book 1 BWV numbers: 846-869
  const pieces = Array.from({ length: 24 }, (_, i) => (846 + i).toString())
  const types = ['prelude', 'fugue']

  return pieces.flatMap((bwv) =>
    types.map((type) => ({
      bwv,
      type,
    }))
  )
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PageProps) {
  const { bwv, type } = await params

  const fallback = getFallbackPiece(bwv, type)
  const title = fallback
    ? `BWV ${bwv} - ${fallback.title}`
    : `BWV ${bwv} - ${type.charAt(0).toUpperCase() + type.slice(1)}`

  return {
    title: `${title} | Clavier Walkthrough`,
    description: `Interactive walkthrough of J.S. Bach's ${title} from the Well-Tempered Clavier, with measure-by-measure analysis, playback, and educational commentary.`,
  }
}
