/**
 * API Input Validation Schemas using Zod
 *
 * NOTE: Zod must be installed before using this module:
 *   npm install zod
 *
 * These schemas provide runtime validation for API route parameters,
 * ensuring type safety and consistent error handling.
 */
import { z } from 'zod';

// =============================================================================
// ID Schemas
// =============================================================================

/**
 * Validates piece IDs - expects CUID format from Prisma
 * Example: "clx1abc23def456ghi789"
 */
export const pieceIdSchema = z.string().cuid({ message: 'Invalid piece ID format' });

/**
 * Generic string ID for entities that may not use CUID
 */
export const stringIdSchema = z.string().min(1, { message: 'ID is required' });

// =============================================================================
// Numeric Schemas
// =============================================================================

/**
 * Validates measure numbers - must be positive integers
 * Coerces string inputs (from URL params) to numbers
 */
export const measureNumSchema = z.coerce
  .number({ invalid_type_error: 'Measure number must be a number' })
  .int({ message: 'Measure number must be an integer' })
  .positive({ message: 'Measure number must be positive' });

/**
 * Validates BWV numbers (Bach-Werke-Verzeichnis catalog numbers)
 * Range: 846-893 for Well-Tempered Clavier
 */
export const bwvNumberSchema = z.coerce
  .number({ invalid_type_error: 'BWV number must be a number' })
  .int({ message: 'BWV number must be an integer' })
  .min(846, { message: 'BWV number must be at least 846' })
  .max(893, { message: 'BWV number must be at most 893' });

/**
 * Validates book numbers - Well-Tempered Clavier has 2 books
 */
export const bookNumberSchema = z.coerce
  .number({ invalid_type_error: 'Book number must be a number' })
  .int({ message: 'Book number must be an integer' })
  .min(1, { message: 'Book number must be 1 or 2' })
  .max(2, { message: 'Book number must be 1 or 2' });

// =============================================================================
// Enum Schemas
// =============================================================================

/**
 * Piece type: PRELUDE or FUGUE
 */
export const pieceTypeSchema = z.enum(['PRELUDE', 'FUGUE'], {
  errorMap: () => ({ message: 'Type must be PRELUDE or FUGUE' }),
});

/**
 * Key mode: MAJOR or MINOR
 */
export const pieceModeSchema = z.enum(['MAJOR', 'MINOR'], {
  errorMap: () => ({ message: 'Mode must be MAJOR or MINOR' }),
});

/**
 * Musical key tonic values
 */
export const keyTonicSchema = z.enum([
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F',
  'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
], {
  errorMap: () => ({ message: 'Invalid key tonic' }),
});

// =============================================================================
// Pagination Schemas
// =============================================================================

/**
 * Standard pagination parameters
 */
export const paginationSchema = z.object({
  limit: z.coerce
    .number({ invalid_type_error: 'Limit must be a number' })
    .int({ message: 'Limit must be an integer' })
    .min(1, { message: 'Limit must be at least 1' })
    .max(100, { message: 'Limit cannot exceed 100' })
    .default(50),
  offset: z.coerce
    .number({ invalid_type_error: 'Offset must be a number' })
    .int({ message: 'Offset must be an integer' })
    .min(0, { message: 'Offset cannot be negative' })
    .default(0),
});

// =============================================================================
// Composite Schemas
// =============================================================================

/**
 * Query parameters for /api/pieces endpoint
 */
export const piecesQuerySchema = z.object({
  bwv: bwvNumberSchema.optional(),
  book: bookNumberSchema.optional(),
  type: pieceTypeSchema.optional(),
  key: keyTonicSchema.optional(),
  mode: pieceModeSchema.optional(),
  limit: paginationSchema.shape.limit.optional(),
  offset: paginationSchema.shape.offset.optional(),
});

/**
 * Route parameters for /api/pieces/[id]
 */
export const pieceParamsSchema = z.object({
  id: pieceIdSchema,
});

/**
 * Route parameters for /api/pieces/[id]/measures/[measureNum]
 */
export const measureParamsSchema = z.object({
  id: pieceIdSchema,
  measureNum: measureNumSchema,
});

// =============================================================================
// Type Exports
// =============================================================================

export type PiecesQuery = z.infer<typeof piecesQuerySchema>;
export type PieceParams = z.infer<typeof pieceParamsSchema>;
export type MeasureParams = z.infer<typeof measureParamsSchema>;
export type Pagination = z.infer<typeof paginationSchema>;

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Validates data against a schema and returns a formatted error response or the parsed data
 */
export function validateOrError<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; details: z.ZodIssue[] } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues;
    const primaryError = errors[0]?.message || 'Validation failed';
    return {
      success: false,
      error: primaryError,
      details: errors,
    };
  }

  return { success: true, data: result.data };
}

/**
 * Extracts and validates query parameters from a NextRequest URL
 */
export function parseSearchParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): { success: true; data: T } | { success: false; error: string; details: z.ZodIssue[] } {
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return validateOrError(schema, params);
}
