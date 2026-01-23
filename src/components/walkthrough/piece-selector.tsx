'use client'

import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface PieceInfo {
  bwv: number
  title: string
  key: string
  book: 'I' | 'II'
}

interface PieceSelectorProps {
  currentBwv: number
  currentType: 'prelude' | 'fugue'
  /** Optional custom pieces list. If not provided, uses all 24 Book 1 pieces (BWV 846-869) */
  pieces?: PieceInfo[]
}

/**
 * All 24 preludes and fugues of Well-Tempered Clavier Book 1 (BWV 846-869)
 * Each BWV number contains both a prelude and a fugue in the same key
 */
export const BOOK_1_PIECES: PieceInfo[] = [
  { bwv: 846, title: 'No. 1', key: 'C major', book: 'I' },
  { bwv: 847, title: 'No. 2', key: 'C minor', book: 'I' },
  { bwv: 848, title: 'No. 3', key: 'C-sharp major', book: 'I' },
  { bwv: 849, title: 'No. 4', key: 'C-sharp minor', book: 'I' },
  { bwv: 850, title: 'No. 5', key: 'D major', book: 'I' },
  { bwv: 851, title: 'No. 6', key: 'D minor', book: 'I' },
  { bwv: 852, title: 'No. 7', key: 'E-flat major', book: 'I' },
  { bwv: 853, title: 'No. 8', key: 'E-flat minor', book: 'I' },
  { bwv: 854, title: 'No. 9', key: 'E major', book: 'I' },
  { bwv: 855, title: 'No. 10', key: 'E minor', book: 'I' },
  { bwv: 856, title: 'No. 11', key: 'F major', book: 'I' },
  { bwv: 857, title: 'No. 12', key: 'F minor', book: 'I' },
  { bwv: 858, title: 'No. 13', key: 'F-sharp major', book: 'I' },
  { bwv: 859, title: 'No. 14', key: 'F-sharp minor', book: 'I' },
  { bwv: 860, title: 'No. 15', key: 'G major', book: 'I' },
  { bwv: 861, title: 'No. 16', key: 'G minor', book: 'I' },
  { bwv: 862, title: 'No. 17', key: 'A-flat major', book: 'I' },
  { bwv: 863, title: 'No. 18', key: 'G-sharp minor', book: 'I' },
  { bwv: 864, title: 'No. 19', key: 'A major', book: 'I' },
  { bwv: 865, title: 'No. 20', key: 'A minor', book: 'I' },
  { bwv: 866, title: 'No. 21', key: 'B-flat major', book: 'I' },
  { bwv: 867, title: 'No. 22', key: 'B-flat minor', book: 'I' },
  { bwv: 868, title: 'No. 23', key: 'B major', book: 'I' },
  { bwv: 869, title: 'No. 24', key: 'B minor', book: 'I' },
]

export function PieceSelector({ currentBwv, currentType, pieces }: PieceSelectorProps) {
  const router = useRouter()

  // Use provided pieces or default to all Book 1 pieces
  const pieceList = pieces ?? BOOK_1_PIECES

  const handlePieceChange = (value: string) => {
    const [bwv, type] = value.split('-')
    router.push(`/walkthrough/${bwv}/${type}`)
  }

  const currentValue = `${currentBwv}-${currentType}`
  const currentPiece = pieceList.find((p) => p.bwv === currentBwv)

  // Group pieces by book for display
  const bookIPieces = pieceList.filter((p) => p.book === 'I')
  const bookIIPieces = pieceList.filter((p) => p.book === 'II')

  return (
    <div className="flex items-center gap-4">
      <Select value={currentValue} onValueChange={handlePieceChange}>
        <SelectTrigger className="w-[320px]">
          <SelectValue>
            {currentPiece ? (
              <span>
                BWV {currentBwv} {currentPiece.title} - {currentPiece.key} -{' '}
                {currentType.charAt(0).toUpperCase() + currentType.slice(1)}
              </span>
            ) : (
              <span>
                BWV {currentBwv} - {currentType.charAt(0).toUpperCase() + currentType.slice(1)}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          {bookIPieces.length > 0 && (
            <SelectGroup>
              <SelectLabel>Book I - Well-Tempered Clavier</SelectLabel>
              {bookIPieces.map((piece) => (
                <div key={piece.bwv}>
                  <SelectItem value={`${piece.bwv}-prelude`}>
                    BWV {piece.bwv} {piece.title} - {piece.key} - Prelude
                  </SelectItem>
                  <SelectItem value={`${piece.bwv}-fugue`}>
                    BWV {piece.bwv} {piece.title} - {piece.key} - Fugue
                  </SelectItem>
                </div>
              ))}
            </SelectGroup>
          )}
          {bookIIPieces.length > 0 && (
            <SelectGroup>
              <SelectLabel>Book II - Well-Tempered Clavier</SelectLabel>
              {bookIIPieces.map((piece) => (
                <div key={piece.bwv}>
                  <SelectItem value={`${piece.bwv}-prelude`}>
                    BWV {piece.bwv} {piece.title} - {piece.key} - Prelude
                  </SelectItem>
                  <SelectItem value={`${piece.bwv}-fugue`}>
                    BWV {piece.bwv} {piece.title} - {piece.key} - Fugue
                  </SelectItem>
                </div>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
