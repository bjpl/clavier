'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  ChevronRight,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useCurriculumStore } from '@/lib/stores/curriculum-store';

// API Response types
interface APILesson {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number;
}

interface APIModule {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number;
  estimatedDurationMinutes: number | null;
  lessons: APILesson[];
}

interface APIUnit {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number;
  modules: APIModule[];
}

interface APIDomain {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number;
  icon: string | null;
  units: APIUnit[];
}

export default function DomainPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = params.domainId as string;

  const completedLessons = useCurriculumStore((state) => state.completedLessons);
  const lessonProgress = useCurriculumStore((state) => state.lessonProgress);

  const [domain, setDomain] = useState<APIDomain | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchDomain() {
      try {
        const response = await fetch(`/api/curriculum/domains/${domainId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Domain not found');
          }
          throw new Error('Failed to fetch domain');
        }
        const data = await response.json();
        setDomain(data);
        // Expand the first unit by default
        if (data.units && data.units.length > 0) {
          setExpandedUnits(new Set([data.units[0].id]));
        }
      } catch (err) {
        console.error('Error fetching domain:', err);
        setError(err instanceof Error ? err.message : 'Failed to load domain');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDomain();
  }, [domainId]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  const getLessonStatus = (lessonId: string): 'completed' | 'in-progress' | 'not-started' => {
    if (completedLessons.includes(lessonId)) return 'completed';
    const progress = lessonProgress[lessonId];
    if (progress && progress.percentage > 0) return 'in-progress';
    return 'not-started';
  };

  const getDomainProgress = () => {
    if (!domain) return 0;
    let total = 0;
    let completed = 0;
    domain.units.forEach((unit) => {
      unit.modules.forEach((mod) => {
        total += mod.lessons.length;
        mod.lessons.forEach((lesson) => {
          if (completedLessons.includes(lesson.id)) {
            completed++;
          }
        });
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getTotalLessons = () => {
    if (!domain) return 0;
    return domain.units.reduce(
      (acc, unit) => acc + unit.modules.reduce(
        (acc2, mod) => acc2 + mod.lessons.length,
        0
      ),
      0
    );
  };

  const getTotalMinutes = () => {
    if (!domain) return 0;
    return domain.units.reduce(
      (acc, unit) => acc + unit.modules.reduce(
        (acc2, mod) => acc2 + (mod.estimatedDurationMinutes || 15) * mod.lessons.length,
        0
      ),
      0
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading domain...</p>
        </div>
      </div>
    );
  }

  if (error || !domain) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Domain</CardTitle>
            <CardDescription>{error || 'Domain not found'}</CardDescription>
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
      {/* Back Navigation */}
      <Button variant="ghost" onClick={() => router.push('/curriculum')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Curriculum
      </Button>

      {/* Domain Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{domain.icon || '📚'}</span>
          <div>
            <h1 className="text-3xl font-bold">{domain.name}</h1>
            <p className="text-muted-foreground">{domain.description}</p>
          </div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <div className="text-2xl font-bold">{getDomainProgress()}%</div>
                <p className="text-sm text-muted-foreground">Complete</p>
                <Progress value={getDomainProgress()} className="mt-2" />
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="text-xl font-semibold">{getTotalLessons()}</div>
                  <p className="text-sm text-muted-foreground">Lessons</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="text-xl font-semibold">{Math.round(getTotalMinutes() / 60)}h</div>
                  <p className="text-sm text-muted-foreground">Estimated</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-xl font-semibold">
                    {completedLessons.filter((id) =>
                      domain.units.some((u) =>
                        u.modules.some((m) =>
                          m.lessons.some((l) => l.id === id)
                        )
                      )
                    ).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Units */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Units</h2>
        {domain.units.map((unit) => (
          <Card key={unit.id}>
            <CardHeader
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleUnit(unit.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{unit.name}</CardTitle>
                  <CardDescription>{unit.description}</CardDescription>
                </div>
                <ChevronRight
                  className={`h-5 w-5 transition-transform ${
                    expandedUnits.has(unit.id) ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </CardHeader>

            {expandedUnits.has(unit.id) && (
              <CardContent>
                <div className="space-y-4">
                  {unit.modules.map((mod) => (
                    <div key={mod.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{mod.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{mod.description}</p>

                      <div className="space-y-2">
                        {mod.lessons.map((lesson) => {
                          const status = getLessonStatus(lesson.id);
                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => router.push(`/curriculum/lesson/${lesson.id}`)}
                            >
                              <div className="flex items-center gap-3">
                                {status === 'completed' && (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                                {status === 'in-progress' && (
                                  <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                                )}
                                {status === 'not-started' && (
                                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                                )}
                                <div>
                                  <p className="font-medium">{lesson.name}</p>
                                  <p className="text-sm text-muted-foreground">{lesson.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {status === 'in-progress' && lessonProgress[lesson.id] && (
                                  <Badge variant="secondary">
                                    {lessonProgress[lesson.id].percentage}%
                                  </Badge>
                                )}
                                <Badge variant={status === 'completed' ? 'default' : 'outline'}>
                                  {mod.estimatedDurationMinutes || 15} min
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
