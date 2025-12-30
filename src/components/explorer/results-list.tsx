'use client';

import { InstanceCard } from './instance-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { ResultsListProps, SortOption } from '@/types/explorer';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'piece-asc', label: 'Piece (A-Z)' },
  { value: 'piece-desc', label: 'Piece (Z-A)' },
  { value: 'measure-asc', label: 'Measure (Low-High)' },
  { value: 'measure-desc', label: 'Measure (High-Low)' },
  { value: 'complexity-asc', label: 'Complexity (Low-High)' },
  { value: 'complexity-desc', label: 'Complexity (High-Low)' },
];

export function ResultsList({
  results,
  isLoading,
  sortBy,
  onSortChange,
  onLoadMore,
  hasMore = false,
  totalCount,
}: ResultsListProps) {
  if (isLoading && results.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!isLoading && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No results found
        </h3>
        <p className="text-gray-600 max-w-md">
          Try adjusting your search terms or filters to find what you're looking
          for.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with sort and count */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="text-sm text-gray-600">
          {totalCount} {totalCount === 1 ? 'result' : 'results'} found
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-gray-600">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.map((instance) => (
          <InstanceCard
            key={instance.id}
            instance={instance}
            onClick={() => {
              window.location.href = `/explorer/instance/${instance.id}`;
            }}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onLoadMore}
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && results.length > 0 && (
        <div className="space-y-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
