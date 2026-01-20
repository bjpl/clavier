'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  CheckCircle,
  Loader2,
  Target,
  ListChecks
} from 'lucide-react';
import { useCurriculumStore } from '@/lib/stores/curriculum-store';

// API Response types
interface APILesson {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number;
  sections: {
    introduction?: string;
    concepts?: string[];
    examples?: any[];
    exercises?: string[];
    techniques?: string[];
  } | null;
  module: {
    id: string;
    name: string;
    estimatedDurationMinutes: number | null;
    unit: {
      id: string;
      name: string;
      domain: {
        id: string;
        name: string;
        icon: string | null;
      };
    };
  };
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const completedLessons = useCurriculumStore((state) => state.completedLessons);
  const lessonProgress = useCurriculumStore((state) => state.lessonProgress);
  const updateProgress = useCurriculumStore((state) => state.updateProgress);
  const completeLesson = useCurriculumStore((state) => state.completeLesson);

  const [lesson, setLesson] = useState<APILesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    async function fetchLesson() {
      try {
        const response = await fetch(`/api/curriculum/lessons/${lessonId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Lesson not found');
          }
          throw new Error('Failed to fetch lesson');
        }
        const data = await response.json();
        setLesson(data);

        // Track access
        updateProgress(lessonId, lessonProgress[lessonId]?.percentage || 0);
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError(err instanceof Error ? err.message : 'Failed to load lesson');
      } finally {
        setIsLoading(false);
      }
    }
    fetchLesson();
  }, [lessonId, updateProgress, lessonProgress]);

  const isCompleted = completedLessons.includes(lessonId);
  const progress = lessonProgress[lessonId]?.percentage || 0;

  const getSections = () => {
    if (!lesson?.sections) return [];
    const sections: { title: string; content: any; type: string }[] = [];

    if (lesson.sections.introduction) {
      sections.push({
        title: 'Introduction',
        content: lesson.sections.introduction,
        type: 'text'
      });
    }
    if (lesson.sections.concepts && lesson.sections.concepts.length > 0) {
      sections.push({
        title: 'Key Concepts',
        content: lesson.sections.concepts,
        type: 'list'
      });
    }
    if (lesson.sections.techniques && lesson.sections.techniques.length > 0) {
      sections.push({
        title: 'Techniques',
        content: lesson.sections.techniques,
        type: 'list'
      });
    }
    if (lesson.sections.examples && lesson.sections.examples.length > 0) {
      sections.push({
        title: 'Examples',
        content: lesson.sections.examples,
        type: 'examples'
      });
    }
    if (lesson.sections.exercises && lesson.sections.exercises.length > 0) {
      sections.push({
        title: 'Exercises',
        content: lesson.sections.exercises,
        type: 'list'
      });
    }

    return sections;
  };

  const sections = getSections();

  const handleSectionChange = (newSection: number) => {
    setCurrentSection(newSection);
    if (sections.length > 0) {
      const newProgress = Math.round(((newSection + 1) / sections.length) * 100);
      updateProgress(lessonId, Math.max(progress, newProgress));
    }
  };

  const handleComplete = () => {
    completeLesson(lessonId);
    updateProgress(lessonId, 100);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Lesson</CardTitle>
            <CardDescription>{error || 'Lesson not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/curriculum')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Curriculum
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" onClick={() => router.push('/curriculum')}>
          Curriculum
        </Button>
        <span>/</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/curriculum/${lesson.module.unit.domain.id}`)}
        >
          {lesson.module.unit.domain.icon} {lesson.module.unit.domain.name}
        </Button>
        <span>/</span>
        <span>{lesson.module.unit.name}</span>
        <span>/</span>
        <span>{lesson.module.name}</span>
      </div>

      {/* Lesson Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{lesson.name}</h1>
            <p className="text-muted-foreground mt-1">{lesson.description}</p>
          </div>
          {isCompleted && (
            <Badge className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{lesson.module.estimatedDurationMinutes || 15} min estimated</span>
              </div>
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                <span>{sections.length} sections</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Content */}
      {sections.length > 0 ? (
        <div className="space-y-4">
          {/* Section Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sections.map((section, idx) => (
              <Button
                key={idx}
                variant={currentSection === idx ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSectionChange(idx)}
              >
                {section.title}
              </Button>
            ))}
          </div>

          {/* Current Section Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {sections[currentSection].type === 'list' && <Target className="h-5 w-5" />}
                {sections[currentSection].type === 'examples' && <BookOpen className="h-5 w-5" />}
                {sections[currentSection].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sections[currentSection].type === 'text' && (
                <p className="text-lg leading-relaxed">{sections[currentSection].content}</p>
              )}

              {sections[currentSection].type === 'list' && (
                <ul className="space-y-3">
                  {sections[currentSection].content.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium">{idx + 1}</span>
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {sections[currentSection].type === 'examples' && (
                <div className="space-y-4">
                  {sections[currentSection].content.map((example: any, idx: number) => (
                    <div key={idx} className="p-4 bg-muted rounded-lg">
                      {typeof example === 'string' ? (
                        <p>{example}</p>
                      ) : (
                        <div className="space-y-2">
                          {example.piece && (
                            <p className="font-medium">{example.piece}</p>
                          )}
                          {example.key && (
                            <Badge variant="outline">{example.key}</Badge>
                          )}
                          {example.measure && (
                            <p className="text-sm text-muted-foreground">
                              Measure: {example.measure}
                            </p>
                          )}
                          {example.subject && (
                            <p className="text-sm">Subject: {example.subject}</p>
                          )}
                          {example.answer && (
                            <p className="text-sm">Answer: {example.answer}</p>
                          )}
                          {example.type && (
                            <Badge variant="secondary">{example.type}</Badge>
                          )}
                          {example.characteristics && (
                            <p className="text-sm italic">{example.characteristics}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => handleSectionChange(currentSection - 1)}
              disabled={currentSection === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentSection < sections.length - 1 ? (
              <Button onClick={() => handleSectionChange(currentSection + 1)}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isCompleted}
                className={isCompleted ? 'bg-green-500' : ''}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    Mark Complete
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Lesson content is being prepared. Check back soon!
            </p>
            <Button onClick={() => router.push(`/curriculum/${lesson.module.unit.domain.id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Domain
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
