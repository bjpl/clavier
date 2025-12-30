/**
 * Client-side API fetch functions for Clavier
 * These functions handle HTTP requests to the Next.js API routes
 */

import { Piece, Measure, Annotation, Feature, FeatureInstance, Lesson, Domain } from '@prisma/client';

// Type definitions for API responses
export interface PieceFilters {
  book?: number;
  type?: 'PRELUDE' | 'FUGUE';
  key?: string;
  mode?: 'MAJOR' | 'MINOR';
}

export interface PiecesResponse {
  pieces: Piece[];
  total: number;
}

export interface MeasuresResponse {
  measures: (Measure & {
    notes: any[];
    annotations: Annotation[];
  })[];
}

export interface AnnotationsResponse {
  annotations: Annotation[];
}

export interface FeaturesResponse {
  features: (Feature & {
    parent?: { id: string; name: string } | null;
    children: { id: string; name: string; category: string }[];
    _count: { featureInstances: number };
  })[];
}

export interface FeatureInstancesResponse {
  instances: (FeatureInstance & {
    piece: Partial<Piece>;
  })[];
  total: number;
  limit: number;
  offset: number;
}

export interface SearchResult {
  id: string;
  type: 'feature' | 'instance';
  title: string;
  description: string;
  category?: string;
  pieceInfo?: {
    bwvNumber: number;
    book: number;
    type: string;
  };
  measureRange?: {
    start: number;
    end: number;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

export interface ProgressSummary {
  total: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  byEntityType: Record<string, number>;
}

export interface ProgressResponse {
  progress: any[];
  summary: ProgressSummary;
}

/**
 * Fetch all pieces with optional filters
 */
export async function fetchPieces(filters?: PieceFilters): Promise<PiecesResponse> {
  const params = new URLSearchParams();

  if (filters?.book) params.set('book', filters.book.toString());
  if (filters?.type) params.set('type', filters.type);
  if (filters?.key) params.set('key', filters.key);
  if (filters?.mode) params.set('mode', filters.mode);

  const url = `/api/pieces${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch pieces');
  }

  return response.json();
}

/**
 * Fetch a single piece by ID
 */
export async function fetchPiece(id: string): Promise<Piece> {
  const response = await fetch(`/api/pieces/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch piece');
  }

  return response.json();
}

/**
 * Fetch all measures for a piece
 */
export async function fetchMeasures(pieceId: string): Promise<MeasuresResponse> {
  const response = await fetch(`/api/pieces/${pieceId}/measures`);

  if (!response.ok) {
    throw new Error('Failed to fetch measures');
  }

  return response.json();
}

/**
 * Fetch a specific measure
 */
export async function fetchMeasure(
  pieceId: string,
  measureNum: number
): Promise<Measure> {
  const response = await fetch(`/api/pieces/${pieceId}/measures/${measureNum}`);

  if (!response.ok) {
    throw new Error('Failed to fetch measure');
  }

  return response.json();
}

/**
 * Fetch annotations for a piece
 */
export async function fetchAnnotations(
  pieceId: string,
  filters?: { layer?: number; type?: string }
): Promise<AnnotationsResponse> {
  const params = new URLSearchParams();

  if (filters?.layer !== undefined) params.set('layer', filters.layer.toString());
  if (filters?.type) params.set('type', filters.type);

  const url = `/api/pieces/${pieceId}/annotations${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch annotations');
  }

  return response.json();
}

/**
 * Fetch MusicXML score
 */
export async function fetchScore(pieceId: string): Promise<string> {
  const response = await fetch(`/api/pieces/${pieceId}/score`);

  if (!response.ok) {
    throw new Error('Failed to fetch score');
  }

  return response.text();
}

/**
 * Fetch MIDI data as JSON
 */
export async function fetchMidiData(pieceId: string): Promise<any> {
  const response = await fetch(`/api/pieces/${pieceId}/midi`);

  if (!response.ok) {
    throw new Error('Failed to fetch MIDI data');
  }

  return response.json();
}

/**
 * Fetch curriculum structure
 */
export async function fetchCurriculum(userId?: string): Promise<{
  domains: Domain[];
  progress: Record<string, any>;
}> {
  const url = userId ? `/api/curriculum?userId=${userId}` : '/api/curriculum';
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch curriculum');
  }

  return response.json();
}

/**
 * Fetch a specific domain
 */
export async function fetchDomain(id: string): Promise<Domain> {
  const response = await fetch(`/api/curriculum/domains/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch domain');
  }

