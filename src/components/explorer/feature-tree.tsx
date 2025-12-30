'use client';

import { useState } from 'react';
import type { FeatureTreeProps, FeatureCategoryNode } from '@/types/explorer';
import { FEATURE_CATEGORY_LABELS } from '@/types/explorer';
import { Badge } from '@/components/ui/badge';

export function FeatureTree({
  categories,
  selectedCategories,
  onCategorySelect,
  onFeatureSelect,
}: FeatureTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const renderNode = (node: FeatureCategoryNode, level: number = 0) => {
    const isExpanded = expandedCategories.has(node.category);
    const isSelected = selectedCategories.includes(node.category);

    return (
      <div key={node.category} className="select-none">
        <button
          onClick={() => {
            toggleCategory(node.category);
            onCategorySelect(node.category);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors ${
            isSelected ? 'bg-blue-50 text-blue-700 font-medium' : ''
          }`}
          style={{ paddingLeft: `${level * 12 + 12}px` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-400 w-4">
              {node.features.length > 0 || node.subcategories ? (
                isExpanded ? (
                  '▼'
                ) : (
                  '▶'
                )
              ) : (
                ''
              )}
            </span>
            <span>{FEATURE_CATEGORY_LABELS[node.category]}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {node.count}
          </Badge>
        </button>

        {isExpanded && (
          <div className="ml-2">
            {node.features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => onFeatureSelect(feature.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                style={{ paddingLeft: `${(level + 1) * 12 + 12}px` }}
              >
                <span className="truncate">{feature.name}</span>
              </button>
            ))}
            {node.subcategories?.map((subNode) =>
              renderNode(subNode, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {categories.map((node) => renderNode(node))}
    </div>
  );
}
