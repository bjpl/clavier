'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, BookOpen, ExternalLink, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

interface LessonData {
  id: string
  title: string
  description: string
  slug: string
  order: number
  durationMinutes: number
  sections: LessonSection[]
  domain?: {
    id: string
    name: string
    slug: string
  }
  prerequisites?: {
    id: string
    title: string
    slug: string
  }[]
}

interface LessonSection {
  title: string
  content: string
  type: 'text' | 'example' | 'exercise' | 'quiz'
}

interface LearnMoreModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lessonId: string | null
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export function LearnMoreModal({
  open,
  onOpenChange,
  lessonId,
}: LearnMoreModalProps) {
  const router = useRouter()
  const [previewSection, setPreviewSection] = useState(0)

  // Focus management: store trigger element ref
  const triggerRef = useRef<HTMLElement | null>(null)

  // When opening modal, store the currently focused element
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement
    }
  }, [open])

  // When closing, return focus to the trigger element
  useEffect(() => {
    if (!open && triggerRef.current) {
      triggerRef.current.focus()
      triggerRef.current = null
    }
  }, [open])

  const { data: lesson, error, isLoading } = useSWR<LessonData>(
    open && lessonId ? `/api/curriculum/lessons/${lessonId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  // Reset preview section when modal opens with new lesson
  useEffect(() => {
    if (open) {
      setPreviewSection(0)
    }
  }, [open, lessonId])

  const handleStartLesson = () => {
    if (lesson) {
      onOpenChange(false)
      router.push(`/learn/${lesson.domain?.slug || 'general'}/${lesson.slug}`)
    }
  }

  const handleViewCurriculum = () => {
    onOpenChange(false)
    router.push('/learn')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Learn More
          </DialogTitle>
          {lesson && (
            <DialogDescription>
              Explore this concept in depth with our interactive lesson
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Loading lesson...
              </span>
            </div>
          ) : error || !lesson ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-2">
                {lessonId
                  ? 'Lesson not available at this time.'
                  : 'No lesson selected.'}
              </p>
              <p className="text-sm text-muted-foreground">
                Explore our curriculum to find related topics.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleViewCurriculum}
              >
                Browse Curriculum
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Lesson Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {lesson.domain && (
                    <Badge variant="secondary">{lesson.domain.name}</Badge>
                  )}
                  <Badge variant="outline">
                    {lesson.durationMinutes} min
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold">{lesson.title}</h3>
                <p className="text-muted-foreground">{lesson.description}</p>
              </div>

              {/* Prerequisites */}
              {lesson.prerequisites && lesson.prerequisites.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Prerequisites
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {lesson.prerequisites.map((prereq) => (
                      <Badge key={prereq.id} variant="outline" className="text-xs">
                        {prereq.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Lesson Preview */}
              {lesson.sections && lesson.sections.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Lesson Preview
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    {/* Section tabs */}
                    <div className="flex border-b bg-muted/50 overflow-x-auto">
                      {lesson.sections.slice(0, 4).map((section, index) => (
                        <button
                          key={index}
                          onClick={() => setPreviewSection(index)}
                          className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                            previewSection === index
                              ? 'bg-background border-b-2 border-primary text-primary'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {section.title}
                        </button>
                      ))}
                      {lesson.sections.length > 4 && (
                        <span className="px-4 py-2 text-sm text-muted-foreground">
                          +{lesson.sections.length - 4} more
                        </span>
                      )}
                    </div>
                    {/* Section content preview */}
                    <div className="p-4">
                      <div className="prose prose-sm max-w-none dark:prose-invert line-clamp-4">
                        {lesson.sections[previewSection]?.content ||
                          'Content preview not available.'}
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-xs text-muted-foreground">
                          Section type:{' '}
                          <Badge variant="secondary" className="text-xs ml-1">
                            {lesson.sections[previewSection]?.type || 'text'}
                          </Badge>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* What you'll learn */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  What you will learn
                </h4>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Understand the theoretical foundation of this concept</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Recognize this pattern in various musical contexts</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Apply this knowledge to analyze other pieces</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {lesson && (
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Maybe Later
            </Button>
            <Button onClick={handleStartLesson}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Start Lesson
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
