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

interface PieceSelectorProps {
  currentBwv: number
  currentType: 'prelude' | 'fugue'
}

const pieces = [
  { bwv: 846, title: 'No. 1', key: 'C major', book: 'I' },
  { bwv: 847, title: 'No. 2', key: 'C minor', book: 'I' },
  { bwv: 848, title: 'No. 3', key: 'C♯ major', book: 'I' },
  { bwv: 849, title: 'No. 4', key: 'C♯ minor', book: 'I' },
  { bwv: 850, title: 'No. 5', key: 'D major', book: 'I' },
  { bwv: 851, title: 'No. 6', key: 'D minor', book: 'I' },
]

export function PieceSelector({ currentBwv, currentType }: PieceSelectorProps) {
  const router = useRouter()

  const handlePieceChange = (value: string) => {
    const [bwv, type] = value.split('-')
    router.push(`/walkthrough/${bwv}/${type}`)
  }

  const currentValue = `${currentBwv}-${currentType}`
  const currentPiece = pieces.find((p) => p.bwv === currentBwv)

  return (
    <div className="flex items-center gap-4">
      <Select value={currentValue} onValueChange={handlePieceChange}>
        <SelectTrigger className="w-[300px]">
          <SelectValue>
            {currentPiece && (
              <span>
                BWV {currentBwv} {currentPiece.title} - {currentPiece.key} -{' '}
                {currentType.charAt(0).toUpperCase() + currentType.slice(1)}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Book I</SelectLabel>
            {pieces
              .filter((p) => p.book === 'I')
              .map((piece) => (
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
        </SelectContent>
      </Select>
    </div>
  )
}
