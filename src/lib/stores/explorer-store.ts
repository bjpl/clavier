import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type PieceType = 'PRELUDE' | 'FUGUE';
export type SortOption = 'piece' | 'measure' | 'complexity' | 'relevance';

export interface FeatureInstance {
  id: string;
  pieceId: string;
  measureNumber: number;
  featureName: string;
  category: string;
  description: string;
  complexity?: number;
  relevanceScore?: number;
}

interface ExplorerState {
  // Search and filters
  searchQuery: string;
  selectedCategories: string[];
  selectedFeatures: string[];
  keyFilter: string | null;
  bookFilter: number | null;
  typeFilter: PieceType | null;
  sortBy: SortOption;

  // Results
  results: FeatureInstance[];
  filteredResults: FeatureInstance[];
  totalResults: number;
  isLoading: boolean;
  error: string | null;

  // Pagination
  page: number;
  pageSize: number;
  hasMore: boolean;

  // Actions
  setSearch: (query: string) => void;
  clearSearch: () => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  setCategories: (categories: string[]) => void;
  clearCategories: () => void;
  addFeature: (feature: string) => void;
  removeFeature: (feature: string) => void;
  setFeatures: (features: string[]) => void;
  clearFeatures: () => void;
  setKeyFilter: (key: string | null) => void;
  setBookFilter: (book: number | null) => void;
  setTypeFilter: (type: PieceType | null) => void;
  clearFilters: () => void;
  setSortBy: (sort: SortOption) => void;
  setResults: (results: FeatureInstance[], total?: number) => void;
  appendResults: (results: FeatureInstance[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadMore: () => void;
  reset: () => void;
}

const initialState = {
  searchQuery: '',
  selectedCategories: [],
  selectedFeatures: [],
  keyFilter: null,
  bookFilter: null,
  typeFilter: null,
  sortBy: 'relevance' as SortOption,
  results: [],
  filteredResults: [],
  totalResults: 0,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,
  hasMore: false,
};

// Helper function to apply filters and sorting
const applyFiltersAndSort = (
  results: FeatureInstance[],
  state: {
    selectedCategories: string[];
    selectedFeatures: string[];
    sortBy: SortOption;
  }
): FeatureInstance[] => {
  let filtered = [...results];

  // Apply category filter
  if (state.selectedCategories.length > 0) {
    filtered = filtered.filter((r) => state.selectedCategories.includes(r.category));
  }

  // Apply feature filter
  if (state.selectedFeatures.length > 0) {
    filtered = filtered.filter((r) => state.selectedFeatures.includes(r.featureName));
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (state.sortBy) {
      case 'piece':
        return a.pieceId.localeCompare(b.pieceId);
      case 'measure':
        return a.measureNumber - b.measureNumber;
      case 'complexity':
        return (b.complexity || 0) - (a.complexity || 0);
      case 'relevance':
      default:
        return (b.relevanceScore || 0) - (a.relevanceScore || 0);
    }
  });

  return filtered;
};

export const useExplorerStore = create<ExplorerState>()(
  devtools(
    (set) => ({
      ...initialState,

      setSearch: (query: string) =>
        set({ searchQuery: query, page: 1 }, false, 'explorer/setSearch'),

      clearSearch: () => set({ searchQuery: '', page: 1 }, false, 'explorer/clearSearch'),

      addCategory: (category: string) =>
        set(
          (state) => {
            if (state.selectedCategories.includes(category)) return state;
            const selectedCategories = [...state.selectedCategories, category];
            return {
              selectedCategories,
              filteredResults: applyFiltersAndSort(state.results, {
                ...state,
                selectedCategories,
              }),
              page: 1,
            };
          },
          false,
          'explorer/addCategory'
        ),

      removeCategory: (category: string) =>
        set(
          (state) => {
            const selectedCategories = state.selectedCategories.filter((c) => c !== category);
            return {
              selectedCategories,
              filteredResults: applyFiltersAndSort(state.results, {
                ...state,
                selectedCategories,
              }),
              page: 1,
            };
          },
          false,
          'explorer/removeCategory'
        ),

      setCategories: (categories: string[]) =>
        set(
          (state) => ({
            selectedCategories: categories,
            filteredResults: applyFiltersAndSort(state.results, {
              ...state,
              selectedCategories: categories,
            }),
            page: 1,
          }),
          false,
          'explorer/setCategories'
        ),

      clearCategories: () =>
        set(
          (state) => ({
            selectedCategories: [],
            filteredResults: applyFiltersAndSort(state.results, {
              ...state,
              selectedCategories: [],
            }),
            page: 1,
          }),
          false,
          'explorer/clearCategories'
        ),

      addFeature: (feature: string) =>
        set(
          (state) => {
            if (state.selectedFeatures.includes(feature)) return state;
            const selectedFeatures = [...state.selectedFeatures, feature];
            return {
              selectedFeatures,
              filteredResults: applyFiltersAndSort(state.results, {
                ...state,
                selectedFeatures,
              }),
              page: 1,
            };
          },
          false,
          'explorer/addFeature'
        ),

      removeFeature: (feature: string) =>
        set(
          (state) => {
            const selectedFeatures = state.selectedFeatures.filter((f) => f !== feature);
            return {
              selectedFeatures,
              filteredResults: applyFiltersAndSort(state.results, {
                ...state,
                selectedFeatures,
              }),
              page: 1,
            };
          },
          false,
          'explorer/removeFeature'
        ),

      setFeatures: (features: string[]) =>
        set(
          (state) => ({
            selectedFeatures: features,
            filteredResults: applyFiltersAndSort(state.results, {
              ...state,
              selectedFeatures: features,
            }),
            page: 1,
          }),
          false,
          'explorer/setFeatures'
        ),

      clearFeatures: () =>
        set(
          (state) => ({
            selectedFeatures: [],
            filteredResults: applyFiltersAndSort(state.results, {
              ...state,
              selectedFeatures: [],
            }),
            page: 1,
          }),
          false,
          'explorer/clearFeatures'
        ),

      setKeyFilter: (key: string | null) =>
        set({ keyFilter: key, page: 1 }, false, 'explorer/setKeyFilter'),

      setBookFilter: (book: number | null) =>
        set({ bookFilter: book, page: 1 }, false, 'explorer/setBookFilter'),

      setTypeFilter: (type: PieceType | null) =>
        set({ typeFilter: type, page: 1 }, false, 'explorer/setTypeFilter'),

      clearFilters: () =>
        set(
          (state) => ({
            searchQuery: '',
            selectedCategories: [],
            selectedFeatures: [],
            keyFilter: null,
            bookFilter: null,
            typeFilter: null,
            filteredResults: state.results,
            page: 1,
          }),
          false,
          'explorer/clearFilters'
        ),

      setSortBy: (sort: SortOption) =>
        set(
          (state) => ({
            sortBy: sort,
            filteredResults: applyFiltersAndSort(state.results, { ...state, sortBy: sort }),
          }),
          false,
          'explorer/setSortBy'
        ),

      setResults: (results: FeatureInstance[], total?: number) =>
        set(
          (state) => ({
            results,
            filteredResults: applyFiltersAndSort(results, state),
            totalResults: total ?? results.length,
            hasMore: total ? results.length < total : false,
            page: 1,
            error: null,
          }),
          false,
          'explorer/setResults'
        ),

      appendResults: (results: FeatureInstance[]) =>
        set(
          (state) => {
            const newResults = [...state.results, ...results];
            return {
              results: newResults,
              filteredResults: applyFiltersAndSort(newResults, state),
              hasMore: newResults.length < state.totalResults,
            };
          },
          false,
          'explorer/appendResults'
        ),

      setLoading: (loading: boolean) =>
        set({ isLoading: loading }, false, 'explorer/setLoading'),

      setError: (error: string | null) =>
        set({ error, isLoading: false }, false, 'explorer/setError'),

      loadMore: () =>
        set((state) => ({ page: state.page + 1 }), false, 'explorer/loadMore'),

      reset: () => set(initialState, false, 'explorer/reset'),
    }),
    { name: 'ExplorerStore' }
  )
);

// Selectors
export const selectSearchState = (state: ExplorerState) => ({
  query: state.searchQuery,
  isLoading: state.isLoading,
  error: state.error,
});

export const selectFilters = (state: ExplorerState) => ({
  categories: state.selectedCategories,
  features: state.selectedFeatures,
  key: state.keyFilter,
  book: state.bookFilter,
  type: state.typeFilter,
});

export const selectActiveFilters = (state: ExplorerState) => {
  const filters = [];
  if (state.selectedCategories.length > 0)
    filters.push(`${state.selectedCategories.length} categories`);
  if (state.selectedFeatures.length > 0)
    filters.push(`${state.selectedFeatures.length} features`);
  if (state.keyFilter) filters.push(`Key: ${state.keyFilter}`);
  if (state.bookFilter) filters.push(`Book ${state.bookFilter}`);
  if (state.typeFilter) filters.push(state.typeFilter);
  return filters;
};

export const selectResults = (state: ExplorerState) => ({
  items: state.filteredResults,
  total: state.totalResults,
  page: state.page,
  pageSize: state.pageSize,
  hasMore: state.hasMore,
});

export const selectPagination = (state: ExplorerState) => ({
  page: state.page,
  pageSize: state.pageSize,
  totalResults: state.totalResults,
  hasMore: state.hasMore,
  displayStart: (state.page - 1) * state.pageSize + 1,
  displayEnd: Math.min(state.page * state.pageSize, state.filteredResults.length),
});
