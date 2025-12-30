'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FeatureStatsProps } from '@/types/explorer';
import { FEATURE_CATEGORY_LABELS } from '@/types/explorer';

export function FeatureStats({ feature, instances: _instances }: FeatureStatsProps) {
  const stats = feature;

  // Top keys by frequency
  const topKeys = Object.entries(stats.keyDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Calculate percentages
  const totalInstances = stats.instanceCount;
  const book1Count = stats.bookDistribution['1'] || 0;
  const book2Count = stats.bookDistribution['2'] || 0;
  const preludeCount = stats.typeDistribution.PRELUDE || 0;
  const fugueCount = stats.typeDistribution.FUGUE || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total instances */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Instances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {totalInstances}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Found across the WTC
          </p>
        </CardContent>
      </Card>

      {/* Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">
            Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="default" className="text-base">
            {FEATURE_CATEGORY_LABELS[feature.category]}
          </Badge>
          {feature.parentFeatureId && (
            <p className="text-sm text-gray-500 mt-2">
              Subcategory
            </p>
          )}
        </CardContent>
      </Card>

      {/* Book distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">
            Book Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Book I</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${(book1Count / totalInstances) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {book1Count}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Book II</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{
                      width: `${(book2Count / totalInstances) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {book2Count}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Type distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">
            Type Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Preludes</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${(preludeCount / totalInstances) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {preludeCount}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Fugues</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500"
                    style={{
                      width: `${(fugueCount / totalInstances) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {fugueCount}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top keys */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">
            Most Common Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topKeys.map(([key, count]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium">{key}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${(count / totalInstances) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
