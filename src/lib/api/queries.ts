/**
 * TanStack Query hooks for Clavier API
 * These hooks provide caching, invalidation, and state management for API calls
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPieces,
  fetchPiece,
  fetchMeasures,
  fetchMeasure,
  fetchAnnotations,
  fetchScore,
  fetchMidiData,
  fetchCurriculum,
  fetchDomain,
  fetchLesson,
  fetchFeatures,
  fetchFeature,
  fetchFeatureInstances,
  searchFeatures,
  fetchInstance,
  fetchProgress,
  updateProgress,
  updateLessonProgress,
  fetchGlossary,
  fetchGlossaryTerm,
  PieceFilters,
} from './fetchers';

// Query key factories for better organization and type safety
export const queryKeys = {
  pieces: {
    all: ['pieces'] as const,
    lists: () => [...queryKeys.pieces.all, 'list'] as const,
    list: (filters?: PieceFilters) => [...queryKeys.pieces.lists(), filters] as const,
    details: () => [...queryKeys.pieces.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.pieces.details(), id] as const,
  },
  measures: {
    all: ['measures'] as const,
    lists: () => [...queryKeys.measures.all, 'list'] as const,
    list: (pieceId: string) => [...queryKeys.measures.lists(), pieceId] as const,
    details: () => [...queryKeys.measures.all, 'detail'] as const,
    detail: (pieceId: string, measureNum: number) =>
      [...queryKeys.measures.details(), pieceId, measureNum] as const,
  },
  annotations: {
    all: ['annotations'] as const,
    list: (pieceId: string, filters?: any) =>
      [...queryKeys.annotations.all, pieceId, filters] as const,
  },
  curriculum: {
    all: ['curriculum'] as const,
    list: (userId?: string) => [...queryKeys.curriculum.all, 'list', userId] as const,
    domains: () => [...queryKeys.curriculum.all, 'domains'] as const,
    domain: (id: string) => [...queryKeys.curriculum.domains(), id] as const,
    lessons: () => [...queryKeys.curriculum.all, 'lessons'] as const,
    lesson: (id: string) => [...queryKeys.curriculum.lessons(), id] as const,
  },
  features: {
    all: ['features'] as const,
    lists: () => [...queryKeys.features.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.features.lists(), filters] as const,
    details: () => [...queryKeys.features.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.features.details(), id] as const,
    instances: (featureId: string, filters?: any) =>
      [...queryKeys.features.all, 'instances', featureId, filters] as const,
  },
  search: {
    all: ['search'] as const,
    results: (query: string, filters?: any) =>
      [...queryKeys.search.all, query, filters] as const,
  },
  progress: {
    all: ['progress'] as const,
    user: (userId: string) => [...queryKeys.progress.all, userId] as const,
  },
  glossary: {
    all: ['glossary'] as const,
    lists: () => [...queryKeys.glossary.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.glossary.lists(), filters] as const,
    term: (term: string) => [...queryKeys.glossary.all, 'term', term] as const,
  },
};

// ============================================================================
// PIECE QUERIES
// ============================================================================

/**
 * Hook to fetch all pieces with optional filters
 */
export function usePieces(filters?: PieceFilters) {
  return useQuery({
    queryKey: queryKeys.pieces.list(filters),
    queryFn: () => fetchPieces(filters),
  });
}

/**
 * Hook to fetch a single piece
 */
export function usePiece(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.pieces.detail(id),
    queryFn: () => fetchPiece(id),
    enabled: enabled && !!id,
  });
}

/**
 * Hook to fetch measures for a piece
 */
export function useMeasures(pieceId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.measures.list(pieceId),
    queryFn: () => fetchMeasures(pieceId),
    enabled: enabled && !!pieceId,
  });
}

/**
 * Hook to fetch a specific measure
 */
export function useMeasure(pieceId: string, measureNum: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.measures.detail(pieceId, measureNum),
    queryFn: () => fetchMeasure(pieceId, measureNum),
    enabled: enabled && !!pieceId && measureNum > 0,
  });
}

/**
 * Hook to fetch annotations for a piece
 */
