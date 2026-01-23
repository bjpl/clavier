import { notFound } from 'next/navigation'
import { WalkthroughPageClient } from '@/components/walkthrough/walkthrough-page-client'

interface PageProps {
  params: { bwv: string; type: string }
}

/**
 * Walkthrough page that delegates entirely to client-side rendering.
 * This prevents any hydration mismatches by having no server-rendered content
 * that depends on dynamic data or client state.
 */
export default function WalkthroughPiecePage({ params }: PageProps) {
  const { bwv, type } = params

  // Validate type parameter on server
  const normalizedType = type.toLowerCase()
  if (normalizedType !== 'prelude' && normalizedType !== 'fugue') {
    notFound()
  }

  // Validate BWV range (Book 1: 846-869)
  const bwvNum = parseInt(bwv, 10)
  if (isNaN(bwvNum) || bwvNum < 846 || bwvNum > 869) {
    notFound()
  }

  // Delegate entirely to client component - no server data fetching
  return <WalkthroughPageClient bwv={bwv} type={normalizedType} />
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

// Key signatures for Book 1 (BWV 846-869) for metadata
const keySignatures: Record<string, string> = {
  '846': 'C major', '847': 'C minor', '848': 'C# major', '849': 'C# minor',
  '850': 'D major', '851': 'D minor', '852': 'Eb major', '853': 'Eb minor',
  '854': 'E major', '855': 'E minor', '856': 'F major', '857': 'F minor',
  '858': 'F# major', '859': 'F# minor', '860': 'G major', '861': 'G minor',
  '862': 'Ab major', '863': 'G# minor', '864': 'A major', '865': 'A minor',
  '866': 'Bb major', '867': 'Bb minor', '868': 'B major', '869': 'B minor',
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PageProps) {
  const { bwv, type } = params
  const normalizedType = type.toLowerCase()
  const key = keySignatures[bwv] || ''
  const pieceType = normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1)
  const title = key ? `${pieceType} in ${key}` : pieceType

  return {
    title: `BWV ${bwv} - ${title} | Clavier Walkthrough`,
    description: `Interactive walkthrough of J.S. Bach's BWV ${bwv} ${title} from the Well-Tempered Clavier, with measure-by-measure analysis, playback, and educational commentary.`,
  }
}
