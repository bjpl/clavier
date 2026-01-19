import { InstanceDetail } from '@/components/explorer';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import type { FeatureInstanceWithContext, RelatedInstanceWithPiece } from '@/types/explorer';
import type { Feature, Piece } from '@/types/database';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface InstancePageProps {
  params: Promise<{
    instanceId: string;
  }>;
}

/**
 * Fetches a feature instance with all related context from the database.
 * Includes: feature details, piece context, related instances, and curriculum references.
 */
async function getInstance(
  instanceId: string
): Promise<FeatureInstanceWithContext | null> {
  try {
    // Fetch the instance with feature and piece details
    const instance = await db.featureInstance.findUnique({
      where: { id: instanceId },
      include: {
        feature: {
          include: {
            parent: true,
          },
        },
        piece: true,
      },
    });

    if (!instance) {
      return null;
    }

    // Find related instances (same feature in other pieces or different locations)
    const relatedInstances = await db.featureInstance.findMany({
      where: {
        featureId: instance.featureId,
        id: { not: instance.id },
      },
      include: {
        piece: {
          select: {
            id: true,
            bwvNumber: true,
            type: true,
            keyTonic: true,
            keyMode: true,
            book: true,
          },
        },
      },
      orderBy: [
        { qualityScore: 'desc' },
        { piece: { bwvNumber: 'asc' } },
      ],
      take: 5,
    });

    // Format related instances with piece info for display
    const formattedRelatedInstances: RelatedInstanceWithPiece[] = relatedInstances.map((ri) => ({
      id: ri.id,
      featureId: ri.featureId,
      pieceId: ri.pieceId,
      measureStart: ri.measureStart,
      measureEnd: ri.measureEnd,
      beatStart: ri.beatStart,
      beatEnd: ri.beatEnd,
      voicesInvolved: ri.voicesInvolved,
      localKey: ri.localKey,
      description: ri.description,
      complexityScore: ri.complexityScore,
      qualityScore: ri.qualityScore,
      verified: ri.verified,
      source: ri.source,
      metadata: ri.metadata,
      createdAt: ri.createdAt,
      updatedAt: ri.updatedAt,
      piece: ri.piece,
    }));

    // Transform to FeatureInstanceWithContext format
    const result: FeatureInstanceWithContext = {
      id: instance.id,
      featureId: instance.featureId,
      pieceId: instance.pieceId,
      measureStart: instance.measureStart,
      measureEnd: instance.measureEnd,
      beatStart: instance.beatStart,
      beatEnd: instance.beatEnd,
      voicesInvolved: instance.voicesInvolved,
      localKey: instance.localKey,
      description: instance.description,
      complexityScore: instance.complexityScore,
      qualityScore: instance.qualityScore,
      verified: instance.verified,
      source: instance.source,
      metadata: instance.metadata,
      createdAt: instance.createdAt,
      updatedAt: instance.updatedAt,
      feature: instance.feature as Feature,
      piece: instance.piece as Piece,
      relatedInstances: formattedRelatedInstances,
      curriculumReferences: [], // Could be extended to find related lessons
    };

    return result;
  } catch (error) {
    console.error('Error fetching feature instance:', error);
    return null;
  }
}

export default async function InstancePage({ params }: InstancePageProps) {
  const { instanceId } = await params;
  const instance = await getInstance(instanceId);

  if (!instance) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link href={`/explorer/feature/${instance.feature.id}`}>
          <Button variant="ghost" className="mb-6">
            &larr; Back to {instance.feature.name}
          </Button>
        </Link>

        <InstanceDetail instance={instance} />
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: InstancePageProps) {
  const { instanceId } = await params;
  const instance = await getInstance(instanceId);

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
