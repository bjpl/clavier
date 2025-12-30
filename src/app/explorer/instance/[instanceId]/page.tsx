import { InstanceDetail } from '@/components/explorer';
import { Button } from '@/components/ui/button';
import type { FeatureInstanceWithContext } from '@/types/explorer';
import Link from 'next/link';

interface InstancePageProps {
  params: {
    instanceId: string;
  };
}

// Mock data fetching - replace with actual database queries
async function getInstance(
  _instanceId: string
): Promise<FeatureInstanceWithContext | null> {
  // TODO: Fetch from database with all related data
  return null;
}

export default async function InstancePage({ params }: InstancePageProps) {
  const instance = await getInstance(params.instanceId);

  if (!instance) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Instance not found
          </h1>
          <p className="text-gray-600 mb-4">
            The requested feature instance could not be found.
          </p>
          <Link href="/explorer">
            <Button>Back to Explorer</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePlayback = () => {
    // TODO: Implement audio playback
    console.log('Playing instance:', instance.id);
  };

  const handleNavigateToWalkthrough = () => {
    window.location.href = `/walkthrough/${instance.piece.id}?measure=${instance.measureStart}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link href={`/explorer/feature/${instance.feature.id}`}>
          <Button variant="ghost" className="mb-6">
            ← Back to {instance.feature.name}
          </Button>
        </Link>

        <InstanceDetail
          instance={instance}
          onPlayback={handlePlayback}
          onNavigateToWalkthrough={handleNavigateToWalkthrough}
        />
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: InstancePageProps) {
  const instance = await getInstance(params.instanceId);

  if (!instance) {
    return {
      title: 'Instance Not Found - Clavier',
    };
  }

  return {
    title: `${instance.feature.name} in BWV ${instance.piece.bwvNumber} - Explorer - Clavier`,
    description: `${instance.feature.name} in BWV ${instance.piece.bwvNumber}, measures ${instance.measureStart}–${instance.measureEnd}`,
  };
}
