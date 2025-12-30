'use client';

import { Lesson } from '@/lib/types/curriculum';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionRenderer } from './section-renderer';
import { LessonProgress } from './lesson-progress';
import { useCurriculumStore } from '@/lib/stores/curriculum-store';

interface LessonViewProps {
  lesson: Lesson;
  onLessonComplete?: () => void;
}

export function LessonView({ lesson, onLessonComplete }: LessonViewProps) {
  const currentSectionIndex = useCurriculumStore((state) => state.currentSectionIndex);
  const setSection = useCurriculumStore((state) => state.setSection);
  const nextSection = useCurriculumStore((state) => state.nextSection);
  const prevSection = useCurriculumStore((state) => state.prevSection);
  const completeSection = useCurriculumStore((state) => state.completeSection);
  const completeLesson = useCurriculumStore((state) => state.completeLesson);
  const isSectionCompleted = useCurriculumStore((state) => state.isSectionCompleted);
  const getLessonProgress = useCurriculumStore((state) => state.getLessonProgress);

  const progress = getLessonProgress(lesson.metadata.id);
  const currentSection = lesson.sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === lesson.sections.length - 1;
  const isFirstSection = currentSectionIndex === 0;

  const handleSectionComplete = () => {
    completeSection(lesson.metadata.id, currentSectionIndex);
    if (isLastSection) {
      completeLesson(lesson.metadata.id);
      onLessonComplete?.();
    } else {
      nextSection();
    }
  };

  const handlePrevious = () => {
    if (!isFirstSection) {
      prevSection();
    }
  };

  const handleNext = () => {
    if (!isLastSection) {
      nextSection();
    }
  };

  if (!currentSection) {
    return <div>No section found</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main content */}
      <div className="flex-1 space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">{currentSection.title}</h2>
                <span className="text-sm text-muted-foreground">
                  Section {currentSectionIndex + 1} of {lesson.sections.length}
                </span>
              </div>
            </div>

            <SectionRenderer
              section={currentSection}
              onComplete={handleSectionComplete}
              isCompleted={isSectionCompleted(lesson.metadata.id, currentSectionIndex)}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstSection}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="text-sm text-muted-foreground">
                {currentSectionIndex + 1} / {lesson.sections.length}
              </div>

              <Button
                onClick={handleNext}
                disabled={isLastSection}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary and Key Terms */}
        {lesson.summary && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Lesson Summary</h3>
            <p className="text-sm text-muted-foreground">{lesson.summary}</p>
          </Card>
        )}

        {lesson.keyTerms && lesson.keyTerms.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Key Terms</h3>
            <dl className="space-y-4">
              {lesson.keyTerms.map((term, idx) => (
                <div key={idx}>
                  <dt className="font-medium text-sm">{term.term}</dt>
                  <dd className="text-sm text-muted-foreground mt-1">{term.definition}</dd>
                  {term.relatedTerms && term.relatedTerms.length > 0 && (
                    <dd className="text-xs text-muted-foreground mt-1">
                      Related: {term.relatedTerms.join(', ')}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </Card>
        )}
      </div>

      {/* Sidebar with progress */}
      <div className="lg:w-80 space-y-4">
        <Card className="p-4 sticky top-4">
          <LessonProgress
            totalSections={lesson.sections.length}
            currentSection={currentSectionIndex}
            completedSections={progress?.completedSections || []}
            sectionTitles={lesson.sections.map((s) => s.title)}
          />
        </Card>

        {/* Quick navigation */}
        <Card className="p-4">
          <h4 className="font-medium text-sm mb-3">Jump to Section</h4>
          <div className="space-y-1">
            {lesson.sections.map((section, idx) => (
              <Button
                key={idx}
                variant={idx === currentSectionIndex ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => setSection(idx)}
              >
                {idx + 1}. {section.title}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
