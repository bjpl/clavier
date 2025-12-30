'use client';

import { CurriculumMap } from '@/components/curriculum';
import { curriculumDomains } from '@/lib/data/curriculum-structure';
import { useCurriculumStore } from '@/lib/stores/curriculum-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CurriculumPage() {
  const router = useRouter();
  const completedLessons = useCurriculumStore((state) => state.completedLessons);
  const lessonProgress = useCurriculumStore((state) => state.lessonProgress);

  const handleDomainSelect = (domainId: string) => {
    router.push(`/curriculum/${domainId}`);
  };

  // Calculate overall statistics
  const totalLessons = curriculumDomains.reduce(
    (sum, domain) =>
      sum +
      domain.units.reduce(
        (uSum, unit) =>
          uSum + unit.modules.reduce((mSum, module) => mSum + module.lessons.length, 0),
        0
      ),
    0
  );

  const recentLessons = Object.values(lessonProgress)
    .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
    .slice(0, 5);

  const totalMinutes = curriculumDomains.reduce(
    (sum, domain) =>
      sum +
      domain.units.reduce(
        (uSum, unit) =>
          uSum +
          unit.modules.reduce(
            (mSum, module) =>
              mSum + module.lessons.reduce((lSum, lesson) => lSum + lesson.duration, 0),
            0
          ),
        0
      ),
    0
  );

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
              Across {curriculumDomains.length} domains
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
              {((completedLessons.length / totalLessons) * 100).toFixed(0)}% of curriculum
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
      {recentLessons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLessons.map((progress) => {
                // Find the lesson details
                let lessonData = null;
                for (const domain of curriculumDomains) {
                  for (const unit of domain.units) {
                    for (const currModule of unit.modules) {
                      const lesson = currModule.lessons.find((l) => l.id === progress.lessonId);
                      if (lesson) {
                        lessonData = { lesson, domain, unit, module: currModule };
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
                          {lessonData.domain.name}
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
      <div>
        <h2 className="text-2xl font-bold mb-4">All Domains</h2>
        <CurriculumMap domains={curriculumDomains} onSelectDomain={handleDomainSelect} />
      </div>

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
            {curriculumDomains.map((domain, idx) => (
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
