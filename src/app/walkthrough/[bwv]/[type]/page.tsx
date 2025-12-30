import { notFound } from 'next/navigation'
import { WalkthroughView } from '@/components/walkthrough/walkthrough-view'

// Mock data - replace with actual data fetching
async function getPieceData(bwv: string, type: string) {
  // Simulate data fetching
  const pieces = {
    '846': {
      prelude: {
        title: 'Prelude in C major',
        bwv: 846,
        key: 'C major',
        measures: Array.from({ length: 35 }, (_, i) => ({
          number: i + 1,
          notes: [],
          duration: 4,
        })),
        annotations: [],
      },
      fugue: {
        title: 'Fugue in C major',
        bwv: 846,
        key: 'C major',
        measures: Array.from({ length: 27 }, (_, i) => ({
          number: i + 1,
          notes: [],
          duration: 4,
        })),
        annotations: [],
      },
    },
  }

  const pieceKey = bwv as keyof typeof pieces
  const typeKey = type as 'prelude' | 'fugue'

  return pieces[pieceKey]?.[typeKey]
}

interface PageProps {
  params: Promise<{ bwv: string; type: string }>
}

export default async function WalkthroughPiecePage({ params }: PageProps) {
  const { bwv, type } = await params

  const piece = await getPieceData(bwv, type)

  if (!piece) {
    notFound()
  }

  return <WalkthroughView piece={piece} measures={piece.measures} annotations={piece.annotations} />
}

export async function generateStaticParams() {
  const pieces = ['846', '847', '848', '849', '850', '851']
  const types = ['prelude', 'fugue']

  return pieces.flatMap((bwv) =>
    types.map((type) => ({
      bwv,
      type,
    }))
  )
}