  return response.json();
}

/**
 * Fetch a lesson
 */
export async function fetchLesson(id: string): Promise<Lesson> {
  const response = await fetch(`/api/curriculum/lessons/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch lesson');
  }

  return response.json();
}

/**
 * Fetch all features
 */
export async function fetchFeatures(filters?: {
  category?: string;
  search?: string;
}): Promise<FeaturesResponse> {
  const params = new URLSearchParams();

  if (filters?.category) params.set('category', filters.category);
  if (filters?.search) params.set('search', filters.search);

  const url = `/api/features${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch features');
  }

  return response.json();
}

/**
 * Fetch a specific feature
 */
export async function fetchFeature(id: string): Promise<Feature> {
  const response = await fetch(`/api/features/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch feature');
  }

  return response.json();
}

/**
 * Fetch feature instances
 */
export async function fetchFeatureInstances(
  featureId: string,
  filters?: {
    book?: number;
    key?: string;
    type?: string;
    sort?: 'piece' | 'measure' | 'complexity' | 'quality';
    limit?: number;
    offset?: number;
  }
): Promise<FeatureInstancesResponse> {
  const params = new URLSearchParams();

  if (filters?.book) params.set('book', filters.book.toString());
  if (filters?.key) params.set('key', filters.key);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.sort) params.set('sort', filters.sort);
  if (filters?.limit) params.set('limit', filters.limit.toString());
  if (filters?.offset) params.set('offset', filters.offset.toString());

  const url = `/api/features/${featureId}/instances${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch feature instances');
  }

  return response.json();
}

/**
 * Search features and instances
 */
export async function searchFeatures(
  query: string,
  filters?: { category?: string; limit?: number }
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query });

  if (filters?.category) params.set('category', filters.category);
  if (filters?.limit) params.set('limit', filters.limit.toString());

  const response = await fetch(`/api/search?${params}`);

  if (!response.ok) {
    throw new Error('Search failed');
  }

  return response.json();
}

/**
 * Fetch a specific feature instance
 */
export async function fetchInstance(id: string): Promise<FeatureInstance> {
  const response = await fetch(`/api/instances/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch instance');
  }

  return response.json();
}

/**
 * Fetch user progress
 */
export async function fetchProgress(userId: string): Promise<ProgressResponse> {
  const response = await fetch(`/api/progress?userId=${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch progress');
  }

  return response.json();
}

/**
 * Update user progress
 */
export async function updateProgress(data: {
  userId: string;
  entityType: string;
  entityId: string;
  status: string;
  metadata?: any;
}): Promise<any> {
  const response = await fetch('/api/progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update progress');
  }

  return response.json();
}

/**
 * Update lesson progress
 */
export async function updateLessonProgress(
  lessonId: string,
  data: {
    userId: string;
    sectionIndex: number;
    completed: boolean;
  }
): Promise<any> {
  const response = await fetch(`/api/progress/lesson/${lessonId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update lesson progress');
  }

  return response.json();
}

/**
 * Fetch glossary terms
 */
export async function fetchGlossary(filters?: {
  search?: string;
  category?: string;
}): Promise<{ terms: any[]; total: number }> {
  const params = new URLSearchParams();

  if (filters?.search) params.set('search', filters.search);
  if (filters?.category) params.set('category', filters.category);

  const url = `/api/glossary${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch glossary');
  }

  return response.json();
}

/**
 * Fetch a specific glossary term
 */
export async function fetchGlossaryTerm(term: string): Promise<any> {
  const response = await fetch(`/api/glossary/${term}`);

  if (!response.ok) {
    throw new Error('Failed to fetch glossary term');
  }

  return response.json();
}
