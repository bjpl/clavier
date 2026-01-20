'use client';

import { useState, useEffect, useMemo } from 'react';
import { CurriculumMap } from '@/components/curriculum';
import { useCurriculumStore } from '@/lib/stores/curriculum-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Domain } from '@/lib/types/curriculum';

// Type for API response (matches database schema)
interface APIDomain {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number;
  icon: string | null;
  units: Array<{
    id: string;
    name: string;
    description: string | null;
    orderIndex: number;
    modules: Array<{
      id: string;
      name: string;
      description: string | null;
      orderIndex: number;
      estimatedDurationMinutes: number | null;
      lessons: Array<{
        id: string;
        name: string;
        description: string | null;
        orderIndex: number;
      }>;
    }>;
  }>;
}

// Transform API response to match component types
function transformAPIDomain(apiDomain: APIDomain): Domain {
  return {
    id: apiDomain.id,
    name: apiDomain.name,
    description: apiDomain.description || '',
    order: apiDomain.orderIndex,
    icon: apiDomain.icon || '📚',
    units: apiDomain.units.map((unit) => ({
      id: unit.id,
      domainId: apiDomain.id,
      name: unit.name,
      description: unit.description || '',
      order: unit.orderIndex,
      modules: unit.modules.map((module) => ({
        id: module.id,
        unitId: unit.id,
        name: module.name,
        description: module.description || '',
        order: module.orderIndex,
        lessons: module.lessons.map((lesson) => ({
          id: lesson.id,
          moduleId: module.id,
          title: lesson.name,
          description: lesson.description || '',
          duration: module.estimatedDurationMinutes || 15,
          difficulty: 'beginner' as const,
          order: lesson.orderIndex,
        })),
      })),
    })),
  };
}

export default function CurriculumPage() {
  const router = useRouter();
  const completedLessons = useCurriculumStore((state) => state.completedLessons);
  const lessonProgress = useCurriculumStore((state) => state.lessonProgress);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch curriculum data from API
  useEffect(() => {
    async function fetchCurriculum() {
      try {
        const response = await fetch('/api/curriculum');
        if (!response.ok) {
          throw new Error('Failed to fetch curriculum');
        }
        const data = await response.json();
        const apiDomains: APIDomain[] = data.domains || [];
        // Transform API response to match component types
        setDomains(apiDomains.map(transformAPIDomain));
      } catch (err) {
        console.error('Error fetching curriculum:', err);
        setError(err instanceof Error ? err.message : 'Failed to load curriculum');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCurriculum();
  }, []);

  const handleDomainSelect = (domainId: string) => {
    router.push(`/curriculum/${domainId}`);
  };

  // Calculate overall statistics from fetched data
  const { totalLessons, totalMinutes } = useMemo(() => {
    let lessons = 0;
    let minutes = 0;
    domains.forEach((domain) => {
      domain.units.forEach((unit) => {
        unit.modules.forEach((module) => {
          lessons += module.lessons.length;
          // Sum up duration from each lesson
          module.lessons.forEach((lesson) => {
            minutes += lesson.duration;
          });
        });
      });
    });
    return { totalLessons: lessons, totalMinutes: minutes };
  }, [domains]);

  const recentLessons = Object.values(lessonProgress)
    .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
    .slice(0, 5);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading curriculum...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Curriculum</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Music Theory Curriculum</h1>
        <p className="text-muted-foreground text-lg">
          Structured, progressive lessons from fundamentals to advanced topics
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons}</div>
            <p className="text-xs text-muted-foreground">
              Across {domains.length} domains
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLessons.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalLessons > 0 ? ((completedLessons.length / totalLessons) * 100).toFixed(0) : 0}% of curriculum
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                Object.values(lessonProgress).filter(
                  (p) => p.percentage > 0 && p.percentage < 100
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Active lessons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalMinutes / 60)}h</div>
            <p className="text-xs text-muted-foreground">{totalMinutes} minutes</p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      {recentLessons.length > 0 && domains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLessons.map((progress) => {
                // Find the lesson details from transformed domains
                let lessonData: { lesson: { id: string; title: string; description: string }; domainName: string } | null = null;
                for (const domain of domains) {
                  for (const unit of domain.units) {
                    for (const currModule of unit.modules) {
                      const lesson = currModule.lessons.find((l) => l.id === progress.lessonId);
                      if (lesson) {
                        lessonData = { lesson, domainName: domain.name };
                        break;
                      }
                    }
                    if (lessonData) break;
                  }
                  if (lessonData) break;
                }

                if (!lessonData) return null;

                return (
                  <div
                    key={progress.lessonId}
                    className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/curriculum/lesson/${progress.lessonId}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{lessonData.lesson.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {lessonData.domainName}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {lessonData.lesson.description}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {progress.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="ml-4">
                      Continue
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Domain Map */}
      {domains.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">All Domains</h2>
          <CurriculumMap domains={domains} onSelectDomain={handleDomainSelect} />
        </div>
      )}

      {/* Learning Path */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Learning Path</CardTitle>
          <CardDescription>
            Follow this sequence for the best learning experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {domains.map((domain, idx) => (
              <li key={domain.id} className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-medium text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{domain.name}</h4>
                  <p className="text-sm text-muted-foreground">{domain.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/curriculum/${domain.id}`)}
                >
                  Explore
                </Button>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
