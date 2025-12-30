import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface LoopPoint {
  measure: number;
  beat: number;
}

interface PlaybackState {
  // Playback state
  isPlaying: boolean;
  currentPieceId: string | null;
  currentMeasure: number;
  currentBeat: number;

  // Tempo controls
  tempo: number;
  tempoMultiplier: number;

  // Volume controls
  volume: number;
  isMuted: boolean;

  // Loop controls
  loopEnabled: boolean;
  loopStart: LoopPoint | null;
  loopEnd: LoopPoint | null;

  // Active notes (for visual feedback)
  activeNotes: number[];

  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (measure: number, beat?: number) => void;
  setTempo: (tempo: number) => void;
  setTempoMultiplier: (multiplier: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  enableLoop: (start: LoopPoint, end: LoopPoint) => void;
  disableLoop: () => void;
  setLoopStart: (point: LoopPoint) => void;
  setLoopEnd: (point: LoopPoint) => void;
  addActiveNote: (noteNumber: number) => void;
  removeActiveNote: (noteNumber: number) => void;
  clearActiveNotes: () => void;
  setPiece: (pieceId: string, tempo?: number) => void;
  reset: () => void;
}

const initialState = {
  isPlaying: false,
  currentPieceId: null,
  currentMeasure: 0,
  currentBeat: 0,
  tempo: 120,
  tempoMultiplier: 1.0,
  volume: 75,
  isMuted: false,
  loopEnabled: false,
  loopStart: null,
  loopEnd: null,
  activeNotes: [],
};

export const usePlaybackStore = create<PlaybackState>()(
  devtools(
    (set) => ({
      ...initialState,

      play: () => set({ isPlaying: true }, false, 'playback/play'),

      pause: () => set({ isPlaying: false }, false, 'playback/pause'),

      stop: () =>
        set(
          {
            isPlaying: false,
            currentMeasure: 0,
            currentBeat: 0,
            activeNotes: [],
          },
          false,
          'playback/stop'
        ),

      seek: (measure: number, beat: number = 0) =>
        set(
          {
            currentMeasure: measure,
            currentBeat: beat,
            activeNotes: [],
          },
          false,
          'playback/seek'
        ),

      setTempo: (tempo: number) =>
        set({ tempo: Math.max(40, Math.min(240, tempo)) }, false, 'playback/setTempo'),

      setTempoMultiplier: (multiplier: number) =>
        set(
          { tempoMultiplier: Math.max(0.25, Math.min(2.0, multiplier)) },
          false,
          'playback/setTempoMultiplier'
        ),

      setVolume: (volume: number) =>
        set({ volume: Math.max(0, Math.min(100, volume)) }, false, 'playback/setVolume'),

      toggleMute: () =>
        set((state) => ({ isMuted: !state.isMuted }), false, 'playback/toggleMute'),

      setMuted: (muted: boolean) => set({ isMuted: muted }, false, 'playback/setMuted'),

      enableLoop: (start: LoopPoint, end: LoopPoint) =>
        set(
          {
            loopEnabled: true,
            loopStart: start,
            loopEnd: end,
          },
          false,
          'playback/enableLoop'
        ),

      disableLoop: () =>
        set(
          {
            loopEnabled: false,
            loopStart: null,
            loopEnd: null,
          },
          false,
          'playback/disableLoop'
        ),

      setLoopStart: (point: LoopPoint) =>
        set({ loopStart: point }, false, 'playback/setLoopStart'),

      setLoopEnd: (point: LoopPoint) =>
        set({ loopEnd: point }, false, 'playback/setLoopEnd'),

      addActiveNote: (noteNumber: number) =>
        set(
          (state) => ({
            activeNotes: state.activeNotes.includes(noteNumber)
              ? state.activeNotes
              : [...state.activeNotes, noteNumber],
          }),
          false,
          'playback/addActiveNote'
        ),

      removeActiveNote: (noteNumber: number) =>
        set(
          (state) => ({
            activeNotes: state.activeNotes.filter((n) => n !== noteNumber),
          }),
          false,
          'playback/removeActiveNote'
        ),

      clearActiveNotes: () => set({ activeNotes: [] }, false, 'playback/clearActiveNotes'),

      setPiece: (pieceId: string, tempo?: number) =>
        set(
          {
            currentPieceId: pieceId,
            currentMeasure: 0,
            currentBeat: 0,
            isPlaying: false,
            activeNotes: [],
            ...(tempo !== undefined && { tempo }),
          },
          false,
          'playback/setPiece'
        ),

      reset: () => set(initialState, false, 'playback/reset'),
    }),
    { name: 'PlaybackStore' }
  )
);

// Selectors for optimized component subscriptions
export const selectIsPlaying = (state: PlaybackState) => state.isPlaying;
export const selectCurrentPosition = (state: PlaybackState) => ({
  measure: state.currentMeasure,
  beat: state.currentBeat,
});
export const selectTempo = (state: PlaybackState) => ({
  base: state.tempo,
  multiplier: state.tempoMultiplier,
  effective: state.tempo * state.tempoMultiplier,
});
export const selectVolume = (state: PlaybackState) => ({
  level: state.volume,
  isMuted: state.isMuted,
  effective: state.isMuted ? 0 : state.volume,
});
export const selectLoop = (state: PlaybackState) => ({
  enabled: state.loopEnabled,
  start: state.loopStart,
  end: state.loopEnd,
});
