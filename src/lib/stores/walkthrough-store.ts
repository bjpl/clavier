import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface WalkthroughState {
  // Current state
  currentPieceId: string | null;
  currentMeasure: number;

  // Settings
  autoAdvance: boolean;
  narrationEnabled: boolean;
  narrationAutoPlay: boolean;

  // Progress tracking
  visitedMeasures: number[];

  // Actions
  setPiece: (pieceId: string) => void;
  setMeasure: (measure: number) => void;
  nextMeasure: () => void;
  prevMeasure: () => void;
  markVisited: (measure: number) => void;
  clearVisited: () => void;
  toggleAutoAdvance: () => void;
  setAutoAdvance: (enabled: boolean) => void;
  toggleNarration: () => void;
  setNarration: (enabled: boolean) => void;
  toggleNarrationAutoPlay: () => void;
  setNarrationAutoPlay: (enabled: boolean) => void;
  reset: () => void;
  resetPiece: () => void;
}

const initialState = {
  currentPieceId: null,
  currentMeasure: 0,
  autoAdvance: false,
  narrationEnabled: true,
  narrationAutoPlay: true,
  visitedMeasures: [],
};

export const useWalkthroughStore = create<WalkthroughState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setPiece: (pieceId: string) =>
          set(
            {
              currentPieceId: pieceId,
              currentMeasure: 0,
              visitedMeasures: [0],
            },
            false,
            'walkthrough/setPiece'
          ),

        setMeasure: (measure: number) =>
          set(
            (state) => ({
              currentMeasure: measure,
              visitedMeasures: state.visitedMeasures.includes(measure)
                ? state.visitedMeasures
                : [...state.visitedMeasures, measure].sort((a, b) => a - b),
            }),
            false,
            'walkthrough/setMeasure'
          ),

        nextMeasure: () =>
          set(
            (state) => {
              const nextMeasure = state.currentMeasure + 1;
              return {
                currentMeasure: nextMeasure,
                visitedMeasures: state.visitedMeasures.includes(nextMeasure)
                  ? state.visitedMeasures
                  : [...state.visitedMeasures, nextMeasure].sort((a, b) => a - b),
              };
            },
            false,
            'walkthrough/nextMeasure'
          ),

        prevMeasure: () =>
          set(
            (state) => ({
              currentMeasure: Math.max(0, state.currentMeasure - 1),
            }),
            false,
            'walkthrough/prevMeasure'
          ),

        markVisited: (measure: number) =>
          set(
            (state) => ({
              visitedMeasures: state.visitedMeasures.includes(measure)
                ? state.visitedMeasures
                : [...state.visitedMeasures, measure].sort((a, b) => a - b),
            }),
            false,
            'walkthrough/markVisited'
          ),

        clearVisited: () => set({ visitedMeasures: [] }, false, 'walkthrough/clearVisited'),

        toggleAutoAdvance: () =>
          set(
            (state) => ({ autoAdvance: !state.autoAdvance }),
            false,
            'walkthrough/toggleAutoAdvance'
          ),

        setAutoAdvance: (enabled: boolean) =>
          set({ autoAdvance: enabled }, false, 'walkthrough/setAutoAdvance'),

        toggleNarration: () =>
          set(
            (state) => ({ narrationEnabled: !state.narrationEnabled }),
            false,
            'walkthrough/toggleNarration'
          ),

        setNarration: (enabled: boolean) =>
          set({ narrationEnabled: enabled }, false, 'walkthrough/setNarration'),

        toggleNarrationAutoPlay: () =>
          set(
            (state) => ({ narrationAutoPlay: !state.narrationAutoPlay }),
            false,
            'walkthrough/toggleNarrationAutoPlay'
          ),

        setNarrationAutoPlay: (enabled: boolean) =>
          set({ narrationAutoPlay: enabled }, false, 'walkthrough/setNarrationAutoPlay'),

        reset: () => set(initialState, false, 'walkthrough/reset'),

        resetPiece: () =>
          set(
            {
              currentMeasure: 0,
              visitedMeasures: [0],
            },
            false,
            'walkthrough/resetPiece'
          ),
      }),
      {
        name: 'clavier-walkthrough',
        partialize: (state) => ({
          currentPieceId: state.currentPieceId,
          currentMeasure: state.currentMeasure,
          autoAdvance: state.autoAdvance,
          narrationEnabled: state.narrationEnabled,
          narrationAutoPlay: state.narrationAutoPlay,
          visitedMeasures: state.visitedMeasures,
        }),
      }
    ),
    { name: 'WalkthroughStore' }
  )
);

// Selectors
export const selectCurrentPosition = (state: WalkthroughState) => ({
  pieceId: state.currentPieceId,
  measure: state.currentMeasure,
});

export const selectSettings = (state: WalkthroughState) => ({
  autoAdvance: state.autoAdvance,
  narrationEnabled: state.narrationEnabled,
  narrationAutoPlay: state.narrationAutoPlay,
});

export const selectProgress = (state: WalkthroughState) => ({
  visitedMeasures: state.visitedMeasures,
  totalVisited: state.visitedMeasures.length,
});

export const selectHasVisited = (measure: number) => (state: WalkthroughState) =>
  state.visitedMeasures.includes(measure);
