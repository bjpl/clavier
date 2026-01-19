'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { ExternalLink, X, Loader2 } from 'lucide-react'
import { useGlossaryTerm } from '@/lib/hooks/use-walkthrough-data'

interface TermTooltipProps {
  term: string
  showDismiss?: boolean
}

// LocalStorage key for dismissed terms
const DISMISSED_TERMS_KEY = 'clavier_dismissed_terms'

// Helper to get dismissed terms from localStorage
function getDismissedTerms(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(DISMISSED_TERMS_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

// Helper to save dismissed terms to localStorage
function saveDismissedTerms(terms: Set<string>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DISMISSED_TERMS_KEY, JSON.stringify([...terms]))
  } catch {
    // Ignore storage errors
  }
}

// Fallback definitions for common terms when API is unavailable
const fallbackDefinitions: Record<string, { definition: string; glossaryId: string }> = {
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
  dominant: {
    definition:
      'The fifth degree of a scale; creates tension that naturally resolves to the tonic.',
    glossaryId: 'dominant',
  },
  subdominant: {
    definition:
      'The fourth degree of a scale; often used to move away from the tonic before the dominant.',
    glossaryId: 'subdominant',
  },
  cadence: {
    definition:
      'A sequence of chords that brings a phrase or piece to a close, creating a sense of resolution.',
    glossaryId: 'cadence',
  },
  modulation: {
    definition:
      'The process of changing from one key to another within a piece of music.',
    glossaryId: 'modulation',
  },
  counterpoint: {
    definition:
      'The technique of combining two or more melodic lines that are independent but harmonically related.',
    glossaryId: 'counterpoint',
  },
  subject: {
    definition:
      'The main theme of a fugue, introduced at the beginning and recurring throughout.',
    glossaryId: 'subject',
  },
  answer: {
    definition:
      'The second entry of a fugue subject, typically at the dominant pitch level.',
    glossaryId: 'answer',
  },
  countersubject: {
    definition:
      'A melodic line that accompanies the subject in a fugue after its initial statement.',
    glossaryId: 'countersubject',
  },
  episode: {
    definition:
      'A passage in a fugue that does not contain the complete subject, often based on motives from the subject.',
    glossaryId: 'episode',
  },
  stretto: {
    definition:
      'A fugal technique where entries of the subject overlap, creating intensification.',
    glossaryId: 'stretto',
  },
}

export function TermTooltip({ term, showDismiss = true }: TermTooltipProps) {
  const router = useRouter()
  const [isDismissed, setIsDismissed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Only fetch when tooltip is opened
  const { definition: apiDefinition, isLoading } = useGlossaryTerm(
    isOpen ? term : null
  )

  // Check if term is dismissed on mount
  useEffect(() => {
    const dismissed = getDismissedTerms()
    setIsDismissed(dismissed.has(term.toLowerCase()))
  }, [term])

  // Use API definition if available, otherwise fall back to static definitions
  const termData = apiDefinition || fallbackDefinitions[term.toLowerCase()]

  const handleDismiss = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const normalizedTerm = term.toLowerCase()
    const dismissed = getDismissedTerms()
    dismissed.add(normalizedTerm)
    saveDismissedTerms(dismissed)
    setIsDismissed(true)
    setIsOpen(false)
  }, [term])

  const handleGlossary = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const glossaryId = termData?.glossaryId || term.toLowerCase().replace(/\s+/g, '-')
    router.push(`/glossary/${glossaryId}`)
    setIsOpen(false)
  }, [router, term, termData])

  // If term is dismissed, render without tooltip styling
  if (isDismissed) {
    return <span>{term}</span>
  }

  // If no definition available (not loading and no data), render with subtle styling
  if (!termData && !isLoading) {
    return (
      <span className="underline decoration-dotted decoration-muted-foreground/50">
        {term}
      </span>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip
        delayDuration={300}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted cursor-help text-primary hover:text-primary/80 transition-colors">
            {term}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs" side="top">
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center gap-2 py-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : termData ? (
              <>
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
                  {showDismiss && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleDismiss}
                    >
                      <X className="h-3 w-3 mr-1" />
                      I know this
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Definition not available.
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Hook to manage dismissed terms
 */
export function useDismissedTerms() {
  const [dismissedTerms, setDismissedTerms] = useState<Set<string>>(new Set())

  useEffect(() => {
    setDismissedTerms(getDismissedTerms())
  }, [])

  const dismissTerm = useCallback((term: string) => {
    const normalizedTerm = term.toLowerCase()
    setDismissedTerms((prev) => {
      const newSet = new Set(prev)
      newSet.add(normalizedTerm)
      saveDismissedTerms(newSet)
      return newSet
    })
  }, [])

  const undismissTerm = useCallback((term: string) => {
    const normalizedTerm = term.toLowerCase()
    setDismissedTerms((prev) => {
      const newSet = new Set(prev)
      newSet.delete(normalizedTerm)
      saveDismissedTerms(newSet)
      return newSet
    })
  }, [])

  const clearDismissed = useCallback(() => {
    setDismissedTerms(new Set())
    saveDismissedTerms(new Set())
  }, [])

  const isTermDismissed = useCallback(
    (term: string) => dismissedTerms.has(term.toLowerCase()),
    [dismissedTerms]
  )

  return {
    dismissedTerms,
    dismissTerm,
    undismissTerm,
    clearDismissed,
    isTermDismissed,
  }
}
