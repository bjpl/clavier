import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/db'

interface GroupedPiece {
  bwv: number;
  title: string;
  key: string;
  book: string;
  numberInBook: number;
  hasPrelude: boolean;
  hasFugue: boolean;
}

async function getPieces(): Promise<GroupedPiece[]> {
  const pieces = await db.piece.findMany({
    orderBy: [
      { book: 'asc' },
      { numberInBook: 'asc' },
      { type: 'asc' }, // PRELUDE comes before FUGUE alphabetically
    ],
    select: {
      bwvNumber: true,
      book: true,
      numberInBook: true,
      type: true,
      keyTonic: true,
      keyMode: true,
    },
  });

  // Group pieces by book and number, using Prelude's BWV number
  const groupedMap = new Map<string, GroupedPiece>();

  pieces.forEach(piece => {
    const key = `${piece.book}-${piece.numberInBook}`;
    const keyName = `${piece.keyTonic} ${piece.keyMode.toLowerCase()}`;
    const romanBook = piece.book === 1 ? 'I' : 'II';

    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        bwv: piece.bwvNumber,
        title: `Prelude and Fugue No. ${piece.numberInBook}`,
        key: keyName,
        book: romanBook,
        numberInBook: piece.numberInBook,
        hasPrelude: false,
        hasFugue: false,
      });
    }

    const grouped = groupedMap.get(key)!;
    if (piece.type === 'PRELUDE') {
      grouped.hasPrelude = true;
      // Use Prelude's BWV number for the group
      grouped.bwv = piece.bwvNumber;
    } else if (piece.type === 'FUGUE') {
      grouped.hasFugue = true;
    }
  });

  return Array.from(groupedMap.values());
}

export default async function WalkthroughPage() {
  const pieces = await getPieces();
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
