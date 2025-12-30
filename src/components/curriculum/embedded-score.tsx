'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, Play } from 'lucide-react';
import Link from 'next/link';

interface EmbeddedScoreProps {
  scoreId: string;
  title?: string;
  measures?: number[];
  annotations?: boolean;
  compact?: boolean;
  className?: string;
}

export function EmbeddedScore({
  scoreId,
  title,
  measures,
  annotations = false,
  compact = true,
  className = '',
}: EmbeddedScoreProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          {title && <h4 className="font-medium text-sm">{title}</h4>}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Play className="h-3 w-3 mr-1" />
              Play
            </Button>
            <Link href={`/walkthrough/${scoreId}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                Walkthrough
              </Button>
            </Link>
          </div>
        </div>

        {/* Score placeholder */}
        <div
          className={`bg-white border rounded-lg flex items-center justify-center ${
            compact ? 'h-48' : 'h-96'
          }`}
        >
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Score Viewer</p>
            <p className="text-xs text-muted-foreground">
              Score ID: {scoreId}
              {measures && ` • Measures ${measures.join('-')}`}
            </p>
            {annotations && (
              <p className="text-xs text-muted-foreground">
                Annotations enabled
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Integration with VexFlow pending</span>
          {measures && (
            <span>
              Showing measures {measures[0]} - {measures[measures.length - 1]}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
