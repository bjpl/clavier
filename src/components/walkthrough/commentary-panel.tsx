'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, BookOpen, Search } from 'lucide-react'
import { TermTooltip } from './term-tooltip'
import { NarrationControls } from './narration-controls'

interface Measure {
  number: number
  notes: unknown[]
  duration: number
}

interface Annotation {
  id: string
  measureNumber: number
  type: string
  content: string
}

interface MeasureCommentary {
  text: string
  terms: string[]
  lessonId: string
  featureId: string
}

interface CommentaryPanelProps {
  measure: Measure
  commentary: MeasureCommentary
  annotations: Annotation[]
  onPlayMeasure: () => void
  onPlayInContext: () => void
  onLearnMore: (lessonId: string) => void
  onFindSimilar: (featureId: string) => void
}

export function CommentaryPanel({
  measure,
  commentary,
  annotations,
  onPlayMeasure,
  onPlayInContext,
  onLearnMore,
  onFindSimilar,
}: CommentaryPanelProps) {
  // Helper to highlight terms in text
  const renderTextWithTooltips = (text: string, terms: string[]) => {
    if (terms.length === 0) return text

    // Create a regex pattern to match all terms
    const pattern = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi')
    const parts = text.split(pattern)

    return parts.map((part, index) => {
      const isterm = terms.some(
        (term) => term.toLowerCase() === part.toLowerCase()
      )

      if (isterm) {
        return <TermTooltip key={index} term={part} />
      }

      return <span key={index}>{part}</span>
    })
  }

  return (
    <Card className="rounded-none border-x-0 border-b-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Commentary: Measure {measure.number}
          </CardTitle>
          <NarrationControls text={commentary.text} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="leading-relaxed">
            {renderTextWithTooltips(commentary.text, commentary.terms)}
          </p>
        </div>

        {annotations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Additional Notes:</h4>
            <ul className="space-y-1">
              {annotations.map((annotation) => (
                <li key={annotation.id} className="text-sm text-muted-foreground">
                  <span className="font-medium">{annotation.type}:</span>{' '}
                  {annotation.content}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button onClick={onPlayMeasure} variant="default" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Play Measure
          </Button>
          <Button onClick={onPlayInContext} variant="outline" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Play in Context
          </Button>
          <Button
            onClick={() => onLearnMore(commentary.lessonId)}
            variant="outline"
            size="sm"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Learn More
          </Button>
          <Button
            onClick={() => onFindSimilar(commentary.featureId)}
            variant="outline"
            size="sm"
          >
            <Search className="h-4 w-4 mr-2" />
            Find Similar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
