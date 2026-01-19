'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';

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

  return {
    piece: data,
    error,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Hook to fetch measure commentary
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

  return {
    commentary: data?.commentary,
    annotations: data?.annotations || [],
    featureInstances: data?.featureInstances || [],
    error,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Hook to fetch score XML
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

  return {
    scoreXML: data,
    error,
    isLoading,
  };
}

/**
 * Hook to fetch MIDI data for playback
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

  return {
    midiData: data,
    error,
    isLoading,
  };
}

/**
 * Hook to fetch similar patterns for a feature
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

  return {
    patterns: data?.instances || [],
    total: data?.total || 0,
    error,
    isLoading,
  };
}

/**
 * Hook to fetch glossary definition
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

  return {
    definition: data,
    error,
    isLoading,
  };
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

  return {
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
    isLoading: piecesLoading || pieceLoading || !pieceId,
    isCommentaryLoading: commentaryLoading,
    isScoreLoading: scoreLoading,
    isMidiLoading: midiLoading,

    // Errors
    error: piecesError,

    // Actions
    goToMeasure,
    nextMeasure,
    prevMeasure,
  };
}
