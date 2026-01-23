'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import useSWR from 'swr';

// Stable empty arrays to prevent creating new references on every render
// These are module-level constants that never change
const EMPTY_ANNOTATIONS: never[] = [];
const EMPTY_FEATURE_INSTANCES: never[] = [];
const EMPTY_PATTERNS: never[] = [];

/**
 * Types for walkthrough data
 */
export interface PieceData {
  id: string;
  bwvNumber: number;
  book: number;
  numberInBook: number;
  type: 'PRELUDE' | 'FUGUE';
  keyTonic: string;
  keyMode: string;
  timeSignature: string;
  tempo: number;
  totalMeasures: number;
  totalDurationSeconds?: number;
  musicxmlPath?: string;
  _count?: {
    measures: number;
    annotations: number;
    featureInstances: number;
  };
}

export interface MeasureData {
  measureNumber: number;
  notes: Array<{
    midiNumber: number;
    startBeat: number;
    durationBeats: number;
    voice: number;
  }>;
  annotations: Array<{
    id: string;
    annotationType: string;
    content: string;
    layer: number;
  }>;
}

export interface CommentaryData {
  measureNumber: number;
  commentary: {
    text: string;
    terms: string[];
    lessonId: string | null;
    featureId: string | null;
  };
  annotations: Array<{
    id: string;
    annotationType: string;
    content: string;
  }>;
  featureInstances: Array<{
    id: string;
    featureId: string;
    featureName: string;
    category: string;
    measureRange: [number, number];
  }>;
}

export interface SimilarPattern {
  pieceId: string;
  bwvNumber: number;
  type: string;
  measureStart: number;
  measureEnd: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Failed to fetch');
    throw error;
  }
  return res.json();
};

/**
 * Hook to fetch and manage walkthrough piece data
 * CRITICAL: Return object is memoized to prevent infinite re-render loops (React Error #185)
 */
export function useWalkthroughPiece(pieceId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<PieceData>(
    pieceId ? `/api/pieces/${pieceId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  // CRITICAL: Memoize return object to prevent cascading re-renders
  return useMemo(() => ({
    piece: data,
    error,
    isLoading,
    refresh: mutate,
  }), [data, error, isLoading, mutate]);
}

/**
 * Hook to fetch measure commentary
 * CRITICAL: Return object is memoized to prevent infinite re-render loops (React Error #185)
 */
export function useMeasureCommentary(
  pieceId: string | null,
  measureNumber: number
) {
  const { data, error, isLoading, mutate } = useSWR<CommentaryData>(
    pieceId && measureNumber > 0
      ? `/api/pieces/${pieceId}/commentary/${measureNumber}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  // CRITICAL: Use stable empty array references instead of creating new [] on every render
  // Without this, `|| []` creates a new array every render, causing infinite re-render loops
  const annotations = data?.annotations ?? EMPTY_ANNOTATIONS;
  const featureInstances = data?.featureInstances ?? EMPTY_FEATURE_INSTANCES;

  // CRITICAL: Memoize return object to prevent cascading re-renders
  return useMemo(() => ({
    commentary: data?.commentary,
    annotations,
    featureInstances,
    error,
    isLoading,
    refresh: mutate,
  }), [data?.commentary, annotations, featureInstances, error, isLoading, mutate]);
}

/**
 * Hook to fetch score XML
 * CRITICAL: Return object is memoized to prevent infinite re-render loops (React Error #185)
 */
export function useScoreXML(pieceId: string | null) {
  const { data, error, isLoading } = useSWR<string>(
    pieceId ? `/api/pieces/${pieceId}/score` : null,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch score');
      return res.text();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // Cache for 5 minutes
    }
  );

  // CRITICAL: Memoize return object to prevent cascading re-renders
  return useMemo(() => ({
    scoreXML: data,
    error,
    isLoading,
  }), [data, error, isLoading]);
}

/**
 * Hook to fetch MIDI data for playback
 * CRITICAL: Return object is memoized to prevent infinite re-render loops (React Error #185)
 */
