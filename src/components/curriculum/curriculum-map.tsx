'use client';

import { Domain } from '@/lib/types/curriculum';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';
import { useCurriculumStore } from '@/lib/stores/curriculum-store';

interface CurriculumMapProps {
  domains: Domain[];
  onSelectDomain: (domainId: string) => void;
}

export function CurriculumMap({ domains, onSelectDomain }: CurriculumMapProps) {
  const completedLessons = useCurriculumStore((state) => state.completedLessons);

  const getDomainProgress = (domain: Domain) => {
    const totalLessons = domain.units.reduce(
      (sum, unit) =>
        sum + unit.modules.reduce((mSum, module) => mSum + module.lessons.length, 0),
      0
    );

    const completedCount = domain.units.reduce(
      (sum, unit) =>
        sum +
        unit.modules.reduce(
          (mSum, module) =>
            mSum +
            module.lessons.filter((lesson) => completedLessons.includes(lesson.id)).length,
          0
        ),
      0
    );

    return {
      total: totalLessons,
      completed: completedCount,
      percentage: totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0,
    };
  };

  const getDomainStatus = (domain: Domain) => {
    const progress = getDomainProgress(domain);
    if (progress.completed === 0) return 'not-started';
    if (progress.completed === progress.total) return 'completed';
    return 'in-progress';
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {domains.map((domain) => {
        const progress = getDomainProgress(domain);
        const status = getDomainStatus(domain);

        return (
          <Card
            key={domain.id}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
            onClick={() => onSelectDomain(domain.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">
                    {domain.icon}
                  </span>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {domain.name}
                      {status === 'completed' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </CardTitle>
                    <CardDescription>{domain.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {progress.completed} / {progress.total} lessons
                  </span>
                </div>
                <Progress value={progress.percentage} className="h-2" />
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {domain.units.length} units
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {domain.units.reduce((sum, unit) => sum + unit.modules.length, 0)} modules
                </Badge>
                {status === 'in-progress' && (
                  <Badge variant="default" className="text-xs">
                    In Progress
                  </Badge>
                )}
                {status === 'completed' && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    Completed
                  </Badge>
                )}
              </div>

              <div className="pt-2 border-t">
                <div className="text-sm text-muted-foreground">Units:</div>
                <div className="mt-2 space-y-1">
                  {domain.units.slice(0, 3).map((unit) => {
                    const unitLessons = unit.modules.reduce(
                      (sum, m) => sum + m.lessons.length,
                      0
                    );
                    const unitCompleted = unit.modules.reduce(
                      (sum, m) =>
                        sum +
                        m.lessons.filter((l) => completedLessons.includes(l.id)).length,
                      0
                    );
                    const unitProgress =
                      unitLessons > 0 ? (unitCompleted / unitLessons) * 100 : 0;

                    return (
                      <div key={unit.id} className="flex items-center gap-2 text-sm">
                        {unitProgress === 100 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : unitProgress > 0 ? (
                          <Circle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                        )}
                        <span className="truncate">{unit.name}</span>
                      </div>
                    );
                  })}
                  {domain.units.length > 3 && (
                    <div className="text-xs text-muted-foreground pl-6">
                      +{domain.units.length - 3} more units
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
