import { FeatureStats } from '@/components/explorer';
import { InstanceCard } from '@/components/explorer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FeatureWithStats, FeatureInstanceWithContext } from '@/types/explorer';
import { FEATURE_CATEGORY_LABELS } from '@/types/explorer';
import Link from 'next/link';

interface FeaturePageProps {
  params: {
    featureId: string;
  };
}

// Mock data fetching - replace with actual database queries
async function getFeature(_featureId: string): Promise<FeatureWithStats | null> {
  // TODO: Fetch from database with stats
  return null;
}

async function getFeatureInstances(
  _featureId: string
): Promise<FeatureInstanceWithContext[]> {
  // TODO: Fetch from database
  return [];
}

export default async function FeaturePage({ params }: FeaturePageProps) {
  const feature = await getFeature(params.featureId);
  const instances = await getFeatureInstances(params.featureId);

  if (!feature) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Feature not found
          </h1>
          <p className="text-gray-600 mb-4">
            The requested feature could not be found.
          </p>
          <Link href="/explorer">
            <Button>Back to Explorer</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/explorer">
            <Button variant="ghost" className="mb-4">
              ← Back to Explorer
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {feature.name}
              </h1>
              <div className="flex items-center gap-3">
                <Badge variant="default">
                  {FEATURE_CATEGORY_LABELS[feature.category]}
                </Badge>
                {feature.parentFeatureId && (
                  <span className="text-sm text-gray-600">
                    Subcategory
                  </span>
                )}
              </div>
            </div>
          </div>
          {feature.description && (
            <p className="text-gray-700 mt-4 max-w-3xl">
              {feature.description}
            </p>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <FeatureStats feature={feature} instances={instances} />
      </div>

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
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">No instances found for this feature.</p>
            </div>
          ) : (
            instances.map((instance) => (
              <InstanceCard
                key={instance.id}
                instance={instance}
                onClick={() => {
                  window.location.href = `/explorer/instance/${instance.id}`;
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: FeaturePageProps) {
  const feature = await getFeature(params.featureId);

  if (!feature) {
    return {
      title: 'Feature Not Found - Clavier',
    };
  }

  return {
    title: `${feature.name} - Explorer - Clavier`,
    description: feature.description || `Explore all instances of ${feature.name} in the Well-Tempered Clavier`,
  };
}
