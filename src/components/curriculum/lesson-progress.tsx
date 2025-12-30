'use client';

import { Check } from 'lucide-react';

interface LessonProgressProps {
  totalSections: number;
  currentSection: number;
  completedSections: number[];
  sectionTitles?: string[];
}

export function LessonProgress({
  totalSections,
  currentSection,
  completedSections,
  sectionTitles = [],
}: LessonProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Lesson Progress</span>
        <span className="font-medium">
          {completedSections.length} / {totalSections} sections
        </span>
      </div>

      <div className="space-y-2">
        {Array.from({ length: totalSections }, (_, i) => i).map((index) => {
          const isCompleted = completedSections.includes(index);
          const isCurrent = index === currentSection;
          const title = sectionTitles[index] || `Section ${index + 1}`;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isCurrent
                  ? 'bg-blue-50 border border-blue-200'
                  : isCompleted
                  ? 'bg-green-50'
                  : 'bg-gray-50'
              }`}
            >
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={`text-sm ${
                  isCurrent ? 'font-medium text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-600'
                }`}
              >
                {title}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(completedSections.length / totalSections) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
