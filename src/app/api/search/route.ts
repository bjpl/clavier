import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma, FeatureCategory, PieceType, KeyMode } from '@prisma/client';
import type { SearchResult, SortOption, FeatureInstanceWithContext } from '@/types/explorer';

// Validation constants
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
const MIN_QUERY_LENGTH = 2;

// Valid enum values for validation
const VALID_CATEGORIES = Object.values(FeatureCategory);
const VALID_PIECE_TYPES = Object.values(PieceType);
const VALID_KEY_MODES = Object.values(KeyMode);
const VALID_SORT_OPTIONS: SortOption[] = [
  'relevance',
  'piece-asc',
  'piece-desc',
  'measure-asc',
  'measure-desc',
  'complexity-asc',
  'complexity-desc',
];

interface SearchParams {
  query: string | null;
  categories: FeatureCategory[];
  keyFilter: string | null;
  modeFilter: KeyMode | null;
  bookFilter: number | null;
  typeFilter: PieceType | null;
  difficultyMin: number | null;
  difficultyMax: number | null;
  featureId: string | null;
  pieceId: string | null;
  sortBy: SortOption;
  limit: number;
  offset: number;
}

/**
 * Parse and validate search parameters from the request
 */
function parseSearchParams(searchParams: URLSearchParams): SearchParams {
  // Parse categories (can be comma-separated or multiple params)
  const categoryParam = searchParams.get('categories') || searchParams.get('category');
  const categories: FeatureCategory[] = [];
  if (categoryParam) {
    const categoryValues = categoryParam.split(',').map(c => c.trim().toUpperCase());
    for (const cat of categoryValues) {
      if (VALID_CATEGORIES.includes(cat as FeatureCategory)) {
        categories.push(cat as FeatureCategory);
      }
    }
  }

  // Parse book filter
  const bookParam = searchParams.get('book');
  let bookFilter: number | null = null;
  if (bookParam) {
    const book = parseInt(bookParam, 10);
    if (book === 1 || book === 2) {
      bookFilter = book;
    }
  }

  // Parse type filter
  const typeParam = searchParams.get('type')?.toUpperCase();
  const typeFilter = VALID_PIECE_TYPES.includes(typeParam as PieceType)
    ? (typeParam as PieceType)
    : null;

  // Parse mode filter
  const modeParam = searchParams.get('mode')?.toUpperCase();
  const modeFilter = VALID_KEY_MODES.includes(modeParam as KeyMode)
    ? (modeParam as KeyMode)
    : null;

  // Parse difficulty range
  const diffMinParam = searchParams.get('difficultyMin');
  const diffMaxParam = searchParams.get('difficultyMax');
  const difficultyMin = diffMinParam ? Math.max(1, Math.min(5, parseInt(diffMinParam, 10))) : null;
  const difficultyMax = diffMaxParam ? Math.max(1, Math.min(5, parseInt(diffMaxParam, 10))) : null;

  // Parse sort option
  const sortParam = searchParams.get('sort') as SortOption;
  const sortBy = VALID_SORT_OPTIONS.includes(sortParam) ? sortParam : 'relevance';

  // Parse pagination
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limitParam || String(DEFAULT_LIMIT), 10)));
  const offset = Math.max(0, parseInt(offsetParam || '0', 10));

  return {
    query: searchParams.get('q'),
    categories,
    keyFilter: searchParams.get('key'),
    modeFilter,
    bookFilter,
    typeFilter,
    difficultyMin,
    difficultyMax,
    featureId: searchParams.get('featureId'),
    pieceId: searchParams.get('pieceId'),
    sortBy,
    limit,
    offset,
  };
}

/**
 * Build Prisma where clause for feature instances
 */
