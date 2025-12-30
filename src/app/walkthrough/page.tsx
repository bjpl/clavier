import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Mock data - replace with actual data source
const pieces = [
  { bwv: 846, title: 'Prelude and Fugue No. 1', key: 'C major', book: 'I' },
  { bwv: 847, title: 'Prelude and Fugue No. 2', key: 'C minor', book: 'I' },
  { bwv: 848, title: 'Prelude and Fugue No. 3', key: 'C♯ major', book: 'I' },
  { bwv: 849, title: 'Prelude and Fugue No. 4', key: 'C♯ minor', book: 'I' },
  { bwv: 850, title: 'Prelude and Fugue No. 5', key: 'D major', book: 'I' },
  { bwv: 851, title: 'Prelude and Fugue No. 6', key: 'D minor', book: 'I' },
]

export default function WalkthroughPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Walkthrough Mode</h1>
        <p className="text-muted-foreground text-lg">
          Explore Bach's Well-Tempered Clavier measure by measure with detailed theoretical commentary
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pieces.map((piece) => (
          <Card key={piece.bwv} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">BWV {piece.bwv}</CardTitle>
                  <CardDescription className="mt-1">{piece.key}</CardDescription>
                </div>
                <Badge variant="outline">Book {piece.book}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium">{piece.title}</p>
              <div className="flex gap-2">
                <Link
                  href={`/walkthrough/${piece.bwv}/prelude`}
                  className="flex-1 px-4 py-2 text-sm font-medium text-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Prelude
                </Link>
                <Link
                  href={`/walkthrough/${piece.bwv}/fugue`}
                  className="flex-1 px-4 py-2 text-sm font-medium text-center rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Fugue
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
