'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { InstanceDetailProps } from '@/types/explorer';
import Link from 'next/link';

export function InstanceDetail({
  instance,
  onPlayback,
  onNavigateToWalkthrough: _onNavigateToWalkthrough,
}: InstanceDetailProps) {
  const { feature, piece } = instance;

  const measureRange =
    instance.measureStart === instance.measureEnd
      ? `Measure ${instance.measureStart}`
      : `Measures ${instance.measureStart}–${instance.measureEnd}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {feature.name}
            </h1>
            <div className="flex items-center gap-3 text-gray-600">
              <span className="font-mono text-lg">BWV {piece.bwvNumber}</span>
              <span className="text-gray-400">•</span>
              <span className="text-lg">{piece.keyTonic} {piece.keyMode}</span>
              <span className="text-gray-400">•</span>
              <Badge variant="outline">{piece.type}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onPlayback} variant="default">
              ▶ Play
            </Button>
            <Link href={`/walkthrough/${piece.id}?measure=${instance.measureStart}`}>
              <Button variant="outline">
                Open in Walkthrough
              </Button>
            </Link>
          </div>
        </div>
        <p className="text-gray-600">{measureRange}</p>
      </div>

      {/* Score excerpt */}
      <Card>
        <CardHeader>
          <CardTitle>Score Excerpt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400">
            Score rendering for measures {instance.measureStart}–{instance.measureEnd}
            <br />
            (OSMD integration placeholder)
          </div>
        </CardContent>
      </Card>

      {/* Feature description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          {feature.description ? (
            <div className="prose prose-sm max-w-none">
              <p>{feature.description}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No description available</p>
          )}
        </CardContent>
      </Card>

      {/* Instance-specific notes */}
      {instance.description && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p>{instance.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Related instances */}
      {instance.relatedInstances && instance.relatedInstances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Similar Instances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {instance.relatedInstances.map((related) => (
                <Link
                  key={related.id}
                  href={`/explorer/instance/${related.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        Related Instance
                      </div>
                      <div className="text-sm text-gray-600">
                        Measures {related.measureStart}–{related.measureEnd}
                      </div>
                    </div>
                    <span className="text-blue-600">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Curriculum references */}
      {instance.curriculumReferences && instance.curriculumReferences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Curriculum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {instance.curriculumReferences.map((ref) => (
                <Link
                  key={ref.lessonId}
                  href={`/curriculum/lesson/${ref.lessonId}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {ref.lessonTitle}
                      </div>
                      <div className="text-sm text-gray-600">
                        {ref.unitTitle}
                      </div>
                    </div>
                    <span className="text-blue-600">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
