// Re-export all Prisma types for use throughout the application
export type {
  // Music content models
  Piece,
  Measure,
  Note,
  Annotation,

  // Curriculum models
  Domain,
  Unit,
  Module,
  Lesson,

  // Feature taxonomy models
  Feature,
  FeatureInstance,

  // User progress
  UserProgress,

  // Enums
  PieceType,
  KeyMode,
  VoiceName,
  AnnotationType,
  AnnotationSource,
  FeatureCategory,
  EntityType,
  ProgressStatus,

  // Prisma utility types
  Prisma,
} from '@prisma/client';

// Import Prisma for advanced types
import { Prisma } from '@prisma/client';

// Useful composite types for common queries
export type PieceWithMeasures = Prisma.PieceGetPayload<{
  include: { measures: true };
}>;

export type PieceWithAnnotations = Prisma.PieceGetPayload<{
  include: { annotations: true };
}>;

export type PieceWithFeatures = Prisma.PieceGetPayload<{
  include: { featureInstances: { include: { feature: true } } };
}>;

export type PieceComplete = Prisma.PieceGetPayload<{
  include: {
    measures: {
      include: {
        notes: true;
        annotations: true;
      };
    };
    annotations: true;
    featureInstances: {
      include: {
        feature: true;
      };
    };
  };
}>;

export type MeasureWithNotes = Prisma.MeasureGetPayload<{
  include: { notes: true };
}>;

export type FeatureWithInstances = Prisma.FeatureGetPayload<{
  include: { featureInstances: true };
}>;

export type FeatureHierarchy = Prisma.FeatureGetPayload<{
  include: {
    children: true;
    parent: true;
  };
}>;

export type DomainWithUnits = Prisma.DomainGetPayload<{
  include: { units: true };
}>;

export type UnitComplete = Prisma.UnitGetPayload<{
  include: {
    domain: true;
    modules: {
      include: {
        lessons: true;
      };
    };
    prerequisites: true;
    dependentUnits: true;
  };
}>;

export type ModuleWithLessons = Prisma.ModuleGetPayload<{
  include: { lessons: true };
}>;

// Type guards
export function isPieceWithMeasures(
  piece: unknown
): piece is PieceWithMeasures {
  return (
    typeof piece === 'object' &&
    piece !== null &&
    'measures' in piece &&
    Array.isArray((piece as PieceWithMeasures).measures)
  );
}

export function isPieceComplete(piece: unknown): piece is PieceComplete {
  return (
    isPieceWithMeasures(piece) &&
    'annotations' in piece &&
    'featureInstances' in piece
  );
}

// Utility types for creating/updating records
export type CreatePieceInput = Prisma.PieceCreateInput;
export type UpdatePieceInput = Prisma.PieceUpdateInput;
export type CreateMeasureInput = Prisma.MeasureCreateInput;
export type CreateNoteInput = Prisma.NoteCreateInput;
export type CreateAnnotationInput = Prisma.AnnotationCreateInput;
export type CreateFeatureInput = Prisma.FeatureCreateInput;
export type CreateFeatureInstanceInput = Prisma.FeatureInstanceCreateInput;
export type CreateUserProgressInput = Prisma.UserProgressCreateInput;

// Query filter types
export type PieceWhereInput = Prisma.PieceWhereInput;
export type MeasureWhereInput = Prisma.MeasureWhereInput;
export type AnnotationWhereInput = Prisma.AnnotationWhereInput;
export type FeatureWhereInput = Prisma.FeatureWhereInput;
export type FeatureInstanceWhereInput = Prisma.FeatureInstanceWhereInput;
export type UserProgressWhereInput = Prisma.UserProgressWhereInput;

// Order by types
export type PieceOrderByInput = Prisma.PieceOrderByWithRelationInput;
export type MeasureOrderByInput = Prisma.MeasureOrderByWithRelationInput;
export type FeatureOrderByInput = Prisma.FeatureOrderByWithRelationInput;
