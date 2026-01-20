'use client';

import { useState, useCallback } from 'react';
import { SearchBar } from './search-bar';
import { FilterPanel } from './filter-panel';
import { ResultsList } from './results-list';
import type {
  ExplorerViewProps,
  ExplorerFilters,
  SortOption,
  FeatureInstanceWithContext,
  SearchResult,
} from '@/types/explorer';
import type { FeatureCategory } from '@/types/database';

// Call the actual search API
async function searchFeatures(
  query: string,
  filters: ExplorerFilters,
  sortBy: SortOption,
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResult> {
  const params = new URLSearchParams();

  if (query) params.set('q', query);
  if (filters.categories.length > 0) {
    params.set('categories', filters.categories.join(','));
  }
  if (filters.keyFilter) params.set('key', filters.keyFilter);
  if (filters.modeFilter) params.set('mode', filters.modeFilter);
  if (filters.bookFilter) params.set('book', String(filters.bookFilter));
  if (filters.typeFilter) params.set('type', filters.typeFilter);
  params.set('sort', sortBy);
  params.set('limit', String(pageSize));
  params.set('offset', String((page - 1) * pageSize));

  const response = await fetch(`/api/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  return response.json();
}

export function ExplorerView({ features, categories }: ExplorerViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ExplorerFilters>({
    categories: [],
    keyFilter: null,
    modeFilter: null,
    bookFilter: null,
    typeFilter: null,
  });
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [results, setResults] = useState<FeatureInstanceWithContext[]>([]);
  const [facets, setFacets] = useState<SearchResult['facets']>();
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const performSearch = useCallback(async (page: number = 1, append: boolean = false) => {
    setIsLoading(true);
    try {
      const result = await searchFeatures(searchQuery, filters, sortBy, page);

      if (append) {
        setResults((prev) => [...prev, ...result.instances]);
      } else {
        setResults(result.instances);
      }

      setFacets(result.facets);
      setTotalCount(result.totalCount);
      setCurrentPage(page);
      setHasMore(result.instances.length === 20 && result.totalCount > page * 20);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters, sortBy]);

  const handleSearch = () => {
    performSearch(1, false);
  };

  const handleLoadMore = () => {
    performSearch(currentPage + 1, true);
  };

  const handleFilterChange = (newFilters: Partial<ExplorerFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Auto-search on filter change
    performSearch(1, false);
  };

  const handleCategoryChange = (categories: FeatureCategory[]) => {
    setFilters((prev) => ({ ...prev, categories }));
    performSearch(1, false);
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      keyFilter: null,
      modeFilter: null,
      bookFilter: null,
      typeFilter: null,
    });
    performSearch(1, false);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    performSearch(1, false);
  };

  // Generate suggestions based on feature names
  const suggestions = searchQuery
    ? features
        .filter((f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
        .map((f) => f.name)
    : [];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <FilterPanel
        categories={categories}
        selectedCategories={filters.categories}
        onCategoryChange={handleCategoryChange}
        keyFilter={filters.keyFilter}
        modeFilter={filters.modeFilter}
        bookFilter={filters.bookFilter}
        typeFilter={filters.typeFilter}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        facets={facets}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search header */}
        <div className="border-b border-gray-200 bg-white p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Explorer
            </h1>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              suggestions={suggestions}
              isLoading={isLoading}
            />
            <p className="text-sm text-gray-600 mt-2">
              Search across {features.length} musical features in the Well-Tempered Clavier
            </p>
          </div>
        </div>

        {/* Results area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto p-6">
            <ResultsList
              results={results}
              isLoading={isLoading}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              totalCount={totalCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
