import React from 'react';
import { X, Sparkles } from 'lucide-react';

export default function ActiveFilters({
  filters,
  totalElements = 0,
  onRemoveFilter,
  onClearAll,
}) {
  const activeChips = [];

  if (filters.keyword && filters.keyword.trim()) {
    activeChips.push({
      key: 'keyword',
      label: `Search: "${filters.keyword}"`,
    });
  }

  if (filters.category && filters.category.trim() && filters.category !== 'ALL') {
    activeChips.push({
      key: 'category',
      label: `Category: ${filters.category}`,
    });
  }

  if (filters.location && filters.location.trim()) {
    activeChips.push({
      key: 'location',
      label: `Location: ${filters.location}`,
    });
  }

  if (filters.minRating) {
    activeChips.push({
      key: 'minRating',
      label: `Rating: ${filters.minRating}+ ★`,
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      {/* Count Info */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-bold text-stone-900">
          Showing {totalElements} {totalElements === 1 ? 'member' : 'members'}
        </span>
      </div>

      {/* Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-semibold"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter(chip.key)}
                className="hover:text-amber-700 cursor-pointer"
                title={`Remove ${chip.label}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-stone-500 hover:text-amber-700 underline underline-offset-2 ml-1 cursor-pointer transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
