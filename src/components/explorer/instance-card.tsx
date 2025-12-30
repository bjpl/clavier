'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { InstanceCardProps } from '@/types/explorer';
import Link from 'next/link';

export function InstanceCard({ instance, onClick }: InstanceCardProps) {
  const { feature, piece } = instance;

  // Format measure range
  const measureRange =
    instance.measureStart === instance.measureEnd
      ? `m. ${instance.measureStart}`
      : `mm. ${instance.measureStart}–${instance.measureEnd}`;

  // Calculate complexity indicator (1-5 stars based on measure range and description length)
  const measureSpan = instance.measureEnd - instance.measureStart + 1;
  const complexity = Math.min(
    5,
    Math.max(1, Math.ceil((measureSpan + (instance.description?.length || 0) / 50) / 3))
  );

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Feature name */}
            <h3 className="font-semibold text-gray-900 mb-1 truncate">
              {feature.name}
            </h3>

            {/* Piece info */}
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
              <span className="font-mono">BWV {piece.bwvNumber}</span>
              <span className="text-gray-400">•</span>
              <span>{piece.keyTonic} {piece.keyMode}</span>
              <span className="text-gray-400">•</span>
              <Badge variant="outline" className="text-xs">
                {piece.type}
              </Badge>
            </div>

            {/* Measure range */}
            <div className="text-sm text-gray-500 mb-2">{measureRange}</div>

            {/* Description preview */}
            {instance.description && (
              <p className="text-sm text-gray-700 line-clamp-2">
                {instance.description}
              </p>
            )}

            {/* Complexity indicator */}
            <div className="flex items-center gap-1 mt-3">
              <span className="text-xs text-gray-500">Complexity:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < complexity ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                // Play audio
              }}
              className="whitespace-nowrap"
            >
              ▶ Play
            </Button>
            <Link
              href={`/walkthrough/${piece.id}?measure=${instance.measureStart}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Button size="sm" variant="ghost" className="w-full whitespace-nowrap">
                Open →
              </Button>
            </Link>
          </div>
        </div>

        {/* Score thumbnail placeholder */}
        <div className="mt-4 h-24 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
          Score excerpt (mm. {instance.measureStart}–{instance.measureEnd})
        </div>
      </CardContent>
    </Card>
  );
}