export function useMidiData(pieceId: string | null) {
  const { data, error, isLoading } = useSWR(
    pieceId ? `/api/pieces/${pieceId}/midi` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  // CRITICAL: Memoize return object to prevent cascading re-renders
  return useMemo(() => ({
    midiData: data,
    error,
    isLoading,
  }), [data, error, isLoading]);
}

/**
 * Hook to fetch similar patterns for a feature
 * CRITICAL: Return object is memoized to prevent infinite re-render loops (React Error #185)
 */
export function useSimilarPatterns(featureId: string | null, limit = 10) {
  const { data, error, isLoading } = useSWR<{
    instances: SimilarPattern[];
    total: number;
  }>(
    featureId ? `/api/features/${featureId}/instances?limit=${limit}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  // CRITICAL: Use stable empty array reference instead of creating new [] on every render
  const patterns = data?.instances ?? EMPTY_PATTERNS;

  // CRITICAL: Memoize return object to prevent cascading re-renders
  return useMemo(() => ({
    patterns,
    total: data?.total || 0,
    error,
    isLoading,
  }), [patterns, data?.total, error, isLoading]);
}

/**
 * Hook to fetch glossary definition
 * CRITICAL: Return object is memoized to prevent infinite re-render loops (React Error #185)
 */
export function useGlossaryTerm(term: string | null) {
  const normalizedTerm = term?.toLowerCase().replace(/\s+/g, '-');

  const { data, error, isLoading } = useSWR(
    normalizedTerm ? `/api/glossary/${normalizedTerm}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  // CRITICAL: Memoize return object to prevent cascading re-renders
  return useMemo(() => ({
    definition: data,
    error,
    isLoading,
  }), [data, error, isLoading]);
}

/**
 * Comprehensive hook for walkthrough data management
 */
export function useWalkthroughData(bwv: string, type: string) {
  const [pieceId, setPieceId] = useState<string | null>(null);
  const [currentMeasure, setCurrentMeasure] = useState(1);

  // Fetch piece by BWV number and type
  const {
    data: piecesData,
    error: piecesError,
    isLoading: piecesLoading,
  } = useSWR<{ pieces: PieceData[] }>(
    `/api/pieces?bwv=${bwv}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Find the correct piece (prelude or fugue)
  useEffect(() => {
    if (piecesData?.pieces) {
      const pieceType = type.toUpperCase();
      const piece = piecesData.pieces.find(
        (p) => p.bwvNumber === parseInt(bwv, 10) && p.type === pieceType
      );
      if (piece) {
        setPieceId(piece.id);
      }
    }
  }, [piecesData, bwv, type]);

  // Fetch piece details
  const { piece, isLoading: pieceLoading } = useWalkthroughPiece(pieceId);

  // Fetch commentary for current measure
  const {
    commentary,
    annotations,
    featureInstances,
    isLoading: commentaryLoading,
  } = useMeasureCommentary(pieceId, currentMeasure);

  // Fetch score XML
  const { scoreXML, isLoading: scoreLoading } = useScoreXML(pieceId);

  // Fetch MIDI data
  const { midiData, isLoading: midiLoading } = useMidiData(pieceId);

  const goToMeasure = useCallback((measure: number) => {
    setCurrentMeasure(Math.max(1, measure));
  }, []);

  const nextMeasure = useCallback(() => {
    if (piece) {
      setCurrentMeasure((m) => Math.min(piece.totalMeasures, m + 1));
    }
  }, [piece]);

  const prevMeasure = useCallback(() => {
    setCurrentMeasure((m) => Math.max(1, m - 1));
  }, []);

  // CRITICAL: Memoize return object to prevent infinite re-render loops
  // Without useMemo, this creates a NEW object on every render, which causes
  // any component using this hook to re-render infinitely (React Error #185)
  return useMemo(() => ({
    // Data
    pieceId,
    piece,
    currentMeasure,
    commentary,
    annotations,
    featureInstances,
    scoreXML,
    midiData,
    totalMeasures: piece?.totalMeasures || 0,

    // Loading states
    // NOTE: Don't include !pieceId here - if API returns no data, we should show fallback UI not infinite loading
    isLoading: piecesLoading || pieceLoading,
    isCommentaryLoading: commentaryLoading,
    isScoreLoading: scoreLoading,
    isMidiLoading: midiLoading,

    // Errors
    error: piecesError,

    // Actions
    goToMeasure,
    nextMeasure,
    prevMeasure,
  }), [
    pieceId,
    piece,
    currentMeasure,
    commentary,
    annotations,
    featureInstances,
    scoreXML,
    midiData,
    piecesLoading,
    pieceLoading,
    commentaryLoading,
    scoreLoading,
    midiLoading,
    piecesError,
    goToMeasure,
    nextMeasure,
    prevMeasure,
  ]);
}