function buildWhereClause(params: SearchParams): Prisma.FeatureInstanceWhereInput {
  const conditions: Prisma.FeatureInstanceWhereInput[] = [];

  // Text search across features and pieces
  if (params.query && params.query.length >= MIN_QUERY_LENGTH) {
    const queryLower = params.query.toLowerCase();
    conditions.push({
      OR: [
        // Search feature name and description
        { feature: { name: { contains: params.query, mode: 'insensitive' } } },
        { feature: { description: { contains: params.query, mode: 'insensitive' } } },
        { feature: { searchKeywords: { has: queryLower } } },
        // Search instance description
        { description: { contains: params.query, mode: 'insensitive' } },
        // Search by BWV number (if query is numeric)
        ...(isNumeric(params.query)
          ? [{ piece: { bwvNumber: parseInt(params.query, 10) } }]
          : []),
        // Search by key tonic
        { piece: { keyTonic: { equals: params.query, mode: 'insensitive' } } },
      ],
    });
  }

  // Category filter
  if (params.categories.length > 0) {
    conditions.push({
      feature: { category: { in: params.categories } },
    });
  }

  // Key filter (tonic)
  if (params.keyFilter) {
    conditions.push({
      piece: { keyTonic: { equals: params.keyFilter, mode: 'insensitive' } },
    });
  }

  // Mode filter (major/minor)
  if (params.modeFilter) {
    conditions.push({
      piece: { keyMode: params.modeFilter },
    });
  }

  // Book filter
  if (params.bookFilter) {
    conditions.push({
      piece: { book: params.bookFilter },
    });
  }

  // Type filter (prelude/fugue)
  if (params.typeFilter) {
    conditions.push({
      piece: { type: params.typeFilter },
    });
  }

  // Feature difficulty filter
  if (params.difficultyMin !== null || params.difficultyMax !== null) {
    const difficultyCondition: Prisma.FeatureWhereInput = {};
    if (params.difficultyMin !== null) {
      difficultyCondition.difficultyLevel = { gte: params.difficultyMin };
    }
    if (params.difficultyMax !== null) {
      difficultyCondition.difficultyLevel = {
        ...difficultyCondition.difficultyLevel as object,
        lte: params.difficultyMax,
      };
    }
    conditions.push({ feature: difficultyCondition });
  }

  // Specific feature filter
  if (params.featureId) {
    conditions.push({ featureId: params.featureId });
  }

  // Specific piece filter
  if (params.pieceId) {
    conditions.push({ pieceId: params.pieceId });
  }

  // Combine all conditions with AND
  return conditions.length > 0 ? { AND: conditions } : {};
}

/**
 * Build Prisma orderBy clause
 */
function buildOrderByClause(
  sortBy: SortOption
): Prisma.FeatureInstanceOrderByWithRelationInput[] {
  switch (sortBy) {
    case 'piece-asc':
      return [
        { piece: { book: 'asc' } },
        { piece: { numberInBook: 'asc' } },
        { piece: { type: 'asc' } },
      ];
    case 'piece-desc':
      return [
        { piece: { book: 'desc' } },
        { piece: { numberInBook: 'desc' } },
        { piece: { type: 'desc' } },
      ];
    case 'measure-asc':
      return [{ measureStart: 'asc' }, { measureEnd: 'asc' }];
    case 'measure-desc':
      return [{ measureStart: 'desc' }, { measureEnd: 'desc' }];
    case 'complexity-asc':
      return [{ complexityScore: 'asc' }, { feature: { difficultyLevel: 'asc' } }];
    case 'complexity-desc':
      return [{ complexityScore: 'desc' }, { feature: { difficultyLevel: 'desc' } }];
    case 'relevance':
    default:
      // For relevance, prioritize verified instances and quality score
      return [
        { verified: 'desc' },
        { qualityScore: 'desc' },
        { piece: { book: 'asc' } },
        { piece: { numberInBook: 'asc' } },
      ];
  }
}

/**
 * Calculate facets (aggregation counts) for filtering UI
 */
async function calculateFacets(
  whereClause: Prisma.FeatureInstanceWhereInput
): Promise<SearchResult['facets']> {
  // Get all matching instances with minimal data for facet calculation
  const instances = await db.featureInstance.findMany({
    where: whereClause,
    select: {
      feature: { select: { category: true } },
      piece: { select: { keyTonic: true, keyMode: true, book: true, type: true } },
    },
  });

  // Initialize category facets
  const categories = {} as Record<FeatureCategory, number>;
  for (const cat of VALID_CATEGORIES) {
    categories[cat] = 0;
  }

  // Initialize key facets
  const keys: Record<string, number> = {};

  // Initialize book facets
  const books: Record<string, number> = { '1': 0, '2': 0 };

  // Initialize type facets
  const types = {} as Record<PieceType, number>;
  for (const t of VALID_PIECE_TYPES) {
    types[t] = 0;
  }

  // Aggregate counts
  for (const instance of instances) {
    // Category
    categories[instance.feature.category]++;

    // Key (combine tonic and mode)
    const keyLabel = `${instance.piece.keyTonic} ${instance.piece.keyMode.toLowerCase()}`;
    keys[keyLabel] = (keys[keyLabel] || 0) + 1;

    // Book
    books[String(instance.piece.book)]++;

    // Type
    types[instance.piece.type]++;
  }

  return { categories, keys, books, types };
}

/**
 * Check if a string is numeric
 */
function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
}

/**
 * Create empty facets for when no results are found
 */
function createEmptyFacets(): SearchResult['facets'] {
  return {
    categories: Object.fromEntries(VALID_CATEGORIES.map(c => [c, 0])) as Record<FeatureCategory, number>,
    keys: {},
    books: { '1': 0, '2': 0 },
    types: Object.fromEntries(VALID_PIECE_TYPES.map(t => [t, 0])) as Record<PieceType, number>,
  };
}

/**
 * Check if we have any filter criteria
 */
function hasFilterCriteria(params: SearchParams): boolean {
  return !!(
    params.query ||
    params.categories.length > 0 ||
    params.keyFilter ||
    params.modeFilter ||
    params.bookFilter ||
    params.typeFilter ||
    params.featureId ||
    params.pieceId ||
    params.difficultyMin !== null ||
    params.difficultyMax !== null
  );
}

