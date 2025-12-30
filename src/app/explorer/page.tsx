import { ExplorerView } from '@/components/explorer';
import type { Feature, FeatureCategory } from '@/types/database';

// Mock data - replace with actual database queries
async function getFeatures(): Promise<Feature[]> {
  // TODO: Fetch from database
  return [];
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
