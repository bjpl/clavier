'use client'

import { useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSimilarPatterns } from '@/lib/hooks/use-walkthrough-data'
import { Loader2, ExternalLink, Music } from 'lucide-react'

interface SimilarPatternsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  featureId: string | null
  currentPieceId?: string
  onNavigate: (pieceId: string, measureStart: number) => void
}

export function SimilarPatternsModal({
  open,
  onOpenChange,
  featureId,
  currentPieceId,
  onNavigate,
}: SimilarPatternsModalProps) {
  const { patterns, total, isLoading, error } = useSimilarPatterns(
    open ? featureId : null,
    20
  )

  const handleNavigate = useCallback(
    (pieceId: string, measureStart: number) => {
      onNavigate(pieceId, measureStart)
    },
    [onNavigate]
  )

  // Filter out the current piece if provided
  const filteredPatterns = currentPieceId
    ? patterns.filter((p) => p.pieceId !== currentPieceId)
    : patterns

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Similar Patterns</DialogTitle>
          <DialogDescription>
            Found {total} similar patterns across the Well-Tempered Clavier
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Finding similar patterns...
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Failed to load similar patterns.</p>
              <p className="text-sm">Please try again later.</p>
            </div>
          ) : filteredPatterns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No similar patterns found in other pieces.</p>
              <p className="text-sm">
                This pattern appears to be unique to this piece.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPatterns.map((pattern, index) => (
                <div
                  key={`${pattern.pieceId}-${pattern.measureStart}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">BWV {pattern.bwvNumber}</span>
                      <Badge variant="outline" className="text-xs">
                        {pattern.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Measures {pattern.measureStart}
                      {pattern.measureEnd !== pattern.measureStart &&
                        ` - ${pattern.measureEnd}`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleNavigate(pattern.pieceId, pattern.measureStart)
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredPatterns.length > 0 && (
          <div className="pt-4 border-t text-sm text-muted-foreground text-center">
            Showing {filteredPatterns.length} of {total} patterns
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
