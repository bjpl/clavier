'use client';

import { FeatureTree } from './feature-tree';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { FilterPanelProps, FeatureCategoryNode } from '@/types/explorer';
import { WTC_KEYS } from '@/types/explorer';
import type { FeatureCategory, PieceType } from '@/types/database';

export function FilterPanel({
  categories,
  selectedCategories,
  onCategoryChange,
  keyFilter,
  modeFilter,
  bookFilter,
  typeFilter,
  onFilterChange,
  onClearFilters,
  facets,
}: FilterPanelProps) {
  // Build category tree structure
  const categoryTree: FeatureCategoryNode[] = categories.map((cat) => ({
    category: cat,
    features: [],
    count: facets?.categories[cat] || 0,
  }));

  const handleCategorySelect = (category: FeatureCategory) => {
    const newSelected = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    onCategoryChange(newSelected);
  };

  const handleFeatureSelect = (featureId: string) => {
    // Navigate to feature detail page
    window.location.href = `/explorer/feature/${featureId}`;
  };

  const activeFilterCount =
    selectedCategories.length +
    (keyFilter ? 1 : 0) +
    (modeFilter ? 1 : 0) +
    (bookFilter ? 1 : 0) +
    (typeFilter ? 1 : 0);

  // Get unique key tonics from WTC_KEYS
  const uniqueKeys = [...new Set(WTC_KEYS.map((k) => k.key))];

  return (
    <div className="w-64 h-full overflow-y-auto bg-gray-50 border-r border-gray-200">
      <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <Badge variant="default">{activeFilterCount}</Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="w-full"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Categories */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Categories
          </h3>
          <FeatureTree
            categories={categoryTree}
            selectedCategories={selectedCategories}
            onCategorySelect={handleCategorySelect}
            onFeatureSelect={handleFeatureSelect}
          />
        </div>

        <Separator />

        {/* Key Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Key</h3>
          <select
            value={keyFilter || ''}
            onChange={(e) =>
              onFilterChange({ keyFilter: e.target.value || null })
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All keys</option>
            {uniqueKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <Separator />

        {/* Mode Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Mode</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={modeFilter === null}
                onChange={() => onFilterChange({ modeFilter: null })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Both</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={modeFilter === 'MAJOR'}
                onChange={() => onFilterChange({ modeFilter: 'MAJOR' })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Major</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={modeFilter === 'MINOR'}
                onChange={() => onFilterChange({ modeFilter: 'MINOR' })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Minor</span>
            </label>
          </div>
        </div>

        <Separator />

        {/* Book Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Book</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="book"
                checked={bookFilter === null}
                onChange={() => onFilterChange({ bookFilter: null })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">
                Both{facets ? ` (${Object.values(facets.books).reduce((a, b) => a + b, 0)})` : ''}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="book"
                checked={bookFilter === 1}
                onChange={() => onFilterChange({ bookFilter: 1 })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">
                Book I{facets?.books['1'] ? ` (${facets.books['1']})` : ''}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="book"
                checked={bookFilter === 2}
                onChange={() => onFilterChange({ bookFilter: 2 })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">
                Book II{facets?.books['2'] ? ` (${facets.books['2']})` : ''}
              </span>
            </label>
          </div>
        </div>

        <Separator />

        {/* Type Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Type</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={typeFilter === null}
                onChange={() => onFilterChange({ typeFilter: null })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">
                Both{facets ? ` (${Object.values(facets.types).reduce((a, b) => a + b, 0)})` : ''}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={typeFilter === 'PRELUDE'}
                onChange={() =>
                  onFilterChange({ typeFilter: 'PRELUDE' as PieceType })
                }
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">
                Preludes{facets?.types.PRELUDE ? ` (${facets.types.PRELUDE})` : ''}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={typeFilter === 'FUGUE'}
                onChange={() =>
                  onFilterChange({ typeFilter: 'FUGUE' as PieceType })
                }
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">
                Fugues{facets?.types.FUGUE ? ` (${facets.types.FUGUE})` : ''}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
