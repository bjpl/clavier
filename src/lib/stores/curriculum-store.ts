import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface LessonProgress {
  lessonId: string;
  percentage: number;
  completedSections: number[];
  lastAccessedAt: string;
  completed: boolean;
}

interface CurriculumState {
  // Current lesson state
  currentLessonId: string | null;
  currentSectionIndex: number;

  // Progress tracking
  completedLessons: string[];
  lessonProgress: Record<string, LessonProgress>;

  // Actions
  setLesson: (lessonId: string) => void;
  setSection: (index: number) => void;
  nextSection: () => void;
  prevSection: () => void;
  completeSection: (lessonId: string, sectionIndex: number) => void;
  completeLesson: (lessonId: string) => void;
  updateProgress: (lessonId: string, percentage: number) => void;
  resetLesson: (lessonId: string) => void;
  reset: () => void;
  getLessonProgress: (lessonId: string) => LessonProgress | null;
  isLessonCompleted: (lessonId: string) => boolean;
  isSectionCompleted: (lessonId: string, sectionIndex: number) => boolean;
}

const initialState = {
  currentLessonId: null,
  currentSectionIndex: 0,
  completedLessons: [],
  lessonProgress: {},
};

export const useCurriculumStore = create<CurriculumState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setLesson: (lessonId: string) =>
          set(
            (state) => {
              const progress = state.lessonProgress[lessonId];
              return {
                currentLessonId: lessonId,
                currentSectionIndex: progress ? Math.max(...progress.completedSections, 0) : 0,
                lessonProgress: {
                  ...state.lessonProgress,
                  [lessonId]: {
                    ...progress,
                    lessonId,
                    percentage: progress?.percentage ?? 0,
                    completedSections: progress?.completedSections ?? [],
                    lastAccessedAt: new Date().toISOString(),
                    completed: progress?.completed ?? false,
                  },
                },
              };
            },
            false,
            'curriculum/setLesson'
          ),

        setSection: (index: number) =>
          set(
            { currentSectionIndex: Math.max(0, index) },
            false,
            'curriculum/setSection'
          ),

        nextSection: () =>
          set(
            (state) => ({ currentSectionIndex: state.currentSectionIndex + 1 }),
            false,
            'curriculum/nextSection'
          ),

        prevSection: () =>
          set(
            (state) => ({
              currentSectionIndex: Math.max(0, state.currentSectionIndex - 1),
            }),
            false,
            'curriculum/prevSection'
          ),

        completeSection: (lessonId: string, sectionIndex: number) =>
          set(
            (state) => {
              const progress = state.lessonProgress[lessonId] || {
                lessonId,
                percentage: 0,
                completedSections: [],
                lastAccessedAt: new Date().toISOString(),
                completed: false,
              };

              const completedSections = progress.completedSections.includes(sectionIndex)
                ? progress.completedSections
                : [...progress.completedSections, sectionIndex].sort((a, b) => a - b);

              return {
                lessonProgress: {
                  ...state.lessonProgress,
                  [lessonId]: {
                    ...progress,
                    completedSections,
                    lastAccessedAt: new Date().toISOString(),
                  },
                },
              };
            },
            false,
            'curriculum/completeSection'
          ),

        completeLesson: (lessonId: string) =>
          set(
            (state) => {
              const progress = state.lessonProgress[lessonId] || {
                lessonId,
                percentage: 0,
                completedSections: [],
                lastAccessedAt: new Date().toISOString(),
                completed: false,
              };

              return {
                completedLessons: state.completedLessons.includes(lessonId)
                  ? state.completedLessons
                  : [...state.completedLessons, lessonId],
                lessonProgress: {
                  ...state.lessonProgress,
                  [lessonId]: {
                    ...progress,
                    percentage: 100,
                    completed: true,
                    lastAccessedAt: new Date().toISOString(),
                  },
                },
              };
            },
            false,
            'curriculum/completeLesson'
          ),

        updateProgress: (lessonId: string, percentage: number) =>
          set(
            (state) => {
              const progress = state.lessonProgress[lessonId] || {
                lessonId,
                percentage: 0,
                completedSections: [],
                lastAccessedAt: new Date().toISOString(),
                completed: false,
              };

              return {
                lessonProgress: {
                  ...state.lessonProgress,
                  [lessonId]: {
                    ...progress,
                    percentage: Math.max(0, Math.min(100, percentage)),
                    lastAccessedAt: new Date().toISOString(),
                  },
                },
              };
            },
            false,
            'curriculum/updateProgress'
          ),

        resetLesson: (lessonId: string) =>
          set(
            (state) => ({
              completedLessons: state.completedLessons.filter((id) => id !== lessonId),
              lessonProgress: {
                ...state.lessonProgress,
                [lessonId]: {
                  lessonId,
                  percentage: 0,
                  completedSections: [],
                  lastAccessedAt: new Date().toISOString(),
                  completed: false,
                },
              },
            }),
            false,
            'curriculum/resetLesson'
          ),

        reset: () => set(initialState, false, 'curriculum/reset'),

        getLessonProgress: (lessonId: string) => {
          return get().lessonProgress[lessonId] || null;
        },

        isLessonCompleted: (lessonId: string) => {
          return get().completedLessons.includes(lessonId);
        },

        isSectionCompleted: (lessonId: string, sectionIndex: number) => {
          const progress = get().lessonProgress[lessonId];
          return progress?.completedSections.includes(sectionIndex) ?? false;
        },
      }),
      {
        name: 'clavier-curriculum',
        partialize: (state) => ({
          completedLessons: state.completedLessons,
          lessonProgress: state.lessonProgress,
        }),
      }
    ),
    { name: 'CurriculumStore' }
  )
);

// Selectors
export const selectCurrentLesson = (state: CurriculumState) => ({
  lessonId: state.currentLessonId,
  sectionIndex: state.currentSectionIndex,
});

export const selectLessonProgress = (lessonId: string) => (state: CurriculumState) =>
  state.lessonProgress[lessonId] || null;

export const selectCompletedLessons = (state: CurriculumState) => state.completedLessons;

export const selectOverallProgress = (state: CurriculumState) => {
  const totalLessons = Object.keys(state.lessonProgress).length;
  const completedCount = state.completedLessons.length;
  return {
    total: totalLessons,
    completed: completedCount,
    percentage: totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0,
  };
};

export const selectRecentLessons = (limit: number = 5) => (state: CurriculumState) => {
  return Object.values(state.lessonProgress)
    .sort(
      (a, b) =>
        new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
    )
    .slice(0, limit);
};
