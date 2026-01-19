import { FeatureStats } from '@/components/explorer';
import { InstanceCard } from '@/components/explorer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FeatureWithStats, FeatureInstanceWithContext } from '@/types/explorer';
import { FEATURE_CATEGORY_LABELS } from '@/types/explorer';
import type { FeatureCategory, PieceType } from '@/types/database';
import Link from 'next/link';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';

interface FeaturePageProps {
  params: Promise<{
    featureId: string;
  }>;
}

/**
 * Fetch a feature by ID or slug, with hierarchy and statistics
 */
async function getFeature(featureId: string): Promise<FeatureWithStats | null> {
  // Try to find by ID first, then by slug
  const feature = await db.feature.findFirst({
    where: {
      OR: [
        { id: featureId },
        { slug: featureId },
      ],
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          description: true,
          difficultyLevel: true,
        },
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!feature) {
    return null;
  }

  // Fetch all instances with piece data for statistics calculation
  const instances = await db.featureInstance.findMany({
    where: { featureId: feature.id },
    include: {
      piece: {
        select: {
          id: true,
          book: true,
          keyTonic: true,
          keyMode: true,
          type: true,
        },
      },
    },
  });

  // Calculate statistics
  const keyDistribution: Record<string, number> = {};
  const bookDistribution: Record<string, number> = { '1': 0, '2': 0 };
  const typeDistribution: Record<PieceType, number> = { PRELUDE: 0, FUGUE: 0 };

  for (const instance of instances) {
    const piece = instance.piece;

    // Key distribution (combine tonic and mode)
    const keyLabel = `${piece.keyTonic} ${piece.keyMode.toLowerCase()}`;
    keyDistribution[keyLabel] = (keyDistribution[keyLabel] || 0) + 1;

    // Book distribution
    bookDistribution[String(piece.book)] = (bookDistribution[String(piece.book)] || 0) + 1;

    // Type distribution
    typeDistribution[piece.type] = (typeDistribution[piece.type] || 0) + 1;
  }

  return {
    ...feature,
    instanceCount: instances.length,
    keyDistribution,
    bookDistribution,
    typeDistribution,
  };
}

/**
 * Fetch feature instances with full context for display
 */
async function getFeatureInstances(
  featureId: string
): Promise<FeatureInstanceWithContext[]> {
  // First get the feature to ensure we have the correct ID
  const feature = await db.feature.findFirst({
    where: {
      OR: [
        { id: featureId },
        { slug: featureId },
      ],
    },
  });

  if (!feature) {
    return [];
  }

  const instances = await db.featureInstance.findMany({
    where: { featureId: feature.id },
    include: {
      feature: true,
      piece: {
        select: {
          id: true,
          bwvNumber: true,
          book: true,
          numberInBook: true,
          type: true,
          keyTonic: true,
          keyMode: true,
          totalMeasures: true,
        },
      },
    },
    orderBy: [
      { piece: { book: 'asc' } },
      { piece: { numberInBook: 'asc' } },
      { measureStart: 'asc' },
    ],
  });

  // Transform to FeatureInstanceWithContext
  return instances.map((instance) => ({
    ...instance,
    feature: instance.feature,
    piece: instance.piece,
  })) as FeatureInstanceWithContext[];
}

export default async function FeaturePage({ params }: FeaturePageProps) {
  const resolvedParams = await params;
  const feature = await getFeature(resolvedParams.featureId);
  const instances = await getFeatureInstances(resolvedParams.featureId);

  if (!feature) {
    notFound();
  }

  // Type assertion for hierarchy data
  const parentFeature = (feature as FeatureWithStats & {
    parent?: { id: string; name: string; slug: string; category: FeatureCategory } | null;
    children?: Array<{ id: string; name: string; slug: string; category: FeatureCategory; description: string; difficultyLevel: number }>;
  }).parent;

  const childFeatures = (feature as FeatureWithStats & {
    children?: Array<{ id: string; name: string; slug: string; category: FeatureCategory; description: string; difficultyLevel: number }>;
  }).children || [];

  // Get difficulty label
  const difficultyLabels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
  const difficultyLabel = difficultyLabels[Math.min(feature.difficultyLevel - 1, 4)] || 'Intermediate';
  const difficultyColors = [
    'bg-green-100 text-green-800',
    'bg-blue-100 text-blue-800',
    'bg-yellow-100 text-yellow-800',
    'bg-orange-100 text-orange-800',
    'bg-red-100 text-red-800',
  ];
  const difficultyColor = difficultyColors[Math.min(feature.difficultyLevel - 1, 4)] || difficultyColors[2];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Breadcrumb navigation */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/explorer" className="hover:text-gray-700 transition-colors">
              Explorer
            </Link>
            <span>/</span>
            <Link
              href={`/explorer?category=${feature.category}`}
              className="hover:text-gray-700 transition-colors"
            >
              {FEATURE_CATEGORY_LABELS[feature.category]}
            </Link>
            {parentFeature && (
              <>
                <span>/</span>
                <Link
                  href={`/explorer/feature/${parentFeature.slug || parentFeature.id}`}
                  className="hover:text-gray-700 transition-colors"
                >
                  {parentFeature.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-gray-900 font-medium">{feature.name}</span>
          </nav>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {feature.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default">
                  {FEATURE_CATEGORY_LABELS[feature.category]}
                </Badge>
                <Badge className={difficultyColor}>
                  {difficultyLabel}
                </Badge>
                {feature.instanceCount > 0 && (
                  <span className="text-sm text-gray-600">
                    {feature.instanceCount} {feature.instanceCount === 1 ? 'instance' : 'instances'}
                  </span>
                )}
              </div>
            </div>
            <Link href="/explorer">
              <Button variant="outline">
                Back to Explorer
              </Button>
            </Link>
          </div>

          {feature.description && (
            <p className="text-gray-700 mt-4 max-w-3xl leading-relaxed">
              {feature.description}
            </p>
          )}

          {/* Explanation levels */}
          {(feature.explanationBeginner || feature.explanationIntermediate || feature.explanationAdvanced) && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {feature.explanationBeginner && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">
                      Beginner Explanation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-900">{feature.explanationBeginner}</p>
                  </CardContent>
                </Card>
              )}
              {feature.explanationIntermediate && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-800">
                      Intermediate Explanation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-yellow-900">{feature.explanationIntermediate}</p>
                  </CardContent>
                </Card>
              )}
              {feature.explanationAdvanced && (
                <Card className="bg-red-50 border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-red-800">
                      Advanced Explanation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-red-900">{feature.explanationAdvanced}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Child features (if any) */}
      {childFeatures.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Related Sub-features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {childFeatures.map((child) => (
              <Link
                key={child.id}
                href={`/explorer/feature/${child.slug || child.id}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{child.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        Level {child.difficultyLevel}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {child.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      {feature.instanceCount > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Distribution Statistics
          </h2>
          <FeatureStats feature={feature} instances={instances} />
        </div>
      )}

      {/* All instances */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            All Instances
          </h2>
          <p className="text-gray-600">
            {instances.length} {instances.length === 1 ? 'instance' : 'instances'} found
            across the Well-Tempered Clavier
          </p>
        </div>

        <div className="space-y-4">
          {instances.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-gray-400 mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No instances catalogued yet
                </h3>
                <p className="text-gray-600">
                  This feature has been defined but no specific occurrences have been identified in the WTC.
                </p>
              </CardContent>
            </Card>
          ) : (
            instances.map((instance) => (
              <InstanceCard
                key={instance.id}
                instance={instance}
              />
            ))
          )}
        </div>
      </div>

      {/* Back to top - Link to page top */}
      {instances.length > 5 && (
        <div className="max-w-7xl mx-auto px-6 pb-8 text-center">
          <a href="#" className="inline-block">
            <Button variant="ghost">
              Back to top
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: FeaturePageProps) {
  const resolvedParams = await params;
  const feature = await getFeature(resolvedParams.featureId);

  if (!feature) {
    return {
      title: 'Feature Not Found - Clavier',
      description: 'The requested feature could not be found.',
    };
  }

  const instanceText = feature.instanceCount > 0
    ? `${feature.instanceCount} ${feature.instanceCount === 1 ? 'instance' : 'instances'} `
    : '';

  return {
    title: `${feature.name} - Explorer - Clavier`,
    description: feature.description || `Explore ${instanceText}of ${feature.name} in the Well-Tempered Clavier`,
    openGraph: {
      title: `${feature.name} | Clavier Musical Feature Explorer`,
      description: feature.description || `Explore ${instanceText}of ${feature.name} in Bach's Well-Tempered Clavier`,
    },
  };
}