/**
 * Execute the search query and return results
 */
async function executeSearch(params: SearchParams): Promise<SearchResult> {
  const whereClause = buildWhereClause(params);

  // Execute count and search in parallel for performance
  const [totalCount, instances, facets] = await Promise.all([
    db.featureInstance.count({ where: whereClause }),
    db.featureInstance.findMany({
      where: whereClause,
      include: {
        feature: true,
        piece: true,
      },
      orderBy: buildOrderByClause(params.sortBy),
      take: params.limit,
      skip: params.offset,
    }),
    calculateFacets(whereClause),
  ]);

  // Cast instances to expected type - Prisma returns compatible types
  const typedInstances = instances as unknown as FeatureInstanceWithContext[];

  return {
    instances: typedInstances,
    totalCount,
    facets,
  };
}

/**
 * GET /api/search
 *
 * Search for feature instances across the WTC corpus.
 *
 * Query Parameters:
 * - q: Search query (min 2 chars for text search, optional if other filters provided)
 * - categories: Comma-separated list of feature categories
 * - key: Key tonic filter (e.g., "C", "F#", "Bb")
 * - mode: Key mode filter (MAJOR or MINOR)
 * - book: WTC book filter (1 or 2)
 * - type: Piece type filter (PRELUDE or FUGUE)
 * - difficultyMin: Minimum difficulty level (1-5)
 * - difficultyMax: Maximum difficulty level (1-5)
 * - featureId: Filter by specific feature ID
 * - pieceId: Filter by specific piece ID
 * - sort: Sort option (relevance, piece-asc, piece-desc, measure-asc, measure-desc, complexity-asc, complexity-desc)
 * - limit: Maximum results to return (default 20, max 100)
 * - offset: Number of results to skip (for pagination)
 *
 * Response: SearchResult object with instances, totalCount, and facets
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = parseSearchParams(searchParams);

    // If query is provided but too short, return error
    if (params.query && params.query.length < MIN_QUERY_LENGTH) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: `Search query must be at least ${MIN_QUERY_LENGTH} characters`,
        },
        { status: 400 }
      );
    }

    // If no filters at all, return empty with message
    if (!hasFilterCriteria(params)) {
      return NextResponse.json({
        instances: [],
        totalCount: 0,
        facets: createEmptyFacets(),
        message: 'Please provide a search query or filter criteria',
      } satisfies SearchResult & { message: string });
    }

    const result = await executeSearch(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);

    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          error: 'database_error',
          message: 'A database error occurred while processing your search',
          code: error.code,
        },
        { status: 500 }
      );
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid search parameters provided',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred while processing your search',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/search
 *
 * Alternative endpoint for complex searches with JSON body.
 * Useful for advanced filtering that doesn't fit well in query parameters.
 *
 * Body:
 * {
 *   query?: string,
 *   categories?: FeatureCategory[],
 *   key?: string,
 *   mode?: "MAJOR" | "MINOR",
 *   book?: 1 | 2,
 *   type?: "PRELUDE" | "FUGUE",
 *   difficultyMin?: number,
 *   difficultyMax?: number,
 *   featureId?: string,
 *   pieceId?: string,
 *   sort?: SortOption,
 *   limit?: number,
 *   offset?: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Convert body to URLSearchParams for unified handling
    const searchParams = new URLSearchParams();

    if (body.query) searchParams.set('q', body.query);
    if (body.categories) searchParams.set('categories', body.categories.join(','));
    if (body.key) searchParams.set('key', body.key);
    if (body.mode) searchParams.set('mode', body.mode);
    if (body.book) searchParams.set('book', String(body.book));
    if (body.type) searchParams.set('type', body.type);
    if (body.difficultyMin) searchParams.set('difficultyMin', String(body.difficultyMin));
    if (body.difficultyMax) searchParams.set('difficultyMax', String(body.difficultyMax));
    if (body.featureId) searchParams.set('featureId', body.featureId);
    if (body.pieceId) searchParams.set('pieceId', body.pieceId);
    if (body.sort) searchParams.set('sort', body.sort);
    if (body.limit) searchParams.set('limit', String(body.limit));
    if (body.offset) searchParams.set('offset', String(body.offset));

    const params = parseSearchParams(searchParams);

    // Validate query length if provided
    if (params.query && params.query.length < MIN_QUERY_LENGTH) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: `Search query must be at least ${MIN_QUERY_LENGTH} characters`,
        },
        { status: 400 }
      );
    }

    // Return empty if no filters
    if (!hasFilterCriteria(params)) {
      return NextResponse.json({
        instances: [],
        totalCount: 0,
        facets: createEmptyFacets(),
        message: 'Please provide a search query or filter criteria',
      } satisfies SearchResult & { message: string });
    }

    const result = await executeSearch(params);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'parse_error',
          message: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    console.error('Search API error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          error: 'database_error',
          message: 'A database error occurred while processing your search',
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred while processing your search',
      },
      { status: 500 }
    );
  }
}
