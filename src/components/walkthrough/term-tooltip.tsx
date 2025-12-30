'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { ExternalLink, X } from 'lucide-react'

interface TermTooltipProps {
  term: string
}

// Mock definitions - replace with actual glossary data
const definitions: Record<string, { definition: string; glossaryId: string }> = {
  'broken chord': {
    definition:
      'A chord in which the notes are played in succession rather than simultaneously, creating an arpeggiated effect.',
    glossaryId: 'broken-chord',
  },
  arpeggiated: {
    definition:
      'Playing the notes of a chord in sequence, one after another, rather than simultaneously.',
    glossaryId: 'arpeggio',
  },
  'harmonic movement': {
    definition:
      'The progression from one chord to another, creating a sense of musical direction and tension/resolution.',
    glossaryId: 'harmonic-movement',
  },
  tonic: {
    definition:
      'The first note of a scale and the tonal center of a piece; the "home" note that provides stability.',
    glossaryId: 'tonic',
  },
}

export function TermTooltip({ term }: TermTooltipProps) {
  const termData = definitions[term.toLowerCase()]

  if (!termData) {
    return <span className="underline decoration-dotted">{term}</span>
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Store dismissed terms in user preferences
    console.log('Dismissed term:', term)
  }

  const handleGlossary = () => {
    // TODO: Navigate to glossary entry
    console.log('Open glossary:', termData.glossaryId)
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted cursor-help text-primary">
            {term}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs" side="top">
          <div className="space-y-2">
            <p className="text-sm">{termData.definition}</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleGlossary}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Glossary
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleDismiss}
              >
                <X className="h-3 w-3 mr-1" />
                I know this
              </Button>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
