import React from 'react';
import { Search, MapPin, Star, RotateCcw, Filter } from 'lucide-react';

export const CATEGORIES = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'Technology', label: 'Technology' },
  { id: 'Languages', label: 'Languages' },
  { id: 'Arts & Design', label: 'Arts & Design' },
  { id: 'Academics', label: 'Academics' },
  { id: 'Trades & Practical', label: 'Trades & Practical' },
  { id: 'Health & Wellness', label: 'Health & Wellness' },
];

export const RATING_OPTIONS = [
  { value: '', label: 'Any Rating' },
  { value: '4.5', label: '4.5 & up' },
  { value: '4.0', label: '4.0 & up' },
  { value: '3.0', label: '3.0 & up' },
];

export const SORT_OPTIONS = [
  { value: 'RATING_DESC', label: 'Highest Rated' },
  { value: 'NEWEST', label: 'Newest Members' },
  { value: 'NAME_ASC', label: 'Name (A–Z)' },
];

export default function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  className = '',
}) {
  const currentCategory = filters.category || 'ALL';
  const currentRating = filters.minRating !== null && filters.minRating !== undefined ? String(filters.minRating) : '';
  const currentSort = filters.sortBy || 'RATING_DESC';

  const handleCategoryClick = (catId) => {
    onFilterChange({
      ...filters,
      category: catId === 'ALL' ? '' : catId,
      page: 0,
    });
  };

  const handleLocationChange = (e) => {
    onFilterChange({
      ...filters,
      location: e.target.value,
      page: 0,
    });
  };

  const handleRatingChange = (val) => {
    onFilterChange({
      ...filters,
      minRating: val ? Number(val) : null,
      page: 0,
    });
  };

  const handleSortChange = (e) => {
    onFilterChange({
      ...filters,
      sortBy: e.target.value,
      page: 0,
    });
  };

  const hasActiveFilters = Boolean(
    (filters.category && filters.category !== 'ALL') ||
      filters.location ||
      filters.minRating ||
      filters.keyword
  );

  return (
    <aside
      className={`bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-6 ${className}`}
    >
      {/* Header with Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-600" />
          <h2 className="text-base font-bold text-stone-900">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
          Skill Category
        </label>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => {
            const isSelected =
              (cat.id === 'ALL' && (!filters.category || filters.category === 'ALL')) ||
              filters.category === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-50 hover:text-amber-700'
                }`}
              >
                <span>{cat.label}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <label
          htmlFor="location-filter"
          className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2"
        >
          Location / City
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            id="location-filter"
            type="text"
            placeholder="e.g. Seattle, Remote..."
            value={filters.location || ''}
            onChange={handleLocationChange}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50/50"
          />
        </div>
      </div>

      {/* Minimum Rating Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
          Minimum Rating
        </label>
        <div className="space-y-1.5">
          {RATING_OPTIONS.map((opt) => {
            const isSelected = currentRating === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex items-center justify-between px-3 py-1.5 rounded-xl cursor-pointer text-xs font-medium transition-colors ${
                  isSelected ? 'bg-amber-50 text-amber-900 font-bold' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="minRating"
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => handleRatingChange(opt.value)}
                    className="text-amber-600 focus:ring-amber-500 rounded-full cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </div>
                {opt.value && (
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3 h-3 fill-amber-400" />
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <label
          htmlFor="sort-by"
          className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2"
        >
          Sort Members By
        </label>
        <select
          id="sort-by"
          value={currentSort}
          onChange={handleSortChange}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50/50 cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
