import { ExplorerView } from '@/components/explorer';
import { db } from '@/lib/db';
import type { Feature, FeatureCategory } from '@/types/database';

async function getFeatures(): Promise<Feature[]> {
  const features = await db.feature.findMany({
    orderBy: [
      { category: 'asc' },
      { name: 'asc' },
    ],
    include: {
      parent: {
        select: {
          id: true,
          name: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
      _count: {
        select: {
          featureInstances: true,
        },
      },
    },
  });

  // Map Prisma result to Feature type
  return features.map(f => ({
    ...f,
    instanceCount: f._count.featureInstances,
  })) as unknown as Feature[];
}

async function getCategories(): Promise<FeatureCategory[]> {
  // Return all Prisma FeatureCategory enum values
  return [
    'HARMONY',
    'COUNTERPOINT',
    'RHYTHM',
    'MELODY',
    'FORM',
    'TEXTURE',
    'FUGUE',
    'PERFORMANCE',
    'OTHER',
  ] as FeatureCategory[];
}

export default async function ExplorerPage() {
  const features = await getFeatures();
  const categories = await getCategories();

  return (
    <div className="h-screen">
      <ExplorerView features={features} categories={categories} />
    </div>
  );
}

export const metadata = {
  title: 'Explorer - Clavier',
  description: 'Discover and explore musical features across the Well-Tempered Clavier',
};