export function useAnnotations(
  pieceId: string,
  filters?: { layer?: number; type?: string },
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.annotations.list(pieceId, filters),
    queryFn: () => fetchAnnotations(pieceId, filters),
    enabled: enabled && !!pieceId,
  });
}

/**
 * Hook to fetch MusicXML score
 */
export function useScore(pieceId: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.pieces.detail(pieceId), 'score'],
    queryFn: () => fetchScore(pieceId),
    enabled: enabled && !!pieceId,
    staleTime: Infinity, // Scores don't change
  });
}

/**
 * Hook to fetch MIDI data
 */
export function useMidiData(pieceId: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.pieces.detail(pieceId), 'midi'],
    queryFn: () => fetchMidiData(pieceId),
    enabled: enabled && !!pieceId,
  });
}

// ============================================================================
// CURRICULUM QUERIES
// ============================================================================

/**
 * Hook to fetch curriculum structure
 */
export function useCurriculum(userId?: string) {
  return useQuery({
    queryKey: queryKeys.curriculum.list(userId),
    queryFn: () => fetchCurriculum(userId),
  });
}

/**
 * Hook to fetch a specific domain
 */
export function useDomain(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.curriculum.domain(id),
    queryFn: () => fetchDomain(id),
    enabled: enabled && !!id,
  });
}

/**
 * Hook to fetch a lesson
 */
export function useLesson(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.curriculum.lesson(id),
    queryFn: () => fetchLesson(id),
    enabled: enabled && !!id,
  });
}

// ============================================================================
// FEATURE QUERIES
// ============================================================================

/**
 * Hook to fetch all features
 */
export function useFeatures(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.features.list(filters),
    queryFn: () => fetchFeatures(filters),
  });
}

/**
 * Hook to fetch a specific feature
 */
export function useFeature(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.features.detail(id),
    queryFn: () => fetchFeature(id),
    enabled: enabled && !!id,
  });
}

/**
 * Hook to fetch feature instances
 */
export function useFeatureInstances(
  featureId: string,
  filters?: {
    book?: number;
    key?: string;
    type?: string;
    sort?: 'piece' | 'measure' | 'complexity' | 'quality';
    limit?: number;
    offset?: number;
  },
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.features.instances(featureId, filters),
    queryFn: () => fetchFeatureInstances(featureId, filters),
    enabled: enabled && !!featureId,
  });
}

/**
 * Hook to fetch a specific feature instance
 */
export function useInstance(id: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.features.all, 'instance', id],
    queryFn: () => fetchInstance(id),
    enabled: enabled && !!id,
  });
}

// ============================================================================
// SEARCH QUERIES
// ============================================================================

/**
 * Hook to search features and instances
 */
export function useFeatureSearch(
  query: string,
  filters?: { category?: string; limit?: number },
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.search.results(query, filters),
    queryFn: () => searchFeatures(query, filters),
    enabled: enabled && query.length >= 2,
  });
}

// ============================================================================
// PROGRESS QUERIES & MUTATIONS
// ============================================================================

/**
 * Hook to fetch user progress
 */
export function useProgress(userId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.progress.user(userId),
    queryFn: () => fetchProgress(userId),
    enabled: enabled && !!userId,
  });
}

/**
 * Hook to update progress
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProgress,
    onSuccess: (_data, variables) => {
      // Invalidate progress queries for this user
      queryClient.invalidateQueries({
        queryKey: queryKeys.progress.user(variables.userId),
      });
    },
  });
}

/**
 * Hook to update lesson progress
 */
export function useUpdateLessonProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, ...data }: {
      lessonId: string;
      userId: string;
      sectionIndex: number;
      completed: boolean;
    }) => updateLessonProgress(lessonId, data),
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.progress.user(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.curriculum.lesson(variables.lessonId),
      });
    },
  });
}

// ============================================================================
// GLOSSARY QUERIES
// ============================================================================

/**
 * Hook to fetch glossary terms
 */
export function useGlossary(filters?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: queryKeys.glossary.list(filters),
    queryFn: () => fetchGlossary(filters),
  });
}

/**
 * Hook to fetch a specific glossary term
 */
export function useGlossaryTerm(term: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.glossary.term(term),
    queryFn: () => fetchGlossaryTerm(term),
    enabled: enabled && !!term,
  });
}
