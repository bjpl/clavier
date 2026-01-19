import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Generate contextual commentary for a measure based on its annotations and features
 */
function generateCommentary(
  measure: any,
  piece: any,
  features: any[]
): {
  text: string;
  terms: string[];
  lessonId: string | null;
  featureId: string | null;
} {
  const annotations = measure.annotations || [];
  const harmonyAnnotation = annotations.find(
    (a: any) => a.annotationType === 'HARMONY'
  );
  const structureAnnotation = annotations.find(
    (a: any) => a.annotationType === 'STRUCTURE'
  );

  const terms: string[] = [];
  const textParts: string[] = [];

  // Base key context
  const keyDescription = `${piece.keyTonic} ${piece.keyMode?.toLowerCase() || 'major'}`;

  // Harmony-based commentary
  if (harmonyAnnotation) {
    const content = harmonyAnnotation.content;
    textParts.push(`This measure features ${content} harmony.`);

    // Extract musical terms from annotation
    const harmonyTerms = ['tonic', 'dominant', 'subdominant', 'cadence', 'modulation'];
    harmonyTerms.forEach((term) => {
      if (content.toLowerCase().includes(term)) {
        terms.push(term);
      }
    });
  }

  // Structure-based commentary
  if (structureAnnotation) {
    textParts.push(structureAnnotation.content);

    // Extract structural terms
    const structureTerms = ['subject', 'answer', 'countersubject', 'episode', 'stretto'];
    structureTerms.forEach((term) => {
      if (structureAnnotation.content.toLowerCase().includes(term)) {
        terms.push(term);
      }
    });
  }

  // Feature-based commentary
  if (features.length > 0) {
    const featureNames = features.map((f) => f.feature.name);
    if (featureNames.length === 1) {
      textParts.push(`Notable feature: ${featureNames[0]}.`);
    } else if (featureNames.length > 1) {
      textParts.push(
        `Notable features include: ${featureNames.slice(0, -1).join(', ')} and ${featureNames[featureNames.length - 1]}.`
      );
    }
  }

  // Default commentary if nothing specific
  if (textParts.length === 0) {
    const noteCount = measure.notes?.length || 0;
    const voiceCount = new Set(measure.notes?.map((n: any) => n.voice) || []).size;

    if (piece.type === 'FUGUE') {
      textParts.push(
        `Measure ${measure.measureNumber} continues the contrapuntal texture in ${keyDescription}.`
      );
      terms.push('counterpoint');
    } else {
      textParts.push(
        `This measure presents ${voiceCount > 1 ? 'a multi-voice' : 'the melodic'} passage in ${keyDescription}.`
      );
    }

    if (noteCount > 8) {
      textParts.push('The texture is relatively dense here.');
    }
  }

  // Determine lesson association based on features/annotations
  let lessonId: string | null = null;
  let featureId: string | null = null;

  if (features.length > 0) {
    featureId = features[0].featureId;
    // Map features to lessons
    const feature = features[0].feature;
    if (feature.category === 'HARMONY') {
      lessonId = 'harmony-basics';
    } else if (feature.category === 'COUNTERPOINT') {
      lessonId = 'counterpoint-intro';
    } else if (feature.category === 'FUGUE') {
      lessonId = 'fugue-structure';
    }
  }

  return {
    text: textParts.join(' '),
    terms: [...new Set(terms)], // Deduplicate
    lessonId,
    featureId,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; measureNum: string } }
) {
  try {
    const measureNumber = parseInt(params.measureNum, 10);

    if (isNaN(measureNumber)) {
      return NextResponse.json(
        { error: 'Invalid measure number' },
        { status: 400 }
      );
    }

    // Fetch measure with annotations
    const measure = await db.measure.findUnique({
      where: {
        pieceId_measureNumber: {
          pieceId: params.id,
          measureNumber,
        },
      },
      include: {
        notes: {
          orderBy: [{ voice: 'asc' }, { startBeat: 'asc' }],
        },
        annotations: true,
        piece: {
          select: {
            keyTonic: true,
            keyMode: true,
            type: true,
            bwvNumber: true,
          },
        },
      },
    });

    if (!measure) {
      return NextResponse.json({ error: 'Measure not found' }, { status: 404 });
    }

    // Fetch feature instances for this measure
    const featureInstances = await db.featureInstance.findMany({
      where: {
        pieceId: params.id,
        measureStart: { lte: measureNumber },
        measureEnd: { gte: measureNumber },
      },
      include: {
        feature: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true,
          },
        },
      },
    });

    // Generate commentary
    const commentary = generateCommentary(measure, measure.piece, featureInstances);

    return NextResponse.json({
      measureNumber,
      commentary,
      annotations: measure.annotations,
      featureInstances: featureInstances.map((fi) => ({
        id: fi.id,
        featureId: fi.featureId,
        featureName: fi.feature.name,
        category: fi.feature.category,
        measureRange: [fi.measureStart, fi.measureEnd],
      })),
    });
  } catch (error) {
    console.error('Error fetching measure commentary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch measure commentary' },
      { status: 500 }
    );
  }
}
